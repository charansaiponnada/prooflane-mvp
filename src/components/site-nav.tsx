"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ShieldStar } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Control Room" },
  { href: "/verifier", label: "Verifier" },
  { href: "/pitch.html", label: "Pitch" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck weight="fill" size={18} className="text-primary" />
          <span className="text-sm font-semibold tracking-tight">
            ProofLane
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            evidence gateway
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:flex">
            <ShieldStar size={12} />
            demo
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}