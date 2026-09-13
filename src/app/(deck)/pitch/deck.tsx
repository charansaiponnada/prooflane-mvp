"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowsOut,
  CaretLeft,
  CaretRight,
  DoorOpen,
  EyeSlash,
  Fingerprint,
  Flask,
  GithubLogo,
  GridFour,
  House,
  LockKey,
  Notepad,
  Play,
  SealCheck,
  ShieldCheck,
  TreeStructure,
  UsersThree,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setHash, useHash } from "@/hooks/use-hash";
import { COOL_SDK_URL, COOL_USAGE, REPO_URL, sourceUrl } from "@/lib/cool-usage";
import { cn } from "@/lib/utils";

/* ── type scale: everything is sized in container-width units, so a slide
      looks identical in the window, in fullscreen and as a grid thumbnail ── */

const T = {
  eyebrow: "text-[1.05cqw] font-medium uppercase tracking-[0.14em] text-brand",
  title: "text-[3.2cqw] font-semibold leading-[1.08] tracking-tight text-balance",
  lead: "text-[1.75cqw] leading-snug text-muted-foreground",
  body: "text-[1.4cqw] leading-snug",
  small: "text-[1.1cqw] leading-snug text-muted-foreground",
  mono: "font-mono text-[1cqw]",
};

function Panel({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={cn("flex flex-col gap-[0.6cqw] rounded-[1cqw] border bg-card p-[1.6cqw]", className)} style={style}>
      {children}
    </div>
  );
}

function Big({ value, label, source }: { value: string; label: string; source?: string }) {
  return (
    <Panel className="justify-between">
      <span className="text-[6.2cqw] leading-none font-semibold tracking-tight text-brand">{value}</span>
      <span className={T.body}>{label}</span>
      {source && <span className={T.small}>{source}</span>}
    </Panel>
  );
}

/* ── diagrams ─────────────────────────────────────────────────────────── */

function ArchitectureDiagram() {
  const node = (x: number, y: number, title: string, sub: string, strong = false) => (
    <g key={title}>
      <rect x={x} y={y} width={400} height={92} rx={14} fill="var(--card)" stroke={strong ? "var(--brand)" : "var(--border)"} strokeWidth={strong ? 3 : 1.5} />
      <text x={x + 22} y={y + 38} fontSize={24} fontWeight={600} fill="var(--foreground)">{title}</text>
      <text x={x + 22} y={y + 70} fontSize={18} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{sub}</text>
    </g>
  );
  const zone = (x: number, label: string) => (
    <g key={label}>
      <rect x={x} y={20} width={460} height={680} rx={22} fill="none" stroke="var(--border)" strokeDasharray="8 8" strokeWidth={2} />
      <text x={x + 24} y={60} fontSize={17} fontWeight={600} letterSpacing={2} fill="var(--muted-foreground)">{label}</text>
    </g>
  );
  const flow = (d: string, label?: string, lx = 0, ly = 0) => (
    <g key={d}>
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth={3} className="pl-flow" markerEnd="url(#arrow)" />
      {label && <text x={lx} y={ly} fontSize={16} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{label}</text>}
    </g>
  );

  return (
    <svg viewBox="0 0 1600 720" className="h-full w-full" role="img" aria-label="ProofLane architecture across customer, ProofLane and auditor trust zones">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--brand)" />
        </marker>
      </defs>
      {zone(40, "CUSTOMER ENVIRONMENT")}
      {zone(570, "PROOFLANE · VERCEL")}
      {zone(1100, "AUDITOR'S BROWSER")}

      {node(70, 90, "AI agent", "OpenAI · Anthropic · MCP")}
      {node(70, 300, "ProofLane SDK", "proof.guard()", true)}
      {node(70, 520, "Payment tool", "runs only if authorized")}

      {node(600, 90, "Gateway API", "/api/v1/actions/*")}
      {node(600, 240, "CooL policy", "evaluate(PolicySet)", true)}
      {node(600, 390, "CooL evidence plane", "CoolTee.record()", true)}
      {node(600, 560, "Transparency log", "EvidenceLog → Redis")}

      {node(1130, 90, "Trust anchor", "keys + measurement")}
      {node(1130, 300, "Evidence room", "cool.audit-pack.v2")}
      {node(1130, 520, "CooL verifier", "verifyEvidence()", true)}

      {flow("M270 182 L270 292")}
      {flow("M470 346 C 535 346, 535 136, 592 136", "authorize", 478, 238)}
      {flow("M270 392 L270 512", "then run", 282, 462)}
      {flow("M800 182 L800 232")}
      {flow("M800 332 L800 382")}
      {flow("M800 482 L800 552")}
      {flow("M1000 606 C 1065 606, 1065 346, 1122 346", "receipts", 1010, 470)}
      {flow("M1330 182 L1330 292", "pin", 1342, 244)}
      {flow("M1330 392 L1330 512", "verify locally", 1342, 462)}
    </svg>
  );
}

