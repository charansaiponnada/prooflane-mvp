"use client";

import { Flask, ShieldCheck, ShieldWarning } from "@phosphor-icons/react";
import type { VerdictV2 } from "cool-nwc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOMAINS, statusOf } from "@/lib/receipt";
import type { PinCheck } from "@/lib/trust";

export function VerdictCard({
  verdict,
  pin,
  title = "Receipt verdict",
  description,
}: {
  verdict: VerdictV2;
  pin?: PinCheck | null;
  title?: string;
  description?: string;
}) {
  const simulated = verdict.checks.attestation.status === "simulated";
  const ok = verdict.ok && (!pin || pin.ok);
  const reasons = [...verdict.reasons, ...(pin && !pin.ok ? [`key pin: ${pin.detail}`] : [])];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction>
          <StatusBadge
            status={ok ? "verified" : "invalid"}
            className="px-3 py-1 text-sm"
          >
            {ok ? (
              <ShieldCheck weight="fill" size={18} />
            ) : (
              <ShieldWarning weight="fill" size={18} />
            )}
            {ok ? "Valid" : "Invalid"}
          </StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DOMAINS.map(({ key, label }) => {
              const check = verdict.checks[key];
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>
                    <StatusBadge status={statusOf(check.status)}>
                      {check.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="min-w-56 whitespace-normal text-muted-foreground">
                    {check.detail}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell className="font-medium">Operator key pinning</TableCell>
              <TableCell>
                <StatusBadge status={pin ? (pin.ok ? "verified" : "invalid") : "neutral"}>
                  {pin ? (pin.ok ? "pass" : "fail") : "not pinned"}
                </StatusBadge>
              </TableCell>
              <TableCell className="min-w-56 whitespace-normal text-muted-foreground">
                {pin
                  ? pin.detail
                  : "Checked against the receipt's own embedded keys only — pin the operator's published keys to rule out key substitution."}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {!ok && reasons.length > 0 && (
          <Alert variant="destructive">
            <ShieldWarning weight="fill" />
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {simulated && (
          <Alert>
            <Flask className="text-simulated" />
            <AlertTitle>Simulated attestation — not hardware assurance</AlertTitle>
            <AlertDescription>
              The quote chains to the CooL simulator root, not Intel TDX. A
              production dstack deployment is required for a hardware pass.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
