"use client";

import { CaretDown, Copy, EyeSlash, FileLock, Flask } from "@phosphor-icons/react";
import type { ReceiptV2 } from "cool-nwc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HashValue({ value, label }: { value: string; label?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate font-mono text-xs tabular-nums">{value}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-md font-mono break-all">
          {value}
        </TooltipContent>
      </Tooltip>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Copy ${label ?? "value"}`}
        onClick={() =>
          navigator.clipboard
            .writeText(value)
            .then(() => toast.success(`Copied ${label ?? "value"}`))
        }
      >
        <Copy />
      </Button>
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AttestationBadge({ mode }: { mode: string }) {
  if (mode === "simulated") {
    return (
      <StatusBadge status="simulated">
        <Flask size={14} /> Simulated
      </StatusBadge>
    );
  }
  return <StatusBadge status="neutral">{mode}</StatusBadge>;
}

export function ReceiptView({ receipt }: { receipt: ReceiptV2 }) {
  const record = receipt.record;
  if (record.schema !== "cool.evidence.v1") return null;
  const event = record.event;
  const c = event.commitments;
  const json = JSON.stringify(receipt, null, 2);

  const hidden = [
    { label: "Input · tool arguments", field: "input", commitment: c.input },
    { label: "Output · tool result", field: "output", commitment: c.output },
    { label: "State · approval ref", field: "state", commitment: c.state },
    { label: "Metadata · policy", field: "metadata", commitment: event.metadata_hash },
  ].filter((item) => item.commitment);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <FileLock size={20} /> Portable receipt
        </CardTitle>
        <CardDescription className="font-mono">
          {receipt.schema} · {new Blob([json]).size.toLocaleString()} bytes
        </CardDescription>
        <CardAction>
          <AttestationBadge mode={receipt.attestation.mode} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Row label="Record ID">
          <HashValue value={record.record_id} label="record ID" />
        </Row>
        <Row label="Execution ID">
          <HashValue value={event.execution_id} label="execution ID" />
        </Row>
        <Row label="Event type">
          <span className="font-mono text-xs">{event.type}</span>
        </Row>
        <Row label="Software">
          <span className="font-mono text-xs">
            {event.software
              ? `${event.software.name}@${event.software.version}`
              : "—"}
          </span>
        </Row>
        <Row label="Issued at">
          <span className="font-mono text-xs">{record.time.issued_at}</span>
        </Row>
        <Row label="Binding hash">
          <HashValue value={receipt.binding_hash} label="binding hash" />
        </Row>
        <Row label="Signing key">
          <HashValue value={record.signature.key_id} label="key ID" />
        </Row>
        <Row label="Log inclusion">
          <span className="font-mono text-xs tabular-nums">
            {receipt.inclusion
              ? `leaf ${receipt.inclusion.leaf_index} of ${receipt.inclusion.tree_size}`
              : "absent"}
          </span>
        </Row>

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Committed, not included
          </span>
          {hidden.map((item) => (
            <Row key={item.field} label={item.label}>
              <div className="flex min-w-0 items-center gap-2">
                <EyeSlash size={16} className="shrink-0 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  ••••••••
                </span>
                {item.commitment && (
                  <HashValue value={item.commitment} label={`${item.field} commitment`} />
                )}
              </div>
            </Row>
          ))}
        </div>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <CaretDown data-icon="inline-start" />
              Raw receipt JSON
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-72 rounded-md border">
              <pre className="p-3 font-mono text-xs">{json}</pre>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
