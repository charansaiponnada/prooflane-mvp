import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export const GITHUB_URL = "https://github.com/charansaiponnada/prooflane-mvp";
export const COOL_URL = "https://github.com/Northwind-Cipher/cool-sdk";

/** Small italic marker on steps where the CooL SDK does the work. */
export function UsesCool({ apis }: { apis: string }) {
  return (
    <a
      href={COOL_URL}
      target="_blank"
      rel="noreferrer"
      className="self-start text-xs text-primary italic underline-offset-2 hover:underline"
    >
      uses CooL SDK · <span className="font-mono">{apis}</span>
    </a>
  );
}

export function Brand({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <ShieldCheck weight="fill" size={20} />
      <span className="text-sm font-semibold tracking-tight">ProofLane</span>
      {suffix && <span className="font-mono text-xs text-muted-foreground">{suffix}</span>}
    </Link>
  );
}
