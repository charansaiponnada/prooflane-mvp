import Link from "next/link";
import { Brand, COOL_URL, GITHUB_URL } from "@/components/brand";
import { MarketingHeader } from "@/components/marketing-header";
import { Separator } from "@/components/ui/separator";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Brand />
            <Link href="/console" className="text-muted-foreground hover:text-foreground">Platform</Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground">Guided demo</Link>
            <Link href="/verifier" className="text-muted-foreground hover:text-foreground">Verifier</Link>
            <Link href="/pitch.html" className="text-muted-foreground hover:text-foreground">Pitch deck</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">GitHub</a>
            <a href={COOL_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">CooL SDK</a>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Hackathon build on synthetic data. Receipts are real CooL receipts; attestation is{" "}
            <span className="font-mono">simulated</span>, not hardware-backed.
          </p>
        </div>
      </footer>
    </div>
  );
}
