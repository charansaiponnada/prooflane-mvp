"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowsOut,
  CaretLeft,
  CaretRight,
  GithubLogo,
  Play,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/charansaiponnada/prooflane-mvp";
const COOL = "https://github.com/Northwind-Cipher/cool-sdk";
const src = (path: string) => `${REPO}/blob/main/${path}`;

/* ── slide primitives ─────────────────────────────────────────────────── */

function SimpleTable({ head, rows, mono = [] }: { head: string[]; rows: React.ReactNode[][]; mono?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {head.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, r) => (
            <TableRow key={r}>
              {row.map((cell, i) => (
                <TableCell
                  key={i}
                  className={cn(
                    "whitespace-normal",
                    i === 0 ? "font-medium" : "text-muted-foreground",
                    mono.includes(i) && "font-mono text-xs"
                  )}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Box({ title, lines, strong }: { title: string; lines: string[]; strong?: boolean }) {
  return (
    <Card size="sm" className={cn(strong && "ring-2 ring-foreground")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {lines.map((l) => (
          <CardDescription key={l} className="font-mono text-xs">
            {l}
          </CardDescription>
        ))}
      </CardHeader>
    </Card>
  );
}

function Lane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed p-3">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  );
}

function Down({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
      <ArrowDown size={14} />
      {label && <span className="font-mono">{label}</span>}
    </div>
  );
}

/* ── slides ───────────────────────────────────────────────────────────── */

type Slide = { eyebrow: string; title: string; body: React.ReactNode };

const slides: Slide[] = [
  {
    eyebrow: "ProofLane",
    title: "The evidence does not have to come from a system you trust.",
    body: (
      <div className="flex flex-col gap-6">
        <p className="max-w-2xl text-lg text-muted-foreground">
          The evidence gateway for AI agents that move money. Policy-gated actions, independently verifiable
          receipts, and auditor evidence rooms — built on the CooL SDK.
        </p>
        <Card>
          <CardContent className="font-mono text-sm tabular-nums">
            An AI agent releases a <span className="font-semibold">$48,200</span> payment. Six months later
            it&apos;s disputed. Change it to <span className="font-semibold">$4,820</span> — and the proof fails.
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Fintech & regulated financial services</Badge>
          <Badge variant="outline">cool-nwc 3.0 · cool.receipt.v2</Badge>
          <Badge variant="outline">Live on Vercel · open source</Badge>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Problem",
    title: "When an agent's action is disputed, who controls the evidence?",
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>The reviewer must trust the operator</CardTitle>
            <CardDescription>
              Traces, cloud audit logs, IAM records, approval tickets — fragmented, mutable, and controlled by
              the company being questioned. Nobody outside can check a record wasn&apos;t changed, or that a
              policy was actually enforced.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>The raw evidence can&apos;t be shared</CardTitle>
            <CardDescription>
              Tool arguments hold account numbers, customer identifiers, and prompts. OpenTelemetry and
              Microsoft Foundry tracing docs explicitly warn these fields are sensitive.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    ),
  },
  {
    eyebrow: "Why now",
    title: "Traceability is becoming mandatory; evidence readiness isn't there",
    body: (
      <div className="flex flex-col gap-3">
        <SimpleTable
          head={["Source", "Finding"]}
          rows={[
            ["EU AI Act, Article 12", "Automatic event recording and traceability for high-risk AI systems"],
            ["AAA/ICDR/IResearch · 500 leaders", "Only 22% very confident they can produce governance evidence; 87% have some governance"],
            ["IBM/Ponemon · 600 orgs", "13% had AI model/app breaches; 97% of those lacked proper AI access controls"],
            ["IBM/Ponemon outcomes", "60% of AI incidents compromised data; 31% caused operational disruption"],
          ]}
        />
        <p className="text-sm text-muted-foreground">
          These establish the pain, not budget for receipts — the paid pilot validates willingness to pay.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "Solution",
    title: "One product, three parts",
    body: (
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Gateway SDK", "proof.guard() wraps any agent tool. Policy check and CooL receipt before the tool runs; outcome sealed after. No receipt, no action."],
          ["Workspace ledger", "API keys, one RFC 6962 log per workspace, every receipt re-verified in the browser, coverage and capture-loss metrics."],
          ["Evidence rooms", "A link for the auditor: local verification, audit pack, single-field disclosure requests — each step receipted."],
        ].map(([t, d]) => (
          <Card key={t}>
            <CardHeader>
              <CardTitle className="text-lg">{t}</CardTitle>
              <CardDescription>{d}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "How it works",
    title: "Authorize → Seal → Execute → Prove",
    body: (
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Authorize", "Agent calls payment.release. CooL policy engine: ≥ $25,000 needs two distinct approvers."],
          ["Seal", "Arguments + approval ref committed as salted hashes; canonical CBOR binding; ML-DSA-65 + Ed25519; appended to the workspace log."],
          ["Execute", "Tool runs only if authorized. Result sealed under the same execution id. Refusals are receipts too."],
          ["Prove", "Auditor verifies offline against pinned keys and measurement, and requests exactly one field."],
        ].map(([t, d], i) => (
          <Card key={t}>
            <CardHeader>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <CardTitle>{t}</CardTitle>
              <CardDescription>{d}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Architecture",
    title: "Three trust zones, verification on the reader's side",
    body: (
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Lane label="Customer environment">
          <Box title="AI agent" lines={["OpenAI · Anthropic · LangChain · MCP"]} />
          <Down label="tool call" />
          <Box title="ProofLane SDK" lines={["proof.guard()", "src/sdk/prooflane.ts"]} strong />
          <Down label="only if authorized" />
          <Box title="Payment tool" lines={["bank.releasePayment()"]} />
          <Box title="Plaintext vault" lines={["onReceipt(receipt, vault)", "kept for disclosures"]} />
        </Lane>
        <Lane label="ProofLane · Vercel">
          <Box title="Gateway API" lines={["/api/v1/actions/authorize", "/api/v1/actions/:id/complete", "API-key auth"]} />
          <Down />
          <Box title="CooL policy engine" lines={["evaluate(PAYMENT_POLICY)", "policy_hash sealed"]} strong />
          <Down />
          <Box title="CooL evidence plane" lines={["CoolTee + SimulatedDstackClient", "commit · bind · sign · log"]} strong />
          <Down label="leaves replayed under lock" />
          <Box title="Upstash Redis" lines={["workspaces · ledger", "RFC 6962 leaves · shares"]} />
        </Lane>
        <Lane label="Auditor's browser">
          <Box title="Trust anchor" lines={["GET /api/keys", "keys + measurement, pinned"]} />
          <Down />
          <Box title="Evidence room" lines={["/share/:token", "receipts + cool.audit-pack.v2"]} />
          <Down />
          <Box title="CooL verifier" lines={["verifyEvidence · verifyAuditPack", "verifyDisclosure · withTrustedKeys"]} strong />
          <Down label="request one field" />
          <Box title="Disclosure" lines={["operator approves with plaintext", "disclose() refuses mismatches"]} />
        </Lane>
      </div>
    ),
  },
  {
    eyebrow: "Tech spec",
    title: "What it's built on",
    body: (
      <SimpleTable
        head={["Layer", "Choice", "Detail"]}
        rows={[
          ["Evidence SDK", "cool-nwc 3.0.0 (CooL)", "Node ≥ 20, ESM; verifier runs in the browser"],
          ["Receipt formats", "cool.receipt.v2 · cool.evidence.v1", "cool.audit-pack.v2 · cool.disclosure.v1"],
          ["Commitments", "Salted SHA-256", "16-byte CSPRNG salt per field; plaintext discarded"],
          ["Canonicalization", "Deterministic CBOR (RFC 8949 CDE)", "Stable binding hash regardless of JSON key order"],
          ["Signatures", "ML-DSA-65 (FIPS 204) + Ed25519", "Hybrid: both must verify"],
          ["Transparency", "RFC 6962 Merkle log + signed tree head", "One tree per workspace, persisted leaves"],
          ["Attestation", "dstack / Intel TDX quote structure", "Simulated root, labelled simulated everywhere"],
          ["App", "Next.js 16 App Router · React 19 · TypeScript", "Route handlers for the gateway API"],
          ["UI", "shadcn/ui · Tailwind v4 · Phosphor", "Monochrome; color only for verdicts"],
          ["Data & hosting", "Upstash Redis · Vercel serverless", "Redis lock serializes seals per workspace"],
          ["Quality", "Vitest round-trip tests · ESLint · tsc", "Tamper, key substitution, policy, disclosure, audit pack"],
        ]}
      />
    ),
  },
  {
    eyebrow: "Where CooL SDK is used",
    title: "Every trust claim is computed by CooL",
    body: (
      <div className="flex flex-col gap-3">
        <SimpleTable
          head={["CooL API", "What ProofLane uses it for", "Source"]}
          mono={[0, 2]}
          rows={[
            ["CoolTee.connect · tee.record", "Seal authorizations, refusals, outcomes, disclosure decisions", <a key="l" href={src("src/lib/ledger.ts")} target="_blank" rel="noreferrer">src/lib/ledger.ts</a>],
            ["evaluate · PolicySet", "Dual-control payment policy; decision + policy_hash sealed", <a key="p" href={src("src/lib/policy.ts")} target="_blank" rel="noreferrer">src/lib/policy.ts</a>],
            ["EvidenceLog · MemoryLog · sealedKeyset", "One RFC 6962 tree per workspace across serverless instances", <a key="l2" href={src("src/lib/ledger.ts")} target="_blank" rel="noreferrer">src/lib/ledger.ts</a>],
            ["SimulatedDstackClient · CooL", "Measurement-sealed keys bound to the build; published trust anchor", <a key="g" href={src("src/lib/gateway.ts")} target="_blank" rel="noreferrer">src/lib/gateway.ts</a>],
            ["verifyEvidence · withTrustedKeys", "Browser verification with pinned keys + measurement", <a key="t" href={src("src/lib/trust.ts")} target="_blank" rel="noreferrer">src/lib/trust.ts</a>],
            ["disclose · verifyDisclosure", "Field-level disclosure that refuses mismatched values", <a key="d" href={src("src/lib/ledger.ts")} target="_blank" rel="noreferrer">src/lib/ledger.ts</a>],
            ["buildAuditPack · verifyAuditPack · coverage", "Evidence rooms, obligation coverage", <a key="s" href={src("src/app/share/[token]/page.tsx")} target="_blank" rel="noreferrer">src/app/share/[token]</a>],
            ["saltedCommit", "Real $48,200 → $4,820 tamper attack in the guided demo", <a key="r" href={src("src/lib/receipt.ts")} target="_blank" rel="noreferrer">src/lib/receipt.ts</a>],
            ["tee.stats()", "Measured p50/p99 capture cost on the dashboard", <a key="c" href={src("src/app/console/page.tsx")} target="_blank" rel="noreferrer">src/app/console/page.tsx</a>],
            ["cool verify (CLI)", "Verify a downloaded receipt without our website", "npx -p cool-nwc cool verify receipt.json"],
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={COOL} target="_blank" rel="noreferrer">
              <GithubLogo data-icon="inline-start" />
              Northwind-Cipher/cool-sdk
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={REPO} target="_blank" rel="noreferrer">
              <GithubLogo data-icon="inline-start" />
              ProofLane source
            </a>
          </Button>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Why CooL matters",
    title: "Without CooL, ProofLane is just another log exporter",
    body: (
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["Integrity a stranger can check", "Binding + hybrid signatures: one changed digit fails verification."],
          ["Enforcement becomes evidence", "A blocked payment is a signed receipt naming the rule that stopped it."],
          ["Completeness is checkable", "Receipts share one RFC 6962 root; dropping one breaks the tree."],
          ["Privacy is structural", "Commitments travel; plaintext stays with the operator, opened one field at a time."],
          ["Key substitution is caught", "Pinned keys via withTrustedKeys; re-signed receipts fail."],
          ["Honesty is enforced by the verifier", "Simulated attestation is never reported as hardware."],
        ].map(([t, d]) => (
          <Card key={t} size="sm">
            <CardHeader>
              <CardTitle>{t}</CardTitle>
              <CardDescription>{d}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Live demo",
    title: "See it gate, seal, share — and fail",
    body: (
      <div className="flex flex-col gap-4">
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
          <li>Console → create workspace → run &quot;$48,200 · one approver&quot; → blocked by PAY-003, refusal receipted.</li>
          <li>Run &quot;$48,200 · dual control&quot; → authorized + completed, same execution id, one growing log.</li>
          <li>Auditors → create evidence-room link → open privately → everything re-verifies → request the approval ref.</li>
          <li>Approve in Console → auditor sees the value matched against the original commitment.</li>
          <li>Guided demo → change $48,200 to $4,820 → binding and signatures fail.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/demo">
              <Play data-icon="inline-start" />
              Guided demo — no login
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/console">Open the console</Link>
          </Button>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Customer & business model",
    title: "Paid design-partner pilot, one action, 8–12 weeks",
    body: (
      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleTable
          head={["Role", "Who"]}
          rows={[
            ["Economic buyer", "CISO, Head of AI Platform, CRO, Head of Model Risk, Internal Audit"],
            ["Technical champion", "AI platform / security engineering lead"],
            ["Evidence consumer", "Audit, compliance, legal, fraud investigation"],
          ]}
        />
        <SimpleTable
          head={["Pilot metric", "Target"]}
          rows={[
            ["Evidence-pack preparation time", "Reduce vs. baseline"],
            ["Systems manually correlated", "Reduce for the action"],
            ["Sensitive fields shared", "Reduce"],
            ["Receipt loss on the sync path", "Zero; visible otherwise"],
            ["Evidence consumer acceptance", "Yes — and willing to pay"],
          ]}
        />
      </div>
    ),
  },
  {
    eyebrow: "Roadmap & honest boundary",
    title: "Earn expansion one action at a time",
    body: (
      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleTable
          head={["Phase", "Deliver"]}
          rows={[
            ["Now", "SDK, policy gating, workspace ledger, evidence rooms (simulated TEE)"],
            ["Pilot", "Customer-hosted evidence plane, editable policies, OTel links, SSO"],
            ["Production", "Real dstack/TDX quotes, external witnesses, key rotation, retention"],
            ["Expansion", "Beneficiary change, privileged access, fraud disposition packs"],
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>What ProofLane does not prove</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
              <li>That a decision was correct, fair, safe, or legal</li>
              <li>That nothing bypassed the gateway, or the app didn&apos;t lie before capture</li>
              <li>Hardware security — this build&apos;s attestation is simulated, and says so</li>
            </ul>
          </CardContent>
          <CardFooter className="text-sm font-medium">
            It proves the integrity of captured execution statements.
          </CardFooter>
        </Card>
      </div>
    ),
  },
  {
    eyebrow: "Close",
    title: "One payment action. One evidence consumer. One paid pilot.",
    body: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-muted-foreground">The evidence does not have to come from a system you trust.</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/demo">
              See it verify — and fail
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={REPO} target="_blank" rel="noreferrer">
              <GithubLogo data-icon="inline-start" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    ),
  },
];

/* ── deck shell: slide index lives in the URL hash (#1…#n) ────────────── */

const clamp = (n: number) => Math.min(Math.max(n, 0), slides.length - 1);
const readIndex = () => clamp((parseInt(window.location.hash.slice(1), 10) || 1) - 1);
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function PitchDeck() {
  const index = useSyncExternalStore(subscribe, readIndex, () => 0);
  const go = useCallback((n: number) => {
    history.replaceState(null, "", `#${clamp(n) + 1}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(readIndex() + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(readIndex() - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const slide = slides[index];

  return (
    <div id="pitch-deck" className="flex min-h-[calc(100vh-10rem)] flex-col gap-4 bg-background">
      <Card className="flex-1">
        <CardHeader>
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {slide.eyebrow}
          </span>
          <CardTitle className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {slide.title}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent key={index} className="animate-in fade-in-0 slide-in-from-right-4 flex-1 duration-300">
          {slide.body}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" aria-label="Previous slide" onClick={() => go(index - 1)} disabled={index === 0}>
          <CaretLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Next slide" onClick={() => go(index + 1)} disabled={index === slides.length - 1}>
          <CaretRight />
        </Button>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex flex-1 flex-wrap gap-1">
          {slides.map((s, i) => (
            <button
              key={s.eyebrow}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn("h-1.5 flex-1 rounded-full bg-muted transition-colors", i <= index && "bg-foreground")}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById("pitch-deck")?.requestFullscreen?.()}
        >
          <ArrowsOut data-icon="inline-start" />
          Present
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">← → or space to navigate · each slide has its own link</p>
    </div>
  );
}
