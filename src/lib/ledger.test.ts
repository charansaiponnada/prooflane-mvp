import { expect, it } from "vitest";
import { verifyAuditPack, verifyDisclosure } from "cool-nwc/phala";
import {
  authorize,
  complete,
  createShare,
  createWorkspace,
  decideRequest,
  listEntries,
  publicShare,
  requestDisclosure,
  requireWorkspace,
} from "./ledger";
import { verifyReceipt } from "./trust";

const payment = (amount: number) => JSON.stringify({ amount, beneficiary: "Harbor Freight Logistics Ltd" });

it("gates, seals, shares and discloses through one shared log", async () => {
  const { workspace, apiKey } = await createWorkspace({ name: "Northstar" });
  const req = new Request("http://x", { headers: { authorization: `Bearer ${apiKey}` } });
  const ws = await requireWorkspace(req);
  expect(ws.id).toBe(workspace.id);
  await expect(requireWorkspace(new Request("http://x"))).rejects.toThrow("API key");

  const base = { action: "payment.release", agent: "payments-agent" };
  const single = await authorize(ws, { ...base, input: payment(48200), approval: { id: "APR-1", approvers: ["alice"] } });
  expect(single.allowed).toBe(false);
  expect(single.decision.decision).toBe("escalate");
  expect(single.receipt.record.schema === "cool.evidence.v1" && single.receipt.record.event.type).toBe("payment.release.blocked");
  await expect(complete(ws, single.executionId, { output: "{}" })).rejects.toThrow("blocked");

  const dual = await authorize(ws, { ...base, input: payment(48200), approval: { id: "APR-2", approvers: ["alice", "bob"] } });
  expect(dual.allowed).toBe(true);
  const done = await complete(ws, dual.executionId, { output: '{"status":"released"}' });

  // One growing RFC 6962 tree, not a tree per receipt.
  expect(done.receipt.inclusion?.tree_size).toBe(3);
  expect(JSON.stringify(done.receipt)).not.toContain("Harbor Freight");

  const { entries } = await listEntries(ws);
  expect(entries.map((e) => e.type)).toEqual([
    "payment.release.completed",
    "payment.release.authorized",
    "payment.release.blocked",
  ]);

  const { share } = await createShare(ws, { label: "Dispute #88213" });
  const room = await publicShare(share.token);
  expect((await verifyAuditPack(room.pack)).ok).toBe(true);
  for (const e of room.entries) {
    const { verdict, pin } = await verifyReceipt(e.receipt, room.trust);
    expect(verdict.ok && pin?.ok).toBe(true);
  }

  const { request } = await requestDisclosure(share.token, {
    record_id: dual.receipt.record.record_id,
    field: "state",
    requester: "auditor@bank.example",
    reason: "Confirm dual-control approval reference",
  });
  await expect(decideRequest(ws, request.id, { decision: "approve", value: "APR-WRONG" })).rejects.toThrow();
  const approved = await decideRequest(ws, request.id, { decision: "approve", value: "APR-2" });
  expect(verifyDisclosure(dual.receipt, approved.request.disclosure!).ok).toBe(true);
  expect(approved.request.receipts).toHaveLength(2);
});
