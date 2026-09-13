"use client";

import { ShieldCheck, ShieldWarning, Flask } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          ProofLane Control Room
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tamper-evident evidence for actions that change digital risk. Capture
          a payment release, receive a signed receipt with a cold-anchor
          binding, then verify it offline — in the browser, no backend
          required.
        </p>
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status vocabulary
            </span>
            <StatusBadge status="verified">
              <ShieldCheck weight="fill" size={14} /> Verified
            </StatusBadge>
            <StatusBadge status="invalid">
              <ShieldWarning weight="fill" size={14} /> Invalid
            </StatusBadge>
            <StatusBadge status="simulated">
              <Flask size={14} /> Simulated
            </StatusBadge>
            <StatusBadge status="neutral">Pending</StatusBadge>
          </CardContent>
        </Card>
      </section>
      <p className="text-sm text-muted-foreground">
        Control Room capture flow ships in the next step.
      </p>
    </div>
  );
}