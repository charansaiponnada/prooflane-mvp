import { createHash, randomBytes } from "node:crypto";
import { MemoryLog, type ReceiptV2 } from "cool-nwc";
import {
  buildAuditPack,
  CoolTee,
  disclose,
  sealedKeyset,
  type DisclosableField,
  type EvidenceLog,
  type Disclosure,
  type PolicyOutcome,
  type RecordRequest,
} from "cool-nwc/phala";
import { dstack, trustAnchor } from "./gateway";
import { decidePayment, isAllowed, PAYMENT_POLICY, tierOf } from "./policy";
import { durable, getJson, kv, setJson } from "./store";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export type Workspace = { id: string; name: string; created_at: string };

/** Operator-side index row. Never carries payload plaintext. */
export type Entry = {
  record_id: string;
  execution_id: string;
  type: string;
  sealed_at: string;
  summary: string;
  decision?: string;
  rule?: string | null;
  tier?: string;
};

export type DisclosureRequest = {
  id: string;
  workspace: string;
  share: string;
  record_id: string;
  field: DisclosableField;
  requester: string;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  decided_at?: string;
  disclosure?: Disclosure;
  receipts: string[];
};

type Share = {
  token: string;
  workspace: string;
  label: string;
  record_ids: string[];
  created_at: string;
  expires_at: string;
};

const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const id = (prefix: string) => `${prefix}_${randomBytes(8).toString("hex")}`;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const now = () => new Date().toISOString();

function str(value: unknown, name: string, max = 200): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new HttpError(400, `${name} must be a non-empty string of at most ${max} characters`);
  }
  return value;
}

/* ── workspaces & API keys ─────────────────────────────────────────────── */

export async function createWorkspace(body: { name?: unknown }) {
  const workspace: Workspace = { id: id("ws"), name: str(body.name, "name", 80), created_at: now() };
  const apiKey = `pl_live_${randomBytes(24).toString("hex")}`;
  await setJson(`ws:${workspace.id}`, workspace);
  await kv.set(`apikey:${sha256(apiKey)}`, workspace.id);
  return { workspace, apiKey };
}

export async function requireWorkspace(req: Request): Promise<Workspace> {
  const key = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const wsId = key ? await kv.get(`apikey:${sha256(key)}`) : null;
  const workspace = wsId ? await getJson<Workspace>(`ws:${wsId}`) : null;
  if (!workspace) throw new HttpError(401, "missing or invalid API key");
  return workspace;
}

/* ── the evidence plane, one shared transparency log per workspace ─────── */

type Plane = { tee: CoolTee; log: MemoryLog; pending: Uint8Array[] };
const planes = new Map<string, Promise<Plane>>();

async function openPlane(ws: string): Promise<Plane> {
  const logId = `prooflane/${ws}`;
  const keys = await sealedKeyset(dstack);
  const log = new MemoryLog(logId, keys.log);
  const pending: Uint8Array[] = [];
  // Wraps the RFC 6962 tree so every leaf CooL appends can be persisted.
  const recording: EvidenceLog = {
    get size() {
      return log.size;
    },
    append(leaf) {
      pending.push(leaf);
      return log.append(leaf);
    },
    inclusionAuditPath: (i) => log.inclusionAuditPath(i),
    rootHash: () => log.rootHash(),
    buildSTH: (t) => log.buildSTH(t),
  };
  const tee = await CoolTee.connect({ dstack, log: recording, logId, capture: { flushMs: 1 } });
  return { tee, log, pending };
}

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const token = randomBytes(8).toString("hex");
  for (let i = 0; !(await kv.set(key, token, { nx: true, px: 15_000 })); i++) {
    if (i > 200) throw new HttpError(503, "ledger busy, retry");
    await new Promise((r) => setTimeout(r, 50));
  }
  try {
    return await fn();
  } finally {
    // ponytail: get-then-del release is not atomic; a Lua script if lock contention gets real.
    if ((await kv.get(key)) === token) await kv.del(key);
  }
}

/**
 * Seal one event into the workspace's log. Under a lock, the plane first
 * replays leaves other instances appended, so every receipt's inclusion proof
 * is against ONE growing tree rather than a tree per serverless instance.
 */
