"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowsClockwise,
  Code,
  Copy,
  LinkSimple,
  Play,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  GithubLogo,
  TreeStructure,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ReceiptV2 } from "cool-nwc";
import type { CaptureStats } from "cool-nwc/phala";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ReceiptView } from "@/components/receipt-view";
import { VerdictCard } from "@/components/verdict-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { setHash, useHash } from "@/hooks/use-hash";
import { CONSOLE_SECTIONS, sectionOf } from "@/lib/console-sections";
import { COOL_SDK_URL, COOL_USAGE, REPO_URL, sourceUrl, type CoolMetric } from "@/lib/cool-usage";
import type { DisclosureRequest, Entry, Workspace } from "@/lib/ledger";
import { HIGH_VALUE_THRESHOLD, PAYMENT_POLICY } from "@/lib/policy";
import { verifyReceipt, type PinCheck, type TrustAnchor } from "@/lib/trust";
import { ProofLane, ProofLaneBlockedError, type Vault } from "@/sdk/prooflane";

const SESSION_KEY = "prooflane:session";
type Session = { workspaceId: string; name: string; apiKey: string };
type Stats = {
  workspace: Workspace;
  counters: Record<string, number>;
  log_id: string;
  log_size: number;
  durable: boolean;
  capture: CaptureStats | null;
};
type Row = Entry & { receipt: ReceiptV2; verdict: Awaited<ReturnType<typeof verifyReceipt>>["verdict"]; pin: PinCheck | null };
type PaymentArgs = {
  amount: number;
  currency: string;
  beneficiary: string;
  account: string;
  approval_id: string;
  approvers: string[];
};

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const vaultKey = (recordId: string) => `prooflane:vault:${recordId}`;

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    toast.error("Browser storage is unavailable; the session will not persist");
  }
  window.dispatchEvent(new Event("storage"));
}
function readVault(recordId: string): Vault | null {
  try {
    return JSON.parse(localStorage.getItem(vaultKey(recordId)) ?? "null");
  } catch {
    return null;
  }
}

type Snapshot = { stats: Stats; rows: Row[]; requests: DisclosureRequest[]; trust: TrustAnchor };

async function snapshot(client: ProofLane): Promise<Snapshot> {
  const [stats, ledger, reqs, trust] = await Promise.all([
    client.request<Stats>("/api/v1/stats"),
    client.request<{ entries: (Entry & { receipt: ReceiptV2 })[] }>("/api/v1/receipts"),
    client.request<{ requests: DisclosureRequest[] }>("/api/v1/disclosure-requests"),
    fetch("/api/keys").then((r) => r.json() as Promise<TrustAnchor>),
  ]);
  // Every ledger row is re-verified in this browser against the pinned keys.
  const rows = await Promise.all(
    ledger.entries.map(async (e) => ({ ...e, ...(await verifyReceipt(e.receipt, trust)) }))
  );
  return { stats, rows, requests: reqs.requests, trust };
}

export default function ConsolePage() {
  const raw = useSyncExternalStore(subscribe, readSession, () => null);
  const session = useMemo(() => (raw ? (JSON.parse(raw) as Session) : null), [raw]);
  return session ? <WorkspaceConsole session={session} /> : <Onboarding />;
}

/* ── onboarding ───────────────────────────────────────────────────────── */

