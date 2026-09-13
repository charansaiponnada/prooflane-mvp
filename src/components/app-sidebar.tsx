"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  Browsers,
  Flask,
  GithubLogo,
  House,
  PlayCircle,
  PresentationChart,
  SealCheck,
  ShieldCheck,
  SquaresFour,
} from "@phosphor-icons/react";
import { COOL_URL, GITHUB_URL } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { StatusBadge } from "@/components/ui/status-badge";

const platform = [
  { href: "/console", label: "Console", hint: "Workspace, ledger, auditors", icon: SquaresFour },
  { href: "/demo", label: "Guided demo", hint: "3-minute walkthrough", icon: PlayCircle },
  { href: "/verifier", label: "Verifier", hint: "Check any receipt", icon: SealCheck },
];

const resources = [
  { href: "/", label: "Website", icon: House, external: false },
  { href: "/pitch.html", label: "Pitch deck", icon: PresentationChart, external: false },
  { href: GITHUB_URL, label: "GitHub", icon: GithubLogo, external: true },
  { href: COOL_URL, label: "CooL SDK", icon: Browsers, external: true },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="ProofLane">
              <Link href="/console">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck weight="fill" size={18} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold">ProofLane</span>
                  <span className="font-mono text-xs text-muted-foreground">evidence platform</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platform.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    tooltip={item.label}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon size={18} />
                      <span className="flex flex-col leading-tight">
                        <span>{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.hint}</span>
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resources.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noreferrer">
                        <item.icon size={16} />
                        <span>{item.label}</span>
                        <ArrowSquareOut size={12} className="ml-auto text-muted-foreground" />
                      </a>
                    ) : (
                      <Link href={item.href}>
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <StatusBadge status="simulated" className="self-start">
          <Flask size={12} /> Simulated TEE
        </StatusBadge>
        <p className="text-xs text-muted-foreground">
          Real CooL receipts on synthetic data. Attestation is not hardware-backed.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const titles: Record<string, string> = {
  "/console": "Console",
  "/demo": "Guided demo",
  "/verifier": "Independent verifier",
};

export function PlatformHeader() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([href]) => pathname.startsWith(href))?.[1] ?? "Platform";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <span className="text-sm text-muted-foreground">Platform</span>
      <span className="text-sm text-muted-foreground">/</span>
      <span className="text-sm font-medium">{title}</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