async function seal(ws: string, request: RecordRequest, entry: Omit<Entry, "record_id" | "execution_id" | "type" | "sealed_at">) {
  return withLock(`lock:${ws}`, async () => {
    if (!planes.has(ws)) planes.set(ws, openPlane(ws));
    try {
      const plane = await planes.get(ws)!;
      const missing = await kv.lrange(`log:${ws}`, plane.log.size, -1);
      for (const leaf of missing) plane.log.append(Buffer.from(leaf, "base64"));
      plane.pending.length = 0;

      const receipt = await plane.tee.record(request);
      await kv.rpush(`log:${ws}`, ...plane.pending.map((b) => Buffer.from(b).toString("base64")));
      plane.pending.length = 0;

      const row: Entry = {
        record_id: receipt.record.record_id,
        execution_id: request.executionId!,
        type: request.type,
        sealed_at: receipt.record.time.issued_at,
        ...entry,
      };
      await setJson(`receipt:${row.record_id}`, receipt);
      await setJson(`entry:${row.record_id}`, row);
      await kv.rpush(`receipts:${ws}`, row.record_id);
      return receipt;
    } catch (error) {
      planes.delete(ws); // local tree may have diverged; rebuild from storage next time
      await kv.hincrby(`stats:${ws}`, "failed", 1);
      throw error;
    }
  });
}

async function receiptOf(recordId: string) {
  const receipt = await getJson<ReceiptV2>(`receipt:${recordId}`);
  if (!receipt) throw new HttpError(404, `no receipt ${recordId}`);
  return receipt;
}

/* ── consequential actions: authorize → side effect → complete ─────────── */

type Execution = {
  workspace: string;
  action: string;
  allowed: boolean;
  authorization: string;
  completion?: string;
};

export async function authorize(ws: Workspace, body: Record<string, unknown>) {
  if (body.action !== "payment.release") {
    throw new HttpError(400, "action must be payment.release (the MVP action class)");
  }
  const agent = str(body.agent, "agent", 80);
  const input = str(body.input, "input", 10_000);
  const approval = (body.approval ?? {}) as { id?: unknown; approvers?: unknown };
  const approvalId = str(approval.id, "approval.id");
  const approvers = Array.isArray(approval.approvers)
    ? approval.approvers.slice(0, 10).map((a) => str(a, "approver", 120))
    : [];
  const software = (body.software ?? {}) as { name?: unknown; version?: unknown };

  let amount: number;
  try {
    amount = Number(JSON.parse(input).amount);
  } catch {
    throw new HttpError(400, "input must be the JSON-encoded tool arguments");
  }
  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, "tool arguments must include a non-negative numeric amount");
  }

  const outcome: PolicyOutcome = decidePayment(agent, amount, approvers);
  const allowed = isAllowed(outcome);
  const executionId = id("exe");
  await kv.hincrby(`stats:${ws.id}`, "attempted", 1);

  const receipt = await seal(
    ws.id,
    {
      type: allowed ? "payment.release.authorized" : "payment.release.blocked",
      executionId,
      metadata: {
        action: "payment.release",
        agent,
        decision: outcome.decision,
        rule: outcome.rule,
        considered: outcome.considered,
        policy_id: PAYMENT_POLICY.id,
        policy_hash: outcome.policy_hash,
        approvers: [...new Set(approvers)],
      },
      // Plaintext is committed with fresh salts inside the plane and discarded.
      payloads: { input, state: approvalId },
      software: {
        name: typeof software.name === "string" ? software.name.slice(0, 80) : agent,
        version: typeof software.version === "string" ? software.version.slice(0, 40) : "unknown",
        digest: null,
      },
    },
    {
      summary: allowed
        ? `Authorized by ${outcome.rule}`
        : `Blocked: ${outcome.decision} (${outcome.rule ?? "no rule matched"})`,
      decision: outcome.decision,
      rule: outcome.rule,
      tier: tierOf(amount),
    }
  );

  await kv.hincrby(`stats:${ws.id}`, allowed ? "authorized" : "blocked", 1);
  await setJson(`exec:${executionId}`, {
    workspace: ws.id,
    action: "payment.release",
    allowed,
    authorization: receipt.record.record_id,
  } satisfies Execution);
  return { executionId, allowed, decision: outcome, receipt };
}

