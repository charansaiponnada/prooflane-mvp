import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

export const metadata: Metadata = {
  title: "ProofLane — Pitch",
  description: "The evidence does not have to come from a system you trust.",
};

const why = [
  ["EU AI Act, Article 12", "Automatic event recording and traceability for high-risk AI systems", "Regulatory fact"],
  ["AAA/ICDR/IResearch (500 leaders)", "Only 22% very confident they can produce governance evidence; 87% have some AI governance", "Survey"],
  ["IBM/Ponemon (600 orgs)", "13% had AI model/app breaches; 97% of those lacked proper AI access controls", "Security research"],
  ["IBM/Ponemon incident outcomes", "60% of AI incidents compromised data; 31% caused operational disruption", "Security research"],
  ["OpenTelemetry GenAI / Foundry tracing", "Traces capture tool arguments and results — and warn they are sensitive", "Technical standard"],
];

const flow = [
  ["Capture", "Gateway intercepts the consequential tool call"],
  ["Commit", "Salted commitments to input, output, approval — plaintext stays home"],
  ["Sign", "Deterministic CBOR binding, ML-DSA-65 + Ed25519"],
  ["Package", "Portable cool.receipt.v2 with RFC 6962 inclusion"],
  ["Verify", "Anyone, offline, no operator backend"],
];

const isNot = [
  "Proof the AI decision was correct, fair, safe, or legal",
  "A replacement for OpenTelemetry, SIEM, or IAM",
  "Compliance certification",
  "Proof every event was captured, or that the app did not lie before capture",
  "Hardware security — the demo's attestation is simulated, and says so",
];

const buyers = [
  ["Economic buyer", "CISO, Head of AI Platform, CRO, Head of Model Risk, Internal Audit"],
  ["Technical champion", "AI platform / security engineering lead"],
  ["Evidence consumer", "Audit, compliance, legal, fraud investigation — in the room from day one"],
];

const metrics = [
  ["Evidence-pack preparation time", "Measure today", "Reduce"],
  ["Systems manually correlated", "Count today", "Reduce for the action"],
  ["Sensitive fields shared", "Count today", "Reduce"],
  ["Incident reconstruction time", "Measure today", "Reduce"],
  ["Receipt loss rate (sync action)", "—", "Zero; visible otherwise"],
  ["Evidence consumer acceptance", "—", "Yes, and willing to pay"],
];

const roadmap = [
  ["Phase 0", "Hackathon proof", "Agent, gateway, real CooL receipt, verifier, disclosure, tamper demo"],
  ["Phase 1", "Design-partner MVP", "Sync boundary integration, evidence packs, OTel/SIEM links, coverage metrics"],
  ["Phase 2", "Production readiness", "Key rotation, witnesses, real dstack/TDX quotes, air-gapped verify"],
  ["Phase 3", "Vertical packs", "Fraud, credit, vendor assurance, model/prompt change control"],
];

const risks = [
  ["“We already have logs”", "Reframe on portability and independence, lead with measured evidence cost"],
  ["Reviewer won't accept the receipt", "Bring audit/legal into pilot design before building"],
  ["Agent bypasses the gateway", "Enforced path: no receipt → no action, with coverage monitoring"],
  ["Overclaiming", "Always: proves integrity of a captured execution statement — nothing more"],
];

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {head.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row[0]}>
                {row.map((cell, i) => (
                  <TableCell
                    key={i}
                    className={i === 0 ? "font-medium whitespace-normal" : "whitespace-normal text-muted-foreground"}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function PitchPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12">
      <section className="flex flex-col gap-4 py-8">
        <Badge variant="outline">ProofLane · built on CooL SDK</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          The evidence does not have to come from a system you trust.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          ProofLane creates privacy-preserving, independently verifiable
          receipts for consequential AI-agent actions — so auditors, customers,
          and regulators can verify what happened without trusting the
          operator&apos;s logs.
        </p>
        <Card>
          <CardContent className="font-mono text-sm tabular-nums">
            An AI agent releases a <span className="font-semibold">$48,200</span>{" "}
            payment. Six months later it&apos;s disputed. Change it to{" "}
            <span className="font-semibold">$4,820</span> — and the proof fails.
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/">
              Run the live demo
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/verifier">Open the verifier</Link>
          </Button>
        </div>
      </section>

      <Section eyebrow="Problem" title="Who controls the evidence?">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <CardDescription>
                Traces, cloud audit logs, IAM records, approval tickets, model
                metadata — fragmented, mutable, and controlled by the operator.
                The reviewer must trust the backend, the exporter, and the
                retention config. The raw data holds account numbers and
                prompts that can&apos;t be shared.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>With ProofLane</CardTitle>
              <CardDescription>
                One portable receipt created at the action boundary. Sensitive
                fields are committed, not copied. A stranger verifies it
                offline, and the operator opens exactly one field on request.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section eyebrow="Why now" title="Traceability is becoming mandatory; evidence readiness isn't there">
        <SimpleTable head={["Source", "Finding", "Type"]} rows={why} />
        <p className="text-sm text-muted-foreground">
          These establish the underlying pain. They do not prove budget for
          receipts — that is what the paid pilot validates.
        </p>
      </Section>

      <Section eyebrow="How it works" title="Capture → Commit → Sign → Package → Verify">
        <div className="grid gap-3 sm:grid-cols-5">
          {flow.map(([step, detail], i) => (
            <Card key={step} size="sm">
              <CardHeader>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <CardTitle>{step}</CardTitle>
                <CardDescription>{detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Honest boundary" title="What ProofLane is not">
        <Card>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
              {isNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Separator className="my-4" />
            <p className="text-sm font-medium">
              It proves the integrity of a captured execution statement,
              reducing the evidence consumer&apos;s dependence on
              operator-controlled logs.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section eyebrow="Customer" title="Regulated fintech with agents that move money">
        <p className="text-sm text-muted-foreground">
          Start with mid-sized fintech and regulated financial services — fast
          decisions, real consequence — before tier-one banks.
        </p>
        <SimpleTable head={["Role", "Who"]} rows={buyers} />
      </Section>

      <Section eyebrow="Business model" title="Paid design-partner pilot, one action, 8–12 weeks">
        <p className="text-sm text-muted-foreground">
          Gateway integration, verifier setup, disclosure workflow, evidence-pack
          export, and before/after measurement. Then an annual platform fee;
          usage and managed assurance only after value is proven. We sell
          reduced evidence cost — never hashes.
        </p>
        <SimpleTable head={["Pilot metric", "Baseline", "Target"]} rows={metrics} />
      </Section>

      <Section eyebrow="Roadmap" title="Earn expansion one action at a time">
        <SimpleTable head={["Phase", "Goal", "Deliver"]} rows={roadmap} />
      </Section>

      <Section eyebrow="Risks" title="Where it fails, and what we do about it">
        <SimpleTable head={["Risk", "Mitigation"]} rows={risks} />
      </Section>

      <Separator />

      <section className="flex flex-col items-start gap-4 pb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          One payment action. One evidence consumer. One paid pilot.
        </h2>
        <p className="text-muted-foreground">
          The evidence does not have to come from a system you trust.
        </p>
        <Button asChild size="lg">
          <Link href="/">
            See it verify — and fail
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