function Onboarding() {
  const [name, setName] = useState("Northstar Payments");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      saveSession({ workspaceId: data.workspace.id, name: data.workspace.name, apiKey: data.apiKey });
      toast.success("Workspace created. Your API key is stored in this browser — copy it from the Integrate tab.");
    } catch (e) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  async function signIn() {
    setBusy(true);
    try {
      const stats = await new ProofLane({ apiKey, agent: "console" }).request<Stats>("/api/v1/stats");
      saveSession({ workspaceId: stats.workspace.id, name: stats.workspace.name, apiKey });
    } catch (e) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">ProofLane Console</h1>
        <p className="text-sm text-muted-foreground">
          Put an evidence gateway in front of your agent&apos;s consequential tools.
          Every call is policy-checked and sealed into a CooL receipt before it runs.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a workspace</CardTitle>
            <CardDescription>Get an API key and a private transparency log.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
                <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button onClick={create} disabled={busy || !name.trim()}>
              {busy && <Spinner data-icon="inline-start" />}
              Create workspace
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Use an API key</CardTitle>
            <CardDescription>Open an existing workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="api-key">API key</FieldLabel>
                <Input
                  id="api-key"
                  type="password"
                  className="font-mono"
                  placeholder="pl_live_…"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={signIn} disabled={busy || !apiKey.trim()}>
              Open workspace
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/* ── workspace ────────────────────────────────────────────────────────── */

function WorkspaceConsole({ session }: { session: Session }) {
  const client = useMemo(
    () =>
      new ProofLane({
        apiKey: session.apiKey,
        agent: "payments-agent",
        software: { name: "payments-agent", version: "2.0.0" },
        onReceipt: (receipt, vault) => {
          try {
            localStorage.setItem(vaultKey(receipt.record.record_id), JSON.stringify(vault));
          } catch {}
        },
      }),
    [session]
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [requests, setRequests] = useState<DisclosureRequest[]>([]);
  const [trust, setTrust] = useState<TrustAnchor | null>(null);
  const [loading, setLoading] = useState(false);
  const section = sectionOf(useHash());

  const apply = useCallback((data: Snapshot) => {
    setStats(data.stats);
    setRows(data.rows);
    setRequests(data.requests);
    setTrust(data.trust);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      apply(await snapshot(client));
    } catch (e) {
      toast.error(message(e));
    } finally {
      setLoading(false);
    }
  }, [client, apply]);

  useEffect(() => {
    snapshot(client).then(apply, (e) => toast.error(message(e)));
  }, [client, apply]);

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{session.name}</h1>
          <span className="font-mono text-xs text-muted-foreground">{session.workspaceId}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {stats && (
            <StatusBadge status={stats.durable ? "neutral" : "simulated"}>
              {stats.durable ? "durable ledger" : "in-memory ledger"}
            </StatusBadge>
          )}
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Spinner data-icon="inline-start" /> : <ArrowsClockwise data-icon="inline-start" />}
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => saveSession(null)}>
            <SignOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </section>

      <Tabs value={section} onValueChange={setHash}>
        <TabsList className="h-auto flex-wrap self-center">
          {CONSOLE_SECTIONS.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
              {s.id === "ledger" && ` (${rows.length})`}
              {s.id === "auditors" && pending ? ` (${pending})` : ""}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <Overview stats={stats} rows={rows} trust={trust} />
        </TabsContent>
        <TabsContent value="cool">
          <CoolUsagePanel stats={stats} rows={rows} trust={trust} />
        </TabsContent>
        <TabsContent value="run">
          <Playground client={client} onDone={refresh} />
        </TabsContent>
        <TabsContent value="ledger">
          <Ledger rows={rows} />
        </TabsContent>
        <TabsContent value="auditors">
          <Auditors client={client} requests={requests} onDone={refresh} />
        </TabsContent>
        <TabsContent value="integrate">
          <Integrate apiKey={session.apiKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── run agent ────────────────────────────────────────────────────────── */

const PRESETS = [
  { label: "$4,200 · one approver", amount: "4200", approvers: "alice@northstar.example" },
  { label: "$48,200 · one approver", amount: "48200", approvers: "alice@northstar.example" },
  { label: "$48,200 · dual control", amount: "48200", approvers: "alice@northstar.example, bob@northstar.example" },
  { label: "$900 · no approver", amount: "900", approvers: "" },
];

function Playground({ client, onDone }: { client: ProofLane; onDone: () => Promise<void> }) {
  const [amount, setAmount] = useState("48200");
  const [beneficiary, setBeneficiary] = useState("Harbor Freight Logistics Ltd");
  const [approvers, setApprovers] = useState("alice@northstar.example, bob@northstar.example");
  const [approvalId, setApprovalId] = useState("APR-2026-0912-7731");
  const [failTool, setFailTool] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; title: string; detail: string } | null>(null);

  async function run() {
    setBusy(true);
    setOutcome(null);
    // The SDK wraps the bank tool exactly as it would inside a real agent.
    const releasePayment = client.guard(
      "payment.release",
      async (args: PaymentArgs) => {
        if (failTool) throw new Error("bank rail timeout");
        return { status: "released", txn_id: `TXN-${Date.now()}`, amount: args.amount };
      },
      (args) => ({ id: args.approval_id, approvers: args.approvers })
    );
    try {
      const result = await releasePayment({
        amount: Number(amount),
        currency: "USD",
        beneficiary,
        account: "GB29 NWBK 6016 1331 9268 19",
        approval_id: approvalId,
        approvers: approvers.split(",").map((a) => a.trim()).filter(Boolean),
      });
      setOutcome({
        ok: true,
        title: "Payment released",
        detail: `${result.txn_id} — authorization and completion receipts sealed under one execution id.`,
      });
    } catch (e) {
      setOutcome(
        e instanceof ProofLaneBlockedError
          ? {
              ok: false,
              title: `Blocked by policy · ${e.decision.decision}`,
              detail: `Rule ${e.decision.rule ?? "fallback"}. The tool never ran — and the refusal itself is a signed receipt.`,
            }
          : { ok: false, title: "Action did not complete", detail: message(e) }
      );
    } finally {
      setBusy(false);
      void onDone();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>payments-agent · payment.release</CardTitle>
          <CardDescription>
            Synthetic tool call routed through <code className="font-mono">proof.guard()</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmount(p.amount);
                  setApprovers(p.approvers);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Amount (USD)</FieldLabel>
              <Input id="amount" type="number" min={0} className="font-mono" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <FieldDescription>
                ${HIGH_VALUE_THRESHOLD.toLocaleString()} or more requires dual control.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="beneficiary">Beneficiary</FieldLabel>
              <Input id="beneficiary" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="approvers">Approvers (comma-separated)</FieldLabel>
              <Input id="approvers" value={approvers} onChange={(e) => setApprovers(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="approval-id">Approval ID</FieldLabel>
              <Input id="approval-id" className="font-mono" value={approvalId} onChange={(e) => setApprovalId(e.target.value)} />
            </Field>
            <Field orientation="horizontal">
              <Switch id="fail" checked={failTool} onCheckedChange={setFailTool} />
              <FieldLabel htmlFor="fail">Simulate a bank-rail failure after authorization</FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={run} disabled={busy || !approvalId.trim() || amount === ""}>
            {busy ? <Spinner data-icon="inline-start" /> : <Play data-icon="inline-start" />}
            Run agent
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-4">
        {outcome && (
          <Alert variant={outcome.ok ? "default" : "destructive"}>
            {outcome.ok ? <ShieldCheck weight="fill" /> : <ShieldWarning weight="fill" />}
            <AlertTitle>{outcome.title}</AlertTitle>
            <AlertDescription>{outcome.detail}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Active policy</CardTitle>
            <CardDescription className="font-mono">{PAYMENT_POLICY.id} · strictest rule wins · fallback {PAYMENT_POLICY.fallback}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Why</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAYMENT_POLICY.rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs">{rule.id}</TableCell>
                    <TableCell>
                      <StatusBadge status={rule.decision === "approved" ? "neutral" : "invalid"}>{rule.decision}</StatusBadge>
                    </TableCell>
                    <TableCell className="min-w-48 whitespace-normal text-muted-foreground">{rule.because}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Evaluated by the CooL policy engine; the decision and policy hash are sealed into every authorization receipt.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/* ── ledger ───────────────────────────────────────────────────────────── */

function Ledger({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Row | null>(null);
  if (!rows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No receipts yet</CardTitle>
          <CardDescription>Run the agent to seal your first receipt.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt ledger</CardTitle>
        <CardDescription>
          Operator index over sealed receipts. Verdicts are recomputed in this browser against the pinned operator keys.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sealed</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Execution</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Verdict</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const ok = row.verdict.ok && (!row.pin || row.pin.ok);
              return (
                <TableRow key={row.record_id} className="cursor-pointer" onClick={() => setSelected(row)}>
                  <TableCell className="font-mono text-xs">{new Date(row.sealed_at).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={/\.(blocked|denied|failed)$/.test(row.type) ? "invalid" : "neutral"}>{row.type}</StatusBadge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.execution_id}</TableCell>
                  <TableCell className="min-w-48 whitespace-normal text-muted-foreground">{row.summary}</TableCell>
                  <TableCell>
                    <StatusBadge status={ok ? "verified" : "invalid"}>{ok ? "valid" : "invalid"}</StatusBadge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.type}</SheetTitle>
                <SheetDescription>{selected.summary}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-4">
                <VerdictCard verdict={selected.verdict} pin={selected.pin} />
                <ReceiptView receipt={selected.receipt} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

/* ── auditors ─────────────────────────────────────────────────────────── */

function Auditors({
  client,
  requests,
  onDone,
}: {
  client: ProofLane;
  requests: DisclosureRequest[];
  onDone: () => Promise<void>;
}) {
  const [label, setLabel] = useState("Dispute PAY-88213");
  const [link, setLink] = useState<string | null>(null);
  const [manual, setManual] = useState<{ request: DisclosureRequest; value: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function createLink() {
    try {
      const { share } = await client.share(label);
      setLink(`${window.location.origin}/share/${share.token}`);
    } catch (e) {
      toast.error(message(e));
    }
  }

  async function decide(request: DisclosureRequest, approve: boolean, value?: string) {
    setBusy(true);
    try {
      if (approve) {
        const stored = value ?? readVault(request.record_id)?.[request.field as keyof Vault];
        if (!stored) {
          setManual({ request, value: "" });
          return;
        }
        await client.approveDisclosure(request.id, stored);
        toast.success(`Disclosed ${request.field} — verified against the sealed commitment`);
      } else {
        await client.denyDisclosure(request.id);
        toast.success("Request denied — the denial is receipted");
      }
      setManual(null);
      await onDone();
    } catch (e) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Evidence room link</CardTitle>
          <CardDescription>
            Share every receipt in this workspace with an auditor, customer, or investigator. They verify in
            their browser, see only commitments, and can request a single field. Links expire in 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="share-label">Label</FieldLabel>
              <Input id="share-label" value={label} onChange={(e) => setLabel(e.target.value)} />
            </Field>
          </FieldGroup>
          {link && (
            <Alert>
              <LinkSimple />
              <AlertTitle>Evidence room ready</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-2">
                <a href={link} target="_blank" rel="noreferrer" className="font-mono break-all">
                  {link}
                </a>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Copy link"
                  onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))}
                >
                  <Copy />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createLink}>
            <LinkSimple data-icon="inline-start" />
            Create link
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disclosure requests</CardTitle>
          <CardDescription>
            Approving sends the plaintext this browser kept for that receipt. ProofLane checks it against the
            sealed commitment before releasing it, and seals the decision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.requester}</TableCell>
                    <TableCell className="font-mono text-xs">{r.field}</TableCell>
                    <TableCell className="font-mono text-xs">{r.record_id}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status === "denied" ? "invalid" : r.status === "approved" ? "verified" : "neutral"}>
                        {r.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => decide(r, true)} disabled={busy}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decide(r, false)} disabled={busy}>
                            Deny
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!manual} onOpenChange={(open) => !open && setManual(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide the original {manual?.request.field}</DialogTitle>
            <DialogDescription>
              This browser has no stored plaintext for that receipt. Paste the exact value your system committed;
              anything else is rejected.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            className="h-32 font-mono text-xs"
            value={manual?.value ?? ""}
            onChange={(e) => manual && setManual({ ...manual, value: e.target.value })}
          />
          <DialogFooter>
            <Button
              onClick={() => manual && decide(manual.request, true, manual.value)}
              disabled={busy || !manual?.value}
            >
              Disclose
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── coverage ─────────────────────────────────────────────────────────── */

function Overview({ stats, rows, trust }: { stats: Stats | null; rows: Row[]; trust: TrustAnchor | null }) {
  const c = stats?.counters ?? {};
  const invalid = rows.filter((r) => !(r.verdict.ok && (!r.pin || r.pin.ok))).length;
  const tiles = [
    ["Attempted actions", c.attempted ?? 0, "reached the gateway", "var(--brand)"],
    ["Authorized", c.authorized ?? 0, "receipt sealed before the tool ran", "var(--chart-1)"],
    ["Blocked by policy", c.blocked ?? 0, "refusal receipted, tool never ran", "var(--chart-2)"],
    ["Completed", c.completed ?? 0, `outcome sealed · ${c.tool_failed ?? 0} tool failures`, "var(--chart-3)"],
    ["Fields disclosed", c.disclosed ?? 0, `${c.shares ?? 0} evidence rooms shared`, "var(--chart-4)"],
    ["Receipts sealed", stats?.log_size ?? 0, "entries in the workspace log", "var(--brand)"],
    ["Seal failures", c.failed ?? 0, "no receipt, no action", "var(--invalid)"],
    ["Invalid receipts", invalid, "of the latest 50, re-verified here", "var(--invalid)"],
  ] as const;
  return (
    <div className="flex flex-col gap-4">
      <GettingStarted stats={stats} />
      {c.failed ? (
        <Alert variant="destructive">
          <ShieldWarning weight="fill" />
          <AlertTitle>Capture loss detected</AlertTitle>
          <AlertDescription>{c.failed} action(s) could not be sealed and were refused.</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, value, hint, color]) => (
          <Card key={label} size="sm" className="border-l-4" style={{ borderLeftColor: color }}>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </div>
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityChart rows={rows} />
        <PolicyChart rows={rows} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <EvidencePlaneCard stats={stats} trust={trust} />
        <RecentActivity rows={rows} />
      </div>
    </div>
  );
}

/* ── integrate ────────────────────────────────────────────────────────── */

/* ── getting started ──────────────────────────────────────────────────── */

function GettingStarted({ stats }: { stats: Stats | null }) {
  const c = stats?.counters ?? {};
  const steps = [
    {
      title: "Watch policy block a payment",
      detail: "Run agent → preset “$48,200 · one approver”. CooL policy escalates it and seals the refusal as a receipt.",
      done: (c.blocked ?? 0) > 0,
      section: "run",
      cta: "Run agent",
    },
    {
      title: "Release under dual control",
      detail: "Preset “$48,200 · dual control”. Authorization and outcome are sealed under one execution id — open them in Ledger.",
      done: (c.completed ?? 0) > 0,
      section: "run",
      cta: "Run agent",
    },
    {
      title: "Share with an auditor",
      detail: "Auditors → Create link. Open it in a private window: every receipt re-verifies there. Request the state field.",
      done: (c.shares ?? 0) > 0,
      section: "auditors",
      cta: "Create link",
    },
    {
      title: "Approve the disclosure",
      detail: "Auditors → Approve. CooL checks the value against the sealed commitment before the auditor sees it.",
      done: (c.disclosed ?? 0) > 0,
      section: "auditors",
      cta: "Review requests",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Getting started</CardTitle>
        <CardDescription>
          {next
            ? "Four steps walk through the whole product. Each one checks itself off from your workspace's real receipts."
            : "All done. See exactly where the CooL SDK ran for each step."}
        </CardDescription>
        <CardAction>
          <StatusBadge status={next ? "neutral" : "verified"}>
            {doneCount}/{steps.length} done
          </StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={cn("flex flex-col gap-2 rounded-lg border p-3", step === next && "border-primary")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs",
                    step.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.done ? <Check weight="bold" /> : i + 1}
                </span>
                <span className="text-sm leading-tight font-medium">{step.title}</span>
              </div>
              <p className="flex-1 text-xs text-muted-foreground">{step.detail}</p>
              <Button size="sm" variant={step === next ? "default" : "outline"} onClick={() => setHash(step.section)}>
                {step.cta}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </li>
          ))}
          <li className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
                5
              </span>
              <span className="text-sm leading-tight font-medium">See where CooL ran</span>
            </div>
            <p className="flex-1 text-xs text-muted-foreground">
              The CooL SDK tab maps every step above to the CooL API that sealed, verified, or disclosed it.
            </p>
            <Button size="sm" variant={next ? "outline" : "default"} onClick={() => setHash("cool")}>
              CooL SDK
              <ArrowRight data-icon="inline-end" />
            </Button>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}

/* ── overview charts & panels ─────────────────────────────────────────── */

const activityConfig = {
  authorized: { label: "Authorized", color: "var(--chart-1)" },
  blocked: { label: "Blocked", color: "var(--chart-2)" },
  outcome: { label: "Outcomes", color: "var(--chart-3)" },
  disclosure: { label: "Disclosure events", color: "var(--chart-4)" },
} satisfies ChartConfig;

type ActivityKind = keyof typeof activityConfig;
const kindOf = (type: string): ActivityKind =>
  type.startsWith("evidence.")
    ? "disclosure"
    : type.endsWith(".blocked")
      ? "blocked"
      : type.endsWith(".authorized")
        ? "authorized"
        : "outcome";

function ActivityChart({ rows }: { rows: Row[] }) {
  const data = useMemo(() => {
    const buckets = new Map<number, Record<ActivityKind, number>>();
    for (const row of rows) {
      const t = Math.floor(new Date(row.sealed_at).getTime() / 600_000) * 600_000;
      const b = buckets.get(t) ?? { authorized: 0, blocked: 0, outcome: 0, disclosure: 0 };
      b[kindOf(row.type)]++;
      buckets.set(t, b);
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .slice(-12)
      .map(([t, b]) => ({ time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...b }));
  }, [rows]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Receipts sealed over time</CardTitle>
        <CardDescription>Latest 50 receipts in 10-minute windows, by what they evidence.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Run the agent to see activity.</p>
        ) : (
          <ChartContainer config={activityConfig} className="aspect-auto h-64 w-full">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {(Object.keys(activityConfig) as ActivityKind[]).map((key, i, all) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="receipts"
                  fill={`var(--color-${key})`}
                  stroke="var(--card)"
                  strokeWidth={2}
                  maxBarSize={24}
                  radius={i === all.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const policyConfig = { count: { label: "Decisions", color: "var(--brand)" } } satisfies ChartConfig;

function PolicyChart({ rows }: { rows: Row[] }) {
  const data = PAYMENT_POLICY.rules.map((rule) => ({
    rule: rule.id,
    count: rows.filter((r) => r.rule === rule.id).length,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy decisions</CardTitle>
        <CardDescription>Which CooL policy rule decided each action.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={policyConfig} className="aspect-auto h-64 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 28 }} accessibilityLayer>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis type="category" dataKey="rule" tickLine={false} axisLine={false} width={64} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function EvidencePlaneCard({ stats, trust }: { stats: Stats | null; trust: TrustAnchor | null }) {
  const signingKey = Object.keys(trust?.key_directory ?? {}).find((k) => k.startsWith("cool-enclave")) ?? "—";
  const capture = stats?.capture;
  const rows = [
    ["Log id", stats?.log_id ?? "—"],
    ["Tree size", String(stats?.log_size ?? 0)],
    ["Signing key", signingKey],
    ["Measurement", trust ? `${trust.measurement.mrtd.slice(4, 20)}…` : "—"],
    ["Capture p50 / p99", capture ? `${capture.p50Ms.toFixed(3)} / ${capture.p99Ms.toFixed(3)} ms` : "—"],
    ["Dropped / high-water", capture ? `${capture.dropped} / ${capture.highWater}` : "—"],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreeStructure size={18} /> Evidence plane
        </CardTitle>
        <CardDescription>CooL runtime backing this workspace.</CardDescription>
        <CardAction>
          <StatusBadge status="simulated">simulated TEE</StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="truncate font-mono text-xs">{v}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ rows }: { rows: Row[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Newest receipts, re-verified in this browser.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No receipts yet.</p>}
        {rows.slice(0, 6).map((row) => {
          const ok = row.verdict.ok && (!row.pin || row.pin.ok);
          return (
            <div key={row.record_id} className="flex items-center gap-3 text-sm">
              <span className="size-2 shrink-0 rounded-full" style={{ background: `var(--chart-${["authorized", "blocked", "outcome", "disclosure"].indexOf(kindOf(row.type)) + 1})` }} />
              <span className="font-mono text-xs">{row.type}</span>
              <span className="hidden truncate text-muted-foreground md:inline">{row.summary}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {new Date(row.sealed_at).toLocaleTimeString()}
              </span>
              <StatusBadge status={ok ? "verified" : "invalid"}>{ok ? "valid" : "invalid"}</StatusBadge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ── where the CooL SDK runs ──────────────────────────────────────────── */

function CoolUsagePanel({ stats, rows, trust }: { stats: Stats | null; rows: Row[]; trust: TrustAnchor | null }) {
  const c = stats?.counters ?? {};
  const passed = rows.filter((r) => r.verdict.ok && (!r.pin || r.pin.ok)).length;
  const values: Record<CoolMetric, string> = {
    sealed: String(stats?.log_size ?? 0),
    evaluated: String(c.attempted ?? 0),
    tree: String(stats?.log_size ?? 0),
    measurement: trust ? `${trust.measurement.mrtd.slice(4, 12)}…` : "—",
    verified: `${passed}/${rows.length}`,
    disclosed: String(c.disclosed ?? 0),
    shares: String(c.shares ?? 0),
    p99: stats?.capture ? `${stats.capture.p99Ms.toFixed(2)} ms` : "—",
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Where CooL runs in this workspace</CardTitle>
          <CardDescription>
            Every trust claim on this page is computed by the CooL SDK (<span className="font-mono">cool-nwc</span>).
            Steps 1–6 run in the gateway, step 7 runs in this browser, step 8 runs when you approve a disclosure. The
            numbers are live for this workspace.
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={COOL_SDK_URL} target="_blank" rel="noreferrer">
                <GithubLogo data-icon="inline-start" />
                CooL SDK
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                Source
              </a>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COOL_USAGE.map((u) => (
          <Card key={u.step} size="sm" className={u.where === "browser" ? "border-t-2 border-t-brand" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                  {u.step}
                </span>
                <StatusBadge status="neutral">{u.where}</StatusBadge>
              </div>
              <CardTitle className="font-mono text-sm">{u.api}</CardTitle>
              <CardDescription className="font-mono text-xs">{u.module}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{values[u.metric]}</span>
                <span className="text-xs text-muted-foreground">{u.metricLabel}</span>
              </div>
              <p className="text-sm text-muted-foreground">{u.purpose}</p>
            </CardContent>
            <CardFooter>
              <a
                href={sourceUrl(u.file)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                {u.file}
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Integrate({ apiKey }: { apiKey: string }) {
  const origin = window.location.origin;
  const snippet = `import { ProofLane } from "./prooflane"; // src/sdk/prooflane.ts

const proof = new ProofLane({
  apiKey: process.env.PROOFLANE_API_KEY!,
  agent: "payments-agent",
  baseUrl: "${origin}",
  onReceipt: (receipt, vault) => store(receipt.record.record_id, vault),
});

// Hand this to your agent instead of the raw tool.
export const releasePayment = proof.guard(
  "payment.release",
  bank.releasePayment,                       // async (args) => result
  (args) => ({ id: args.approval_id, approvers: args.approvers })
);`;
  const curl = `curl -X POST ${origin}/api/v1/actions/authorize \\
  -H "Authorization: Bearer $PROOFLANE_API_KEY" -H "Content-Type: application/json" \\
  -d '{"action":"payment.release","agent":"payments-agent",
       "input":"{\\"amount\\":48200}","approval":{"id":"APR-1","approvers":["alice","bob"]}}'`;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>API key</CardTitle>
          <CardDescription>Stored only in this browser. Keep it server-side in production.</CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(apiKey).then(() => toast.success("API key copied"))}
            >
              <Copy data-icon="inline-start" />
              Copy key
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="font-mono text-xs">{apiKey.slice(0, 12)}••••••••••••{apiKey.slice(-4)}</CardContent>
      </Card>
      {[
        ["Wrap a tool with the SDK", snippet],
        ["Or call the gateway directly", curl],
      ].map(([title, code]) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={18} /> {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{code}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