export async function complete(ws: Workspace, executionId: string, body: Record<string, unknown>) {
  const exec = await getJson<Execution>(`exec:${executionId}`);
  if (!exec || exec.workspace !== ws.id) throw new HttpError(404, "unknown execution");
  if (!exec.allowed) throw new HttpError(409, "execution was blocked by policy; nothing to complete");
  if (exec.completion) throw new HttpError(409, "execution already completed");
  const output = str(body.output, "output", 10_000);
  const failed = body.status === "failed";

  const receipt = await seal(
    ws.id,
    {
      type: failed ? "payment.release.failed" : "payment.release.completed",
      executionId,
      metadata: { action: exec.action, authorization_record: exec.authorization, status: failed ? "failed" : "succeeded" },
      payloads: { output },
    },
    { summary: failed ? "Tool call failed after authorization" : "Side effect completed" }
  );
  await setJson(`exec:${executionId}`, { ...exec, completion: receipt.record.record_id });
  await kv.hincrby(`stats:${ws.id}`, failed ? "tool_failed" : "completed", 1);
  return { executionId, receipt };
}

/* ── ledger & coverage ─────────────────────────────────────────────────── */

async function entriesOf(ids: string[]) {
  const rows = await kv.mget(ids.map((r) => `entry:${r}`));
  const receipts = await kv.mget(ids.map((r) => `receipt:${r}`));
  return rows.flatMap((row, i) =>
    row && receipts[i] ? [{ ...(JSON.parse(row) as Entry), receipt: JSON.parse(receipts[i]!) as ReceiptV2 }] : []
  );
}

export async function listEntries(ws: Workspace, limit = 50) {
  const ids = await kv.lrange(`receipts:${ws.id}`, -limit, -1);
  return { entries: (await entriesOf(ids)).reverse() };
}

export async function stats(ws: Workspace) {
  const counters = await kv.hgetall(`stats:${ws.id}`);
  const plane = planes.has(ws.id) ? await planes.get(ws.id)!.catch(() => null) : null;
  return {
    workspace: ws,
    counters: Object.fromEntries(Object.entries(counters ?? {}).map(([k, v]) => [k, Number(v)])),
    log_size: await kv.llen(`log:${ws.id}`),
    durable,
    // Measured by CooL on this serverless instance only.
    capture: plane?.tee.stats() ?? null,
  };
}

/* ── auditor share links & receipted disclosures ───────────────────────── */

export async function createShare(ws: Workspace, body: Record<string, unknown>) {
  const all = await kv.lrange(`receipts:${ws.id}`, 0, -1);
  const requested = Array.isArray(body.record_ids) ? body.record_ids.filter((r): r is string => typeof r === "string") : null;
  const record_ids = requested ? all.filter((r) => requested.includes(r)) : all;
  if (!record_ids.length) throw new HttpError(400, "nothing to share yet — seal a receipt first");
  const share: Share = {
    token: randomBytes(18).toString("base64url"),
    workspace: ws.id,
    label: typeof body.label === "string" && body.label.trim() ? body.label.slice(0, 120) : "Evidence room",
    record_ids,
    created_at: now(),
    expires_at: new Date(Date.now() + SHARE_TTL_MS).toISOString(),
  };
  await kv.set(`share:${share.token}`, JSON.stringify(share), { px: SHARE_TTL_MS });
  await kv.rpush(`shares:${ws.id}`, share.token);
  return { share };
}

async function shareOf(token: string) {
  const share = await getJson<Share>(`share:${token}`);
  if (!share || share.expires_at < now()) throw new HttpError(404, "share link not found or expired");
  return share;
}

async function requestsOf(key: string) {
  const ids = await kv.lrange(key, 0, -1);
  const rows = await kv.mget(ids.map((r) => `dreq:${r}`));
  return rows.flatMap((r) => (r ? [JSON.parse(r) as DisclosureRequest] : [])).reverse();
}

