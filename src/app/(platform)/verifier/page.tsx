"use client";

import { useState } from "react";
import {
  ArrowSquareIn,
  Eye,
  Export,
  Key,
  ShieldCheck,
  WifiSlash,
} from "@phosphor-icons/react";
import type { ReceiptV2, VerdictV2 } from "cool-nwc";
import {
  coverage,
  verifyAuditPack,
  verifyDisclosure,
  type AuditPack,
  type Coverage,
  type PackVerdict,
} from "cool-nwc/phala";
import { toast } from "sonner";
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, STORAGE_KEY } from "@/lib/receipt";
import { verifyReceipt, type PinCheck, type TrustAnchor } from "@/lib/trust";

type DisclosureResult = { ok: boolean; detail: string; field?: string; value?: string };

type Result =
  | { kind: "receipt"; verdict: VerdictV2; pin: PinCheck | null }
  | {
      kind: "pack";
      pack: PackVerdict;
      records: { id: string; sealedAt: string; verdict: VerdictV2; pin: PinCheck | null }[];
      coverage: Coverage[];
    };

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export default function VerifierPage() {
  const [inputText, setInputText] = useState("");
  const [disclosureText, setDisclosureText] = useState("");
  const [trustText, setTrustText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [disclosure, setDisclosure] = useState<DisclosureResult | null>(null);

  function loadHandoff() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (!saved) throw new Error();
      setInputText(pretty(saved.receipt));
      setDisclosureText(saved.disclosure ? pretty(saved.disclosure) : "");
      if (saved.trust) setTrustText(pretty(saved.trust));
      toast.success("Loaded receipt handed over from the Control Room");
    } catch {
      toast.error("Nothing handed over yet — generate a receipt in the Control Room");
    }
  }

  async function fetchKeys() {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTrustText(pretty(await res.json()));
      toast.success("Pinned the operator's published keys and measurement");
    } catch (e) {
      toast.error(`Could not fetch keys: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function verify() {
    setError(null);
    setResult(null);
    setDisclosure(null);
    let parsed: { schema?: string };
    let trust: TrustAnchor | null = null;
    try {
      parsed = JSON.parse(inputText);
    } catch {
      setError("Input is not valid JSON.");
      return;
    }
    try {
      trust = trustText.trim() ? JSON.parse(trustText) : null;
    } catch {
      setError("Pinned trust material is not valid JSON.");
      return;
    }

    setBusy(true);
    if (parsed?.schema === "cool.audit-pack.v2") {
      const pack = parsed as AuditPack;
      const receipts = pack.records.map((r) => r.receipt);
      const records = await Promise.all(
        pack.records.map(async (r) => ({
          id: r.record_id,
          sealedAt: r.sealed_at,
          ...(await verifyReceipt(r.receipt, trust)),
        }))
      );
      setResult({
        kind: "pack",
        pack: await verifyAuditPack(
          pack,
          trust ? { expectedMeasurement: trust.measurement } : undefined
        ),
        records,
        coverage: coverage(receipts),
      });
    } else {
      setResult({ kind: "receipt", ...(await verifyReceipt(parsed, trust)) });
      if (disclosureText.trim()) {
        try {
          const d = JSON.parse(disclosureText);
          setDisclosure({ ...verifyDisclosure(parsed as ReceiptV2, d), value: d.value });
        } catch (e) {
          setDisclosure({
            ok: false,
            detail: `Could not check disclosure: ${e instanceof Error ? e.message : String(e)}`,
          });
        }
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Independent verifier</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          For the auditor, customer, or investigator. Paste a{" "}
          <span className="font-mono">cool.receipt.v2</span> or a{" "}
          <span className="font-mono">cool.audit-pack.v2</span> and check it
          from its bytes alone.
        </p>
      </section>

      <Alert>
        <WifiSlash />
        <AlertTitle>No operator backend involved in verification</AlertTitle>
        <AlertDescription>
          Every check runs in this browser with the CooL verifier. The only
          optional network call is fetching the operator&apos;s published keys
          once to pin them — you can paste them from any other channel instead.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Evidence input</CardTitle>
            <CardDescription>Receipt or audit pack required; the rest optional.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="receipt-file">Evidence file</FieldLabel>
                <Input
                  id="receipt-file"
                  type="file"
                  accept="application/json,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setInputText(await file.text());
                  }}
                />
              </Field>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="receipt">Receipt or audit pack JSON</FieldLabel>
                <Textarea
                  id="receipt"
                  className="h-48 font-mono text-xs"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='{ "schema": "cool.receipt.v2", ... }'
                  aria-invalid={error ? true : undefined}
                />
                {error && <FieldDescription>{error}</FieldDescription>}
              </Field>
              <Field>
                <FieldLabel htmlFor="disclosure">Disclosure JSON</FieldLabel>
                <Textarea
                  id="disclosure"
                  className="h-24 font-mono text-xs"
                  value={disclosureText}
                  onChange={(e) => setDisclosureText(e.target.value)}
                  placeholder='{ "schema": "cool.disclosure.v1", ... }'
                />
                <FieldDescription>
                  A field the operator chose to open, e.g. the approval ID.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="trust">Pinned operator trust material</FieldLabel>
                <Textarea
                  id="trust"
                  className="h-24 font-mono text-xs"
                  value={trustText}
                  onChange={(e) => setTrustText(e.target.value)}
                  placeholder='{ "key_directory": { ... }, "measurement": { ... } }'
                />
                <FieldDescription>
                  Without it, a receipt is checked only against keys it carries
                  itself. With it, key substitution and code changes are caught.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={verify} disabled={busy || !inputText.trim()}>
              {busy ? <Spinner data-icon="inline-start" /> : <ShieldCheck data-icon="inline-start" />}
              {busy ? "Verifying…" : "Verify"}
            </Button>
            <Button variant="outline" onClick={loadHandoff}>
              <ArrowSquareIn data-icon="inline-start" />
              Load from Control Room
            </Button>
            <Button variant="outline" onClick={fetchKeys}>
              <Key data-icon="inline-start" />
              Pin published keys
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-4">
          {result?.kind === "receipt" && (
            <>
              <VerdictCard
                verdict={result.verdict}
                pin={result.pin}
                description="Computed locally from receipt bytes."
              />
              {disclosure && (
                <Alert variant={disclosure.ok ? "default" : "destructive"}>
                  <Eye />
                  <AlertTitle className="flex flex-wrap items-center gap-2">
                    Disclosure {disclosure.field && <span className="font-mono">{disclosure.field}</span>}
                    <StatusBadge status={disclosure.ok ? "verified" : "invalid"}>
                      {disclosure.ok ? "Matches commitment" : "Mismatch"}
                    </StatusBadge>
                  </AlertTitle>
                  <AlertDescription>
                    {disclosure.value && (
                      <p className="font-mono break-all text-foreground">{disclosure.value}</p>
                    )}
                    <p>{disclosure.detail}</p>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {result?.kind === "pack" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Audit pack verdict</CardTitle>
                  <CardDescription>
                    Every receipt re-verified; the pack&apos;s own summary is ignored.
                  </CardDescription>
                  <CardAction>
                    <StatusBadge
                      status={result.pack.ok && result.records.every((r) => !r.pin || r.pin.ok) ? "verified" : "invalid"}
                      className="px-3 py-1 text-sm"
                    >
                      {result.pack.verified}/{result.pack.total} verified
                    </StatusBadge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record</TableHead>
                        <TableHead>Sealed</TableHead>
                        <TableHead>Verdict</TableHead>
                        <TableHead>Key pin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.records.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">{r.id}</TableCell>
                          <TableCell className="font-mono text-xs">{r.sealedAt}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.verdict.ok ? "verified" : "invalid"}>
                              {r.verdict.ok ? "valid" : "invalid"}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.pin ? (r.pin.ok ? "verified" : "invalid") : "neutral"}>
                              {r.pin ? (r.pin.ok ? "pass" : "fail") : "not pinned"}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Obligation coverage</CardTitle>
                  <CardDescription>
                    Computed from the receipts by CooL — a mapping to argue
                    with, not a compliance certification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clause</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.coverage.map((c) => (
                        <TableRow key={c.obligation.id}>
                          <TableCell className="font-medium whitespace-normal">
                            {c.obligation.regime} {c.obligation.clause}
                          </TableCell>
                          <TableCell className="min-w-56 whitespace-normal text-muted-foreground">
                            {c.obligation.requirement}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={c.covered ? "verified" : "neutral"}>
                              {c.records}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {result ? (
            <Button
              variant="outline"
              className="self-start"
              onClick={() =>
                downloadJson("prooflane-verification-report.json", {
                  verified_at: new Date().toISOString(),
                  verifier: "ProofLane browser verifier (cool-nwc)",
                  pinned_trust: trustText.trim() ? JSON.parse(trustText) : null,
                  result,
                  disclosure,
                })
              }
            >
              <Export data-icon="inline-start" />
              Export verification report
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Awaiting evidence</CardTitle>
                <CardDescription>
                  The verdict — binding, hybrid signatures, inclusion,
                  attestation, key pinning — appears here.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