const ANATOMY = [
  {
    group: "Visible",
    color: "var(--chart-1)",
    icon: Fingerprint,
    note: "What happened, which software, which execution.",
    lines: ["schema: cool.receipt.v2", "event.type: payment.release.authorized", "execution_id: exe_7f3a…", "software: payments-agent@2.0.0"],
  },
  {
    group: "Committed, not included",
    color: "var(--chart-3)",
    icon: EyeSlash,
    note: "Salted SHA-256 of arguments, approval ref and policy decision.",
    lines: ["commitments.input: mh:sha256:9c1e…", "commitments.state: mh:sha256:41ab…", "metadata_hash: mh:sha256:d07f…"],
  },
  {
    group: "Signed",
    color: "var(--brand)",
    icon: SealCheck,
    note: "Canonical CBOR binding under hybrid post-quantum + classical signatures.",
    lines: ["binding_hash: mh:sha256:5e2c…", "signature: ml-dsa-65 + ed25519"],
  },
  {
    group: "Provable in the log",
    color: "var(--chart-2)",
    icon: TreeStructure,
    note: "RFC 6962 inclusion under a signed tree head for the workspace.",
    lines: ["inclusion: leaf 41 of 42", "sth: signed tree head"],
  },
  {
    group: "Attestation (honest)",
    color: "var(--simulated)",
    icon: Flask,
    note: "Quote structure bound to the signing key — labelled simulated, never pass.",
    lines: ["runtime.mode: simulated", "quote: cool.sim.v1"],
  },
];