export async function publicShare(token: string) {
  const share = await shareOf(token);
  const workspace = await getJson<Workspace>(`ws:${share.workspace}`);
  const entries = await entriesOf(share.record_ids);
  const trust = await trustAnchor();
  return {
    label: share.label,
    workspace: workspace?.name ?? "Unknown workspace",
    created_at: share.created_at,
    expires_at: share.expires_at,
    entries: entries.map(({ receipt, ...row }) => ({ ...row, receipt })),
    pack: buildAuditPack(
      entries.map((e) => e.receipt),
      { subject: `${workspace?.name ?? share.workspace} · ${share.label}`, trustedKeys: trust.key_directory }
    ),
    trust,
    requests: await requestsOf(`dreqs:share:${token}`),
  };
}

const FIELDS = ["input", "output", "state"] as const;

export async function requestDisclosure(token: string, body: Record<string, unknown>) {
  const share = await shareOf(token);
  const recordId = str(body.record_id, "record_id", 60);
  if (!share.record_ids.includes(recordId)) throw new HttpError(404, "record is not in this evidence room");
  const field = body.field as (typeof FIELDS)[number];
  if (!FIELDS.includes(field)) throw new HttpError(400, "field must be input, output or state");
  const receipt = await receiptOf(recordId);
  if (receipt.record.schema !== "cool.evidence.v1" || !receipt.record.event.commitments[field]) {
    throw new HttpError(400, `record has no committed ${field}`);
  }
  const requester = str(body.requester, "requester", 120);
  const reason = str(body.reason, "reason", 1000);

  const request: DisclosureRequest = {
    id: id("dreq"),
    workspace: share.workspace,
    share: token,
    record_id: recordId,
    field,
    requester,
    status: "pending",
    requested_at: now(),
    receipts: [],
  };
  const sealed = await seal(
    share.workspace,
    {
      type: "evidence.disclosure.requested",
      executionId: request.id,
      metadata: { request_id: request.id, record_id: recordId, field, requester },
      payloads: { input: reason },
    },
    { summary: `${requester} requested ${field} of ${recordId}` }
  );
  request.receipts.push(sealed.record.record_id);
  await setJson(`dreq:${request.id}`, request);
  await kv.rpush(`dreqs:${share.workspace}`, request.id);
  await kv.rpush(`dreqs:share:${token}`, request.id);
  return { request };
}

export async function listRequests(ws: Workspace) {
  return { requests: await requestsOf(`dreqs:${ws.id}`) };
}

export async function decideRequest(ws: Workspace, requestId: string, body: Record<string, unknown>) {
  const request = await getJson<DisclosureRequest>(`dreq:${requestId}`);
  if (!request || request.workspace !== ws.id) throw new HttpError(404, "unknown disclosure request");
  if (request.status !== "pending") throw new HttpError(409, `request already ${request.status}`);
  const approve = body.decision === "approve";

  let disclosure: Disclosure | undefined;
  if (approve) {
    const value = str(body.value, "value", 10_000);
    try {
      // CooL refuses to build a disclosure that does not open the sealed commitment.
      disclosure = disclose(await receiptOf(request.record_id), request.field, value);
    } catch (error) {
      throw new HttpError(422, error instanceof Error ? error.message : String(error));
    }
  }
  const sealed = await seal(
    ws.id,
    {
      type: approve ? "evidence.disclosure.approved" : "evidence.disclosure.denied",
      executionId: request.id,
      metadata: { request_id: request.id, record_id: request.record_id, field: request.field, commitment: disclosure?.commitment ?? null },
    },
    { summary: `${approve ? "Disclosed" : "Denied"} ${request.field} of ${request.record_id}` }
  );
  const updated: DisclosureRequest = {
    ...request,
    status: approve ? "approved" : "denied",
    decided_at: now(),
    disclosure,
    receipts: [...request.receipts, sealed.record.record_id],
  };
  await setJson(`dreq:${request.id}`, updated);
  await kv.hincrby(`stats:${ws.id}`, approve ? "disclosed" : "denied", 1);
  return { request: updated };
}

/* ── route helper ──────────────────────────────────────────────────────── */

export async function handle(fn: () => Promise<unknown>) {
  try {
    return Response.json(await fn());
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status });
  }
}

export async function jsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
  } catch {}
  throw new HttpError(400, "request body must be a JSON object");
}
