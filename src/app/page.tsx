"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  DoorOpen,
  DownloadSimple,
  Eye,
  Export,
  PencilSimple,
  Pulse,
  Robot,
  ShieldWarning,
  Terminal,
} from "@phosphor-icons/react";
import type { ReceiptV2, VerdictV2 } from "cool-nwc";
import {
  buildAuditPack,
  disclose,
  verifyDisclosure,
  type Disclosure,
  type DisclosureVerdict,
} from "cool-nwc/phala";
import { verifyReceipt, type PinCheck, type TrustAnchor } from "@/lib/trust";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  APPROVAL_ID,
  downloadJson,
  PAYMENT,
  SOFTWARE,
  STORAGE_KEY,
  tamperAmount,
  type CaptureStats,
  type Vault,
} from "@/lib/receipt";

type Tampered = ReturnType<typeof tamperAmount> & {
  verdict: VerdictV2;
  pin: PinCheck | null;
  disclosureVerdict: DisclosureVerdict;
};

const TRACE = `span agent.run            northstar-payment-agent 1.4.2
  span gen_ai.chat        model=gpt-x  tokens=1832
  span tool.call          name=payments.release
    gen_ai.tool.call.arguments = {
      "beneficiary": "${PAYMENT.beneficiary}",
      "account": "${PAYMENT.account}",
      "amount": "${PAYMENT.amount}", "currency": "USD"
    }
    approval.id = ${APPROVAL_ID}
  span tool.result        status=released`;

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-mono text-2xl tabular-nums">{value}</CardTitle>
        <CardDescription className="text-xs">{hint}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function ControlRoomPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptV2 | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [stats, setStats] = useState<CaptureStats | null>(null);
  const [verdict, setVerdict] = useState<VerdictV2 | null>(null);
  const [pin, setPin] = useState<PinCheck | null>(null);
  const [trust, setTrust] = useState<TrustAnchor | null>(null);
  const [receipts, setReceipts] = useState<ReceiptV2[]>([]);
  const [disclosure, setDisclosure] = useState<{
    d: Disclosure;
    v: DisclosureVerdict;
  } | null>(null);
  const [tampered, setTampered] = useState<Tampered | null>(null);

  async function release() {
    setBusy(true);
    setReceipt(null);
    setVerdict(null);
    setDisclosure(null);
    setTampered(null);
    try {
      const res = await fetch("/api/gateway/payment", { method: "POST" });
      const body = await res.json();
      setStats(body.stats);
      if (!res.ok) throw new Error(body.error);
      setReceipt(body.receipt);
      setVault(body.vault);
      setTrust(body.trust);
      setReceipts((prev) => [...prev, body.receipt]);
      const checked = await verifyReceipt(body.receipt, body.trust);
      setVerdict(checked.verdict);
      setPin(checked.pin);
      toast.success("Receipt sealed — payment released");
    } catch (e) {
      toast.error(
        `No receipt, no action — payment blocked: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setBusy(false);
    }
  }

  function discloseApproval() {
    if (!receipt || !vault) return;
    const d = disclose(receipt, "state", vault.state);
    setDisclosure({ d, v: verifyDisclosure(receipt, d) });
  }

  async function tamper() {
    if (!receipt || !vault) return;
    const t = tamperAmount(receipt, vault);
    const checked = await verifyReceipt(t.receipt, trust);
    setTampered({
      ...t,
      ...checked,
      disclosureVerdict: verifyDisclosure(receipt, t.forgedDisclosure),
    });
  }

  function openInVerifier() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ receipt, disclosure: disclosure?.d ?? null, trust })
      );
    } catch {
      toast.error("Could not hand over — copy the receipt JSON instead");
    }
    router.push("/verifier");
  }

  /** A CooL audit pack: every receipt this session, the keys, the pinned measurement. */
  function exportPack() {
    if (!receipt) return;
    const pack = buildAuditPack(receipts, {
      subject: "northstar-payments · payment.release",
      trustedKeys: trust?.key_directory,
      enclave: trust
        ? {
            vendor: receipt.record.runtime.tee_vendor,
            mode: trust.mode,
            app_id: trust.app_id,
            measurement: trust.measurement,
          }
        : null,
    });
    downloadJson(`prooflane-audit-pack-${receipts.length}-receipts.json`, pack);
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">ProofLane Control Room</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          An AI agent releases a payment. ProofLane captures it at the tool
          boundary and seals a portable CooL receipt that anyone can verify
          without the operator&apos;s backend — or its sensitive data.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Step n={1} title="Today's evidence">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Operational trace</CardTitle>
              <CardDescription>What OTel-style tracing captured for this action.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {TRACE}
              </pre>
            </CardContent>
            <CardFooter className="flex-col items-start gap-1">
              <span className="font-medium">Who controls this evidence?</span>
              <span className="text-muted-foreground">
                The operator — its backend, exporter, and retention settings. And
                it contains the account number in plaintext.
              </span>
            </CardFooter>
          </Card>
        </Step>

        <Step n={2} title="Capture through ProofLane">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Robot size={20} /> Northstar payment agent
              </CardTitle>
              <CardDescription>Synthetic data · tool northstar.payments.release</CardDescription>
              <CardAction>
                <StatusBadge status="neutral">
                  <DoorOpen size={14} /> Gateway
                </StatusBadge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono text-2xl font-semibold tabular-nums">$48,200.00</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Beneficiary</span>
                <span className="text-right">{PAYMENT.beneficiary}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Approval ID</span>
                <span className="font-mono">{APPROVAL_ID}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Software</span>
                <span className="font-mono">
                  {SOFTWARE.name}@{SOFTWARE.version}
                </span>
              </div>
              <Field orientation="horizontal">
                <Switch id="sync" checked disabled />
                <FieldLabel htmlFor="sync">
                  Synchronous capture — no receipt, no action
                </FieldLabel>
              </Field>
            </CardContent>
            <CardFooter>
              <Button size="lg" onClick={release} disabled={busy}>
                {busy && <Spinner data-icon="inline-start" />}
                {busy ? "Sealing receipt…" : receipt ? "Release another payment" : "Release $48,200 via ProofLane"}
              </Button>
            </CardFooter>
          </Card>
        </Step>
      </div>

      {receipt && verdict && vault && (
        <>
          <Step n={3} title="Portable receipt, verified independently">
            <div className="grid gap-6 lg:grid-cols-2">
              <ReceiptView receipt={receipt} />
              <VerdictCard
                verdict={verdict}
                pin={pin}
                description="Computed in this browser from receipt bytes, against pinned operator keys and deployment measurement."
              />
            </div>
          </Step>

          <Step n={4} title="Selective disclosure">
            <Card>
              <CardHeader>
                <CardTitle>The reviewer asks for the approval ID — only that.</CardTitle>
                <CardDescription>
                  The operator opens one committed field. Payment details and
                  the tool result stay sealed.
                </CardDescription>
                <CardAction>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye data-icon="inline-start" />
                        Disclose approval ID
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disclose one field</DialogTitle>
                        <DialogDescription>
                          The recipient gets the <span className="font-mono">state</span>{" "}
                          plaintext ({APPROVAL_ID}) and its salt. Once disclosed,
                          this field is no longer private from them.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={discloseApproval}>Disclose</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardAction>
              </CardHeader>
              {disclosure && (
                <CardContent>
                  <Alert variant={disclosure.v.ok ? "default" : "destructive"}>
                    <Eye />
                    <AlertTitle className="flex flex-wrap items-center gap-2">
                      Approval ID <span className="font-mono">{disclosure.d.value}</span>
                      <StatusBadge status={disclosure.v.ok ? "verified" : "invalid"}>
                        {disclosure.v.ok ? "Matches commitment" : "Mismatch"}
                      </StatusBadge>
                    </AlertTitle>
                    <AlertDescription>{disclosure.v.detail}</AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          </Step>

          <Step n={5} title="Tamper attack">
            <Card>
              <CardHeader>
                <CardTitle>Someone edits the receipt: $48,200 → $4,820</CardTitle>
                <CardDescription>
                  The input commitment is recomputed with the original salt so
                  the receipt still looks well-formed.
                </CardDescription>
                <CardAction>
                  <Button variant="destructive" onClick={tamper}>
                    <PencilSimple data-icon="inline-start" />
                    Change the amount
                  </Button>
                </CardAction>
              </CardHeader>
              {tampered && (
                <CardContent>
                  <Tabs defaultValue="tampered">
                    <TabsList>
                      <TabsTrigger value="original">Original · $48,200</TabsTrigger>
                      <TabsTrigger value="tampered">Tampered · $4,820</TabsTrigger>
                    </TabsList>
                    <TabsContent value="original">
                      <VerdictCard verdict={verdict} pin={pin} title="Original receipt" />
                    </TabsContent>
                    <TabsContent value="tampered" className="flex flex-col gap-4">
                      <VerdictCard verdict={tampered.verdict} pin={tampered.pin} title="Tampered receipt" />
                      <Alert variant="destructive">
                        <ShieldWarning weight="fill" />
                        <AlertTitle>Forged disclosure also rejected</AlertTitle>
                        <AlertDescription className="break-all">
                          Claiming the input said $4,820 against the untouched
                          receipt: {tampered.disclosureVerdict.detail}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          </Step>

          <Step n={6} title="Hand over the evidence">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Attempted receipts" value={stats?.attempted ?? 0} hint="since gateway start" />
              <Stat label="Sealed receipts" value={stats?.succeeded ?? 0} hint="payment released" />
              <Stat label="Failed captures" value={stats?.failed ?? 0} hint="payment blocked" />
              <Stat label="Dropped events" value={0} hint="sync path, no queue" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportPack}>
                <Export data-icon="inline-start" />
                Export CooL audit pack ({receipts.length})
              </Button>
              <Button variant="outline" onClick={openInVerifier}>
                <ArrowSquareOut data-icon="inline-start" />
                Open in independent verifier
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadJson("receipt.json", receipt)}
              >
                <DownloadSimple data-icon="inline-start" />
                receipt.json
              </Button>
              {disclosure && (
                <Button
                  variant="outline"
                  onClick={() => downloadJson("disclosure.json", disclosure.d)}
                >
                  <DownloadSimple data-icon="inline-start" />
                  disclosure.json
                </Button>
              )}
            </div>
            <Alert>
              <Terminal />
              <AlertTitle>Don&apos;t trust this website either</AlertTitle>
              <AlertDescription>
                Verify the downloaded receipt with the CooL CLI on your own
                machine:{" "}
                <code className="font-mono text-foreground">
                  npx -p cool-nwc cool verify receipt.json
                </code>
              </AlertDescription>
            </Alert>
            <Alert>
              <Pulse />
              <AlertTitle>Honest boundary</AlertTitle>
              <AlertDescription>
                This receipt proves the integrity of a captured execution
                statement. It does not prove the decision was correct, fair,
                safe, or legal; that every event was captured; that the
                application didn&apos;t lie before capture; or hardware
                security — attestation here is simulated.
              </AlertDescription>
            </Alert>
          </Step>
        </>
      )}
    </div>
  );
}