function ReceiptAnatomy() {
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] gap-[2cqw]">
      <Panel className="gap-[1cqw] bg-muted/40">
        {ANATOMY.map((g) => (
          <div key={g.group} className="flex flex-col gap-[0.25cqw] border-l-[0.35cqw] pl-[1cqw]" style={{ borderColor: g.color }}>
            {g.lines.map((l) => (
              <span key={l} className={cn(T.mono, "flex items-center gap-[0.5cqw]")}>
                {l}
                {g.group.startsWith("Committed") && <EyeSlash className="text-muted-foreground" />}
              </span>
            ))}
          </div>
        ))}
      </Panel>
      <div className="flex flex-col justify-between gap-[0.8cqw]">
        {ANATOMY.map((g) => (
          <div key={g.group} className="flex items-start gap-[1cqw]">
            <span className="mt-[0.3cqw] size-[1.1cqw] shrink-0 rounded-full" style={{ background: g.color }} />
            <div className="flex flex-col">
              <span className={cn(T.body, "flex items-center gap-[0.5cqw] font-medium")}>
                <g.icon /> {g.group}
              </span>
              <span className={T.small}>{g.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoolCallMap() {
  return (
    <div className="flex h-full flex-col gap-[1.2cqw]">
      <div className="grid flex-1 grid-cols-4 gap-[1cqw]">
        {COOL_USAGE.map((u) => (
          <Panel key={u.step} className={cn("relative", u.where === "browser" && "border-brand")}>
            <div className="flex items-center justify-between">
              <span className="flex size-[2.2cqw] items-center justify-center rounded-full bg-brand text-[1.1cqw] font-semibold text-brand-foreground">
                {u.step}
              </span>
              <span className={cn(T.small, "font-mono uppercase")}>{u.where}</span>
            </div>
            <span className="font-mono text-[1.15cqw] font-semibold leading-tight">{u.api}</span>
            <span className={cn(T.small, "flex-1")}>{u.purpose}</span>
            <a href={sourceUrl(u.file)} target="_blank" rel="noreferrer" className={cn(T.mono, "text-muted-foreground underline-offset-2 hover:underline")}>
              {u.file}
            </a>
          </Panel>
        ))}
      </div>
      <div className={cn(T.small, "flex items-center gap-[1cqw]")}>
        <span>
          Imports: <span className="font-mono">cool-nwc</span> · <span className="font-mono">cool-nwc/phala</span> ·{" "}
          <span className="font-mono">cool-nwc/verify</span> · CLI <span className="font-mono">cool verify receipt.json</span>
        </span>
        <a href={COOL_SDK_URL} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-[0.4cqw] font-mono text-foreground">
          <GithubLogo /> Northwind-Cipher/cool-sdk
        </a>
      </div>
    </div>
  );
}

/* ── slides ───────────────────────────────────────────────────────────── */

type Slide = { id: string; eyebrow: string; title: string; notes: string; hero?: boolean; body: React.ReactNode };

const slides: Slide[] = [
  {
    id: "title",
    eyebrow: "ProofLane",
    title: "The evidence does not have to come from a system you trust.",
    hero: true,
    notes:
      "AI agents are starting to move money on their own. Companies already have logs — but those logs are controlled by the company itself. ProofLane creates a cryptographic receipt at the moment a consequential AI action happens, which anyone can verify without touching our backend or seeing the sensitive data.",
    body: (
      <div className="relative isolate flex h-full flex-col justify-center gap-[2cqw] overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="pl-motion-grid absolute inset-0" />
          <div className="pl-orbit absolute top-1/2 left-[80%] size-[44cqw] -translate-1/2" />
          <div className="pl-orbit pl-orbit-reverse absolute top-1/2 left-[80%] size-[28cqw] -translate-1/2" />
          <div className="pl-orbit absolute top-1/2 left-[80%] size-[12cqw] -translate-1/2" />
          <div className="pl-pulse absolute top-1/2 left-[80%] size-[1.2cqw] -translate-1/2 rounded-full bg-brand" />
        </div>
        <span className={cn(T.eyebrow, "flex items-center gap-[0.6cqw]")}>
          <ShieldCheck weight="fill" /> ProofLane · evidence gateway for AI agents
        </span>
        <h1 className="max-w-[62cqw] text-[5.2cqw] leading-[1.02] font-semibold tracking-tight text-balance">
          The evidence does not have to come from a system you trust.
        </h1>
        <p className={cn(T.lead, "max-w-[52cqw]")}>
          Policy-gated agent actions, independently verifiable receipts, and auditor evidence rooms — built on the CooL SDK.
        </p>
        <div className="flex gap-[0.8cqw] text-[1.1cqw]">
          {["Fintech & regulated finance", "cool.receipt.v2", "Open source · live"].map((b) => (
            <span key={b} className="rounded-full border bg-background px-[1cqw] py-[0.3cqw]">{b}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "problem",
    eyebrow: "Problem",
    title: "When an agent's payment is disputed, who controls the evidence?",
    notes:
      "Today the enterprise assembles traces, cloud logs, IAM records and tickets. The reviewer still has to trust the system that produced them — and the raw data is too sensitive to hand over. Both halves of the problem matter: trust and privacy.",
    body: (
      <div className="grid h-full grid-cols-2 gap-[2cqw]">
        {[
          [LockKey, "The reviewer must trust the operator", "Traces, audit logs, IAM records, approval tickets — fragmented, mutable, and controlled by the company being questioned. Nobody outside can check a record wasn't changed, or that policy was actually enforced."],
          [EyeSlash, "The raw evidence can't be shared", "Tool arguments hold account numbers, customer identifiers and prompts. OpenTelemetry and Microsoft Foundry tracing docs warn these fields are sensitive."],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof LockKey;
          return (
            <Panel key={title as string} className="justify-center gap-[1.2cqw] p-[2.4cqw]">
              <I className="text-[3.4cqw] text-brand" />
              <span className="text-[2.2cqw] font-semibold leading-tight">{title as string}</span>
              <span className={T.lead}>{text as string}</span>
            </Panel>
          );
        })}
      </div>
    ),
  },
  {
    id: "numbers",
    eyebrow: "Why now",
    title: "Traceability is becoming mandatory. Evidence readiness isn't there.",
    notes:
      "EU AI Act Article 12 requires automatic event logging for high-risk AI. Only 22% of senior leaders are very confident they can produce governance evidence. 97% of organizations with AI breaches lacked proper access controls. Be precise: this proves the pain, not yet a budget for receipts — that's what the paid pilot validates.",
    body: (
      <div className="flex h-full flex-col gap-[1.4cqw]">
        <div className="grid flex-1 grid-cols-3 gap-[1.6cqw]">
          <Big value="22%" label="of 500 senior legal & exec leaders are very confident they can produce AI governance evidence" source="AAA/ICDR · IResearch survey" />
          <Big value="97%" label="of organizations with AI model breaches lacked proper AI access controls" source="IBM / Ponemon · 600 orgs" />
          <Big value="60%" label="of AI-related incidents compromised data; 31% disrupted operations" source="IBM / Ponemon" />
        </div>
        <Panel className="flex-row items-center gap-[1cqw] py-[1cqw]">
          <Badge variant="outline" className="text-[1cqw]">Regulation</Badge>
          <span className={T.body}>EU AI Act Article 12 — automatic event recording and traceability for high-risk AI systems.</span>
        </Panel>
      </div>
    ),
  },
  {
    id: "solution",
    eyebrow: "Solution",
    title: "One product, three parts",
    notes:
      "The SDK sits at the action boundary. The ledger makes every decision provable. The evidence room gives the auditor something they can check themselves. Walk left to right: operator, platform, auditor.",
    body: (
      <div className="grid h-full grid-cols-3 gap-[1.8cqw]">
        {[
          [DoorOpen, "Gateway SDK", "proof.guard() wraps any agent tool. Policy check and CooL receipt before the tool runs; outcome sealed after.", "No receipt, no action."],
          [TreeStructure, "Workspace ledger", "API keys, one RFC 6962 transparency log per workspace, coverage and capture-loss metrics.", "Refusals are receipts too."],
          [UsersThree, "Evidence rooms", "A link for the auditor: local verification, audit pack, single-field disclosure requests.", "Every step receipted."],
        ].map(([Icon, title, text, tag]) => {
          const I = Icon as typeof DoorOpen;
          return (
            <Panel key={title as string} className="gap-[1.2cqw] p-[2.2cqw]">
              <I className="text-[3.2cqw] text-brand" />
              <span className="text-[2.1cqw] font-semibold">{title as string}</span>
              <span className={cn(T.lead, "flex-1")}>{text as string}</span>
              <span className={cn(T.body, "font-medium")}>{tag as string}</span>
            </Panel>
          );
        })}
      </div>
    ),
  },
  {
    id: "flow",
    eyebrow: "How it works",
    title: "Authorize → Seal → Execute → Prove",
    notes:
      "A $48,200 payment with one approver is escalated by rule PAY-003 — and that refusal is a signed receipt. With dual control it's authorized, the tool runs, and the outcome is sealed under the same execution id. The auditor later verifies all of it offline.",
    body: (
      <div className="grid h-full grid-cols-4 items-stretch gap-[1.4cqw]">
        {[
          ["Authorize", "Agent calls payment.release. CooL policy: ≥ $25,000 needs two distinct approvers."],
          ["Seal", "Arguments + approval ref committed; canonical CBOR binding; ML-DSA-65 + Ed25519; appended to the workspace log."],
          ["Execute", "The tool runs only if authorized. Its result is sealed under the same execution id."],
          ["Prove", "An auditor verifies offline against pinned keys and requests exactly one field."],
        ].map(([title, text], i) => (
          <Panel key={title} className="relative gap-[1cqw] p-[2cqw]">
            <span className="font-mono text-[4cqw] leading-none font-semibold text-brand">0{i + 1}</span>
            <span className="text-[2cqw] font-semibold">{title}</span>
            <span className={T.lead}>{text}</span>
            {i < 3 && <CaretRight className="absolute top-1/2 -right-[1.35cqw] z-10 -translate-y-1/2 text-[1.6cqw] text-muted-foreground" />}
          </Panel>
        ))}
      </div>
    ),
  },
  {
    id: "anatomy",
    eyebrow: "Receipt anatomy",
    title: "What a cool.receipt.v2 shows, hides, and proves",
    notes:
      "Left is the actual shape of a receipt. The visible part says what happened. The sensitive parts are only salted commitments. The binding and dual signatures make any change detectable, the inclusion proof ties it to the workspace log, and attestation is honestly labelled simulated.",
    body: <ReceiptAnatomy />,
  },
  {
    id: "architecture",
    eyebrow: "Architecture",
    title: "Three trust zones — verification happens on the reader's side",
    notes:
      "The SDK runs in the customer's environment next to the tool. ProofLane runs the CooL policy engine and evidence plane and keeps one transparency log per workspace. The auditor's browser pins our published keys and verifies receipts locally — it never trusts a verdict computed by our server.",
    body: <ArchitectureDiagram />,
  },
  {
    id: "cool",
    eyebrow: "Where the CooL SDK is used",
    title: "Eight CooL APIs carry every trust claim",
    notes:
      "This is the integration map. Steps one to six run in the gateway: policy, sealed keys, record, the transparency log, capture stats and audit packs. Step seven runs in the auditor's browser. Step eight is field disclosure, where CooL refuses any value that doesn't match. Every box links to the source file.",
    body: <CoolCallMap />,
  },
  {
    id: "spec",
    eyebrow: "Tech spec",
    title: "What it's built on",
    notes:
      "Highlight the cryptography in one breath: salted SHA-256 commitments, deterministic CBOR, hybrid ML-DSA-65 plus Ed25519, RFC 6962 per workspace. The app is Next.js 16 on Vercel with Upstash Redis, and it's covered by CooL round-trip tests.",
    body: (
      <div className="grid h-full grid-cols-2 gap-x-[2cqw] gap-y-[0.9cqw]">
        {[
          ["Evidence SDK", "cool-nwc 3.0 · Node ≥ 20 · verifier runs in the browser"],
          ["Receipt formats", "cool.receipt.v2 · audit-pack.v2 · disclosure.v1"],
          ["Commitments", "Salted SHA-256, 16-byte salt per field"],
          ["Canonicalization", "Deterministic CBOR (RFC 8949 CDE)"],
          ["Signatures", "ML-DSA-65 (FIPS 204) + Ed25519, both must verify"],
          ["Transparency", "RFC 6962 Merkle log + signed tree head per workspace"],
          ["Attestation", "dstack / TDX quote structure · simulated root"],
          ["Policy", "CooL evaluate() · strictest rule wins · policy hash sealed"],
          ["App", "Next.js 16 App Router · React 19 · TypeScript"],
          ["UI", "shadcn/ui · Tailwind v4 · Phosphor · recharts"],
          ["Data & hosting", "Upstash Redis · Vercel serverless"],
          ["Quality", "Vitest CooL round-trips · ESLint · tsc"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-[1cqw] border-b pb-[0.7cqw]">
            <span className={cn(T.body, "w-[14cqw] shrink-0 font-medium")}>{k}</span>
            <span className={cn(T.body, "text-muted-foreground")}>{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "proof",
    eyebrow: "By the numbers",
    title: "Built to be checked, not believed",
    notes:
      "Seven verification domains in every verdict. Two signature schemes that must both pass. One tree per workspace, so completeness is checkable. Capture adds about a tenth of a millisecond at p99 in our local measurement — say clearly it's a local number, not a production benchmark.",
    body: (
      <div className="grid h-full grid-cols-5 gap-[1.2cqw]">
        <Big value="7" label="verification domains per receipt" />
        <Big value="2" label="signature schemes that must both verify" />
        <Big value="1" label="RFC 6962 tree per workspace" />
        <Big value={String(COOL_USAGE.length)} label="CooL APIs integrated end to end" />
        <Big value="0.13ms" label="p99 capture enqueue" source="measured locally" />
      </div>
    ),
  },
  {
    id: "why-cool",
    eyebrow: "Why CooL matters",
    title: "Without CooL, ProofLane is just another log exporter",
    notes:
      "Each of these is a property a stranger can check. The one to emphasize for judges: a blocked payment isn't a missing log line, it's a signed receipt naming the rule that stopped it.",
    body: (
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-[1.2cqw]">
        {[
          ["Integrity a stranger can check", "One changed digit fails binding and both signatures."],
          ["Enforcement becomes evidence", "A refusal is a signed receipt naming the rule."],
          ["Completeness is checkable", "Receipts share one RFC 6962 root."],
          ["Privacy is structural", "Commitments travel; plaintext stays with the operator."],
          ["Key substitution is caught", "Pinned keys via withTrustedKeys."],
          ["Honesty enforced by the verifier", "Simulated is never reported as hardware."],
        ].map(([t, d]) => (
          <Panel key={t} className="justify-center gap-[0.8cqw]">
            <span className="text-[1.8cqw] font-semibold leading-tight">{t}</span>
            <span className={T.lead}>{d}</span>
          </Panel>
        ))}
      </div>
    ),
  },
  {
    id: "demo",
    eyebrow: "Live demo",
    title: "See it gate, seal, share — and fail",
    notes:
      "Switch to the browser. Console: run '$48,200 · one approver' — blocked. Run dual control — authorized and completed. Create an evidence room link, request the approval ref, approve it. Finally the guided demo: change $48,200 to $4,820 and watch verification fail.",
    body: (
      <div className="grid h-full grid-cols-[1.4fr_1fr] gap-[2cqw]">
        <ol className="flex flex-col justify-center gap-[1.2cqw]">
          {[
            "Run “$48,200 · one approver” → blocked by PAY-003, refusal receipted",
            "Run “dual control” → authorized + completed, one execution id",
            "Create an evidence-room link → everything re-verifies in the auditor's browser",
            "Auditor requests the approval ref → operator approves → value matches commitment",
            "Guided demo: $48,200 → $4,820 → binding and signatures fail",
          ].map((s, i) => (
            <li key={s} className="flex items-start gap-[1cqw]">
              <span className="flex size-[2.2cqw] shrink-0 items-center justify-center rounded-full bg-brand text-[1.1cqw] font-semibold text-brand-foreground">{i + 1}</span>
              <span className={T.lead}>{s}</span>
            </li>
          ))}
        </ol>
        <Panel className="items-start justify-center gap-[1.2cqw] p-[2.4cqw]">
          <Play className="text-[3.2cqw] text-brand" />
          <span className="text-[2cqw] font-semibold">Try it now — no login</span>
          <span className={T.lead}>prooflane-mvp.vercel.app/demo</span>
          <div className="flex gap-[0.8cqw]">
            <Link href="/demo" className="rounded-[0.6cqw] bg-primary px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-medium text-primary-foreground">Guided demo</Link>
            <Link href="/console" className="rounded-[0.6cqw] border px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-medium">Console</Link>
          </div>
        </Panel>
      </div>
    ),
  },
  {
    id: "business",
    eyebrow: "Customer & business model",
    title: "Paid design-partner pilot · one action · 8–12 weeks",
    notes:
      "Start with mid-sized fintechs, not tier-one banks. The technical champion is platform or security engineering; the economic buyer is risk, security or audit; the evidence consumer must be in the room from day one. We sell reduced evidence cost, never hashes.",
    body: (
      <div className="grid h-full grid-cols-2 gap-[2cqw]">
        <Panel className="gap-[1.2cqw] p-[2cqw]">
          <span className="text-[1.8cqw] font-semibold">Who buys</span>
          {[
            ["Economic buyer", "CISO · Head of AI Platform · CRO · Model Risk · Internal Audit"],
            ["Technical champion", "AI platform / security engineering lead"],
            ["Evidence consumer", "Audit · compliance · legal · fraud investigation"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className={cn(T.body, "font-medium")}>{k}</span>
              <span className={T.small}>{v}</span>
            </div>
          ))}
        </Panel>
        <Panel className="gap-[1.2cqw] p-[2cqw]">
          <span className="text-[1.8cqw] font-semibold">What the pilot measures</span>
          {["Evidence-pack preparation time ↓", "Systems manually correlated ↓", "Sensitive fields shared ↓", "Receipt loss on the sync path = 0", "Evidence consumer accepts — and pays"].map((m) => (
            <span key={m} className={cn(T.body, "border-b pb-[0.5cqw]")}>{m}</span>
          ))}
        </Panel>
      </div>
    ),
  },
  {
    id: "close",
    eyebrow: "Roadmap & honest boundary",
    title: "One payment action. One evidence consumer. One paid pilot.",
    notes:
      "Close on honesty — it builds more credibility than it costs. ProofLane proves the integrity of captured execution statements; it doesn't prove a decision was right, and today's attestation is simulated. Then the line: the evidence does not have to come from a system you trust.",
    body: (
      <div className="flex h-full flex-col gap-[1.6cqw]">
        <div className="grid grid-cols-4 gap-[1cqw]">
          {[
            ["Now", "SDK · policy gating · ledger · evidence rooms"],
            ["Pilot", "Customer-hosted plane · editable policies · SSO"],
            ["Production", "Real TDX quotes · witnesses · key rotation"],
            ["Expansion", "Beneficiary change · privileged access · fraud"],
          ].map(([p, d], i) => (
            <Panel key={p} className={cn(i === 0 && "border-brand")}>
              <span className="text-[1.6cqw] font-semibold">{p}</span>
              <span className={T.small}>{d}</span>
            </Panel>
          ))}
        </div>
        <Panel className="flex-row items-center gap-[1.2cqw]">
          <Flask className="shrink-0 text-[2.4cqw] text-simulated" />
          <span className={T.body}>
            Proves the integrity of captured execution statements — not that a decision was correct, fair or legal, nor
            hardware security (attestation here is simulated).
          </span>
        </Panel>
        <div className="flex flex-1 items-center justify-between gap-[2cqw]">
          <span className="text-[3.4cqw] leading-tight font-semibold tracking-tight text-balance">
            The evidence does not have to come from a system you trust.
          </span>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-[0.5cqw] rounded-[0.6cqw] border px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-medium">
            <GithubLogo /> GitHub
          </a>
        </div>
      </div>
    ),
  },
];

/* ── slide renderer & deck shell ──────────────────────────────────────── */

function SlideView({ slide, animate }: { slide: Slide; animate?: boolean }) {
  if (slide.hero) {
    return <div className={cn("h-full p-[4.5cqw]", animate && "animate-in fade-in-0 duration-500")}>{slide.body}</div>;
  }
  return (
    <div className={cn("flex h-full flex-col gap-[2cqw] p-[3.8cqw]", animate && "animate-in fade-in-0 slide-in-from-right-2 duration-300")}>
      <div className="flex flex-col gap-[0.7cqw]">
        <span className={T.eyebrow}>{slide.eyebrow}</span>
        <h2 className={T.title}>{slide.title}</h2>
      </div>
      <div className="min-h-0 flex-1">{slide.body}</div>
      <div className="flex items-center justify-between text-[0.95cqw] text-muted-foreground">
        <span className="flex items-center gap-[0.4cqw]">
          <ShieldCheck weight="fill" className="text-brand" /> ProofLane
        </span>
        <span className="font-mono">built on the CooL SDK</span>
      </div>
    </div>
  );
}

const clamp = (n: number) => Math.min(Math.max(n, 0), slides.length - 1);

export function PitchDeck() {
  const hash = useHash();
  const index = clamp((parseInt(hash, 10) || 1) - 1);
  const [notes, setNotes] = useState(false);
  const [grid, setGrid] = useState(false);

  const go = useCallback((n: number) => setHash(String(clamp(n) + 1)), []);
  const present = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.getElementById("pitch-root")?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const current = clamp((parseInt(window.location.hash.slice(1), 10) || 1) - 1);
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(current + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(current - 1);
          break;
        case "Home":
          go(0);
          break;
        case "End":
          go(slides.length - 1);
          break;
        case "n":
        case "N":
          setNotes((v) => !v);
          break;
        case "g":
        case "G":
          setGrid((v) => !v);
          break;
        case "f":
        case "F":
          present();
          break;
        case "Escape":
          setNotes(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, present]);

  const slide = slides[index];
  const width = "deck-width w-[min(100%,calc((100dvh-6rem)*16/9))]";

  return (
    <div id="pitch-root" className="flex w-full flex-col items-center gap-3">
      <div className={cn(width, "@container relative aspect-video overflow-hidden rounded-xl border bg-background shadow-sm")}>
        <SlideView key={index} slide={slide} animate />
      </div>

      <div className={cn(width, "flex flex-wrap items-center gap-2")}>
        <Button variant="outline" size="icon-sm" aria-label="Previous slide" onClick={() => go(index - 1)} disabled={index === 0}>
          <CaretLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Next slide" onClick={() => go(index + 1)} disabled={index === slides.length - 1}>
          <CaretRight />
        </Button>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex min-w-24 flex-1 gap-0.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn("h-1.5 flex-1 rounded-full bg-border transition-colors", i <= index && "bg-brand")}
            />
          ))}
        </div>
        <Button variant={notes ? "secondary" : "ghost"} size="sm" onClick={() => setNotes((v) => !v)}>
          <Notepad data-icon="inline-start" />
          Notes <kbd className="font-mono text-muted-foreground">N</kbd>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setGrid(true)}>
          <GridFour data-icon="inline-start" />
          Slides <kbd className="font-mono text-muted-foreground">G</kbd>
        </Button>
        <Button variant="ghost" size="sm" onClick={present}>
          <ArrowsOut data-icon="inline-start" />
          Present <kbd className="font-mono text-muted-foreground">F</kbd>
        </Button>
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to website">
          <Link href="/">
            <House />
          </Link>
        </Button>
      </div>

      {notes && (
        <Card className={width}>
          <CardHeader>
            <CardDescription>
              Speaker notes · slide {index + 1} · {slide.eyebrow}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-base leading-relaxed">{slide.notes}</CardContent>
        </Card>
      )}

      <Dialog open={grid} onOpenChange={setGrid}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>All slides</DialogTitle>
            <DialogDescription>Click a slide to jump · press G to toggle</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  go(i);
                  setGrid(false);
                }}
                className="flex flex-col gap-1.5 text-left"
              >
                <div
                  inert
                  className={cn(
                    "@container pointer-events-none aspect-video overflow-hidden rounded-lg border bg-background",
                    i === index && "ring-2 ring-brand"
                  )}
                >
                  <SlideView slide={s} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {i + 1}. {s.eyebrow}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
