import Link from "next/link";
import {
  ArrowRight,
  DoorOpen,
  FileLock,
  Fingerprint,
  Gavel,
  GithubLogo,
  Play,
  PresentationChart,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
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
import { DEMO_VIDEO_EMBED, DEMO_VIDEO_URL } from "@/lib/cool-usage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pillars = [
  {
    icon: DoorOpen,
    title: "Gateway SDK",
    body: "Wrap any agent tool with proof.guard(). Each call is checked against policy and sealed into a CooL receipt before it runs. No receipt, no action.",
  },
  {
    icon: Fingerprint,
    title: "Receipt ledger",
    body: "Every authorization, refusal, and outcome lands in one RFC 6962 transparency log per workspace, with coverage and capture-loss metrics.",
  },
  {
    icon: UsersThree,
    title: "Evidence rooms",
    body: "Send an auditor a link. They verify in their own browser, see commitments instead of data, and request one field — each step sealed.",
  },
];

const steps = [
  ["Authorize", "The agent calls a consequential tool. ProofLane evaluates the payment policy (dual control above $25,000)."],
  ["Seal", "CooL commits the arguments and approval ref as salted hashes, binds with canonical CBOR, and signs with ML-DSA-65 + Ed25519."],
  ["Execute", "Only then does the tool run. Its result is sealed under the same execution id."],
  ["Prove", "A reviewer verifies offline, against pinned keys, and asks for exactly the field they need."],
];

const guarantees = [
  ["Changing any field — even $48,200 → $4,820", "Binding and hybrid signatures fail"],
  ["A receipt re-signed with someone else's key", "Rejected by pinned operator keys"],
  ["Receipts from a different build of the gateway", "Measurement mismatch fails the enclave check"],
  ["Removing or reordering a logged action", "RFC 6962 inclusion proof no longer matches the tree"],
  ["Disclosing a value that wasn't committed", "CooL refuses to build the disclosure; verifiers reject it"],
  ["Simulated attestation presented as hardware", "Always reported as simulated, never pass"],
];

const code = `const proof = new ProofLane({ apiKey, agent: "payments-agent" });

const releasePayment = proof.guard(
  "payment.release",
  bank.releasePayment,
  (args) => ({ id: args.approval_id, approvers: args.approvers })
);

await releasePayment({ amount: 48200, beneficiary, approval_id, approvers });
// → authorized + completed receipts, or ProofLaneBlockedError with a signed refusal`;

export default function ProductPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16">
      <section className="relative isolate -mx-4 overflow-hidden rounded-2xl border sm:mx-0">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="pl-motion-grid absolute inset-0" />
          <div className="pl-orbit absolute top-1/2 left-3/4 size-[34rem] -translate-1/2" />
          <div className="pl-orbit pl-orbit-reverse absolute top-1/2 left-3/4 size-[22rem] -translate-1/2" />
          <div className="pl-orbit absolute top-1/2 left-3/4 size-[10rem] -translate-1/2" />
          <div className="pl-pulse absolute top-1/2 left-3/4 size-3 -translate-1/2 rounded-full bg-foreground" />
        </div>
        <div className="flex flex-col gap-5 px-6 py-16 sm:px-10 sm:py-24">
          <Badge variant="outline" className="bg-background">
            For regulated teams deploying AI agents · built on CooL
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Prove what your AI agent did — to people who don&apos;t trust your logs.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            ProofLane is the evidence gateway for consequential agent actions. It gates payment releases on
            policy, seals every decision into an independently verifiable receipt, and lets auditors check it
            without seeing your customers&apos; data.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/demo">
                <Play data-icon="inline-start" />
                Try the live demo — no login
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background">
              <a href="#video">
                <Play data-icon="inline-start" />
                Watch the 3-minute video
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background">
              <Link href="/pitch.html">
                <PresentationChart data-icon="inline-start" />
                Pitch
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background">
              <a href="https://github.com/charansaiponnada/prooflane-mvp" target="_blank" rel="noreferrer">
                <GithubLogo data-icon="inline-start" />
                GitHub
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/console">
                Open the console
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="video" className="flex scroll-mt-20 flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">See it in 3 minutes — pitch and live demo</h2>
          <a
            href={DEMO_VIDEO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Open on YouTube
          </a>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl border bg-muted">
          <iframe
            // Browsers only allow autoplay when muted; viewers unmute with the player controls.
            src={`${DEMO_VIDEO_EMBED}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0`}
            title="ProofLane pitch and live demo"
            className="size-full"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      <section id="product" className="grid scroll-mt-20 gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardHeader>
              <Icon size={24} />
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section id="how" className="grid scroll-mt-20 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="flex flex-col gap-3">
            {steps.map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{title}</span>
                  <span className="text-sm text-muted-foreground">{body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ten lines in your agent</CardTitle>
            <CardDescription>Works with OpenAI, Anthropic, LangChain, or MCP tool handlers.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{code}</pre>
          </CardContent>
        </Card>
      </section>

      <section id="security" className="flex scroll-mt-20 flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} />
          <h2 className="text-lg font-semibold">What a reviewer can catch — without your backend</h2>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>If someone tries…</TableHead>
                  <TableHead>CooL verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guarantees.map(([attack, result]) => (
                  <TableRow key={attack}>
                    <TableCell className="whitespace-normal">{attack}</TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">{result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section id="pilot" className="grid scroll-mt-20 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Gavel size={24} />
            <CardTitle className="text-lg font-semibold">Who buys it</CardTitle>
            <CardDescription>
              Heads of AI platform, security, model risk, and internal audit at fintechs and regulated
              financial-services firms whose agents can move money — and who will one day be asked to prove
              what happened.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <FileLock size={24} />
            <CardTitle className="text-lg font-semibold">How we start</CardTitle>
            <CardDescription>
              A paid 8–12 week design-partner pilot on one action — payment release — measuring evidence-pack
              time, reconstruction time, and sensitive fields shared, before and after.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/pitch.html">Pilot details</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-2 pb-10 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Honest boundary</p>
        <p>
          ProofLane proves the integrity of a captured execution statement. It does not prove a decision was
          correct, fair, or legal, that nothing bypassed the gateway, or hardware security — this deployment
          uses CooL&apos;s simulated TEE and says so on every receipt.
        </p>
      </section>
    </div>
  );
}
