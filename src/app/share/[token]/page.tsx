"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowSquareOut, Eye, FileLock, Question, WifiSlash } from "@phosphor-icons/react";
import type { ReceiptV2 } from "cool-nwc";
import { verifyAuditPack, verifyDisclosure, type AuditPack, type PackVerdict } from "cool-nwc/phala";
import { toast } from "sonner";
import { ReceiptView } from "@/components/receipt-view";
import { VerdictCard } from "@/components/verdict-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DisclosureRequest, Entry } from "@/lib/ledger";
import { downloadJson, STORAGE_KEY } from "@/lib/receipt";
import { verifyReceipt, type PinCheck, type TrustAnchor } from "@/lib/trust";

type Room = {
  label: string;
  workspace: string;
  created_at: string;
  expires_at: string;
  entries: (Entry & { receipt: ReceiptV2 })[];
  pack: AuditPack;
  trust: TrustAnchor;
  requests: DisclosureRequest[];
};
type Checked = Room["entries"][number] & {
  verdict: Awaited<ReturnType<typeof verifyReceipt>>["verdict"];
  pin: PinCheck | null;
};
type Field = "input" | "output" | "state";

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

type Loaded = { room: Room; rows: Checked[]; pack: PackVerdict };

async function fetchRoom(token: string): Promise<Loaded> {
  const res = await fetch(`/api/share/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  const room = data as Room;
  // Everything below runs locally; the server's own verdicts are never used.
  const rows = await Promise.all(
    room.entries.map(async (e) => ({ ...e, ...(await verifyReceipt(e.receipt, room.trust)) }))
  );
  const pack = await verifyAuditPack(room.pack, { expectedMeasurement: room.trust.measurement });
  return { room, rows, pack };
}

export default function EvidenceRoomPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [rows, setRows] = useState<Checked[]>([]);
  const [pack, setPack] = useState<PackVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Checked | null>(null);
  const [asking, setAsking] = useState<Checked | null>(null);

  const apply = useCallback((data: Loaded) => {
    setRoom(data.room);
    setRows(data.rows);
    setPack(data.pack);
  }, []);

  const load = useCallback(
    () => fetchRoom(token).then(apply, (e) => setError(message(e))),
    [token, apply]
  );

  useEffect(() => {
    fetchRoom(token).then(apply, (e) => setError(message(e)));
  }, [token, apply]);

  if (error) {
    return (
      <Alert variant="destructive">
        <FileLock />
        <AlertTitle>Evidence room unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!room) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading and verifying evidence…
      </div>
    );
  }

  const receiptOf = (recordId: string) => rows.find((r) => r.record_id === recordId)?.receipt;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Evidence room · {room.workspace}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{room.label}</h1>
        <p className="text-sm text-muted-foreground">
          Shared {new Date(room.created_at).toLocaleString()} · expires {new Date(room.expires_at).toLocaleDateString()}
        </p>
      </section>

      <Alert>
        <WifiSlash />
        <AlertTitle>You are not asked to trust the operator&apos;s verdicts</AlertTitle>
        <AlertDescription>
          Every receipt below was re-verified in your browser with the CooL verifier. Sensitive fields are
          commitments only. The signing keys shown were published by the operator — for full independence,
          compare them with keys received through another channel in the{" "}
          <Link href="/verifier">independent verifier</Link>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Audit pack</CardTitle>
          <CardDescription>
            {pack ? `${pack.obligationsCovered}/${pack.obligationsTotal} mapped obligations have receipts behind them.` : ""}
          </CardDescription>
          <CardAction>
            {pack && (
              <StatusBadge
                status={pack.ok && rows.every((r) => r.pin?.ok) ? "verified" : "invalid"}
                className="px-3 py-1 text-sm"
              >
                {pack.verified}/{pack.total} verified
              </StatusBadge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadJson("audit-pack.json", room.pack)}>
            <FileLock data-icon="inline-start" />
            Download audit pack
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ receipt: room.pack, trust: room.trust }));
              } catch {}
              router.push("/verifier");
            }}
          >
            <ArrowSquareOut data-icon="inline-start" />
            Re-check in verifier
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Receipts</CardTitle>
          <CardDescription>Select a receipt to inspect it, or request one committed field.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sealed</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Execution</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const ok = row.verdict.ok && (!row.pin || row.pin.ok);
                return (
                  <TableRow key={row.record_id}>
                    <TableCell className="font-mono text-xs">{new Date(row.sealed_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={/\.(blocked|denied|failed)$/.test(row.type) ? "invalid" : "neutral"}>
                        {row.type}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.execution_id}</TableCell>
                    <TableCell>
                      <StatusBadge status={ok ? "verified" : "invalid"}>{ok ? "valid" : "invalid"}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(row)}>
                          Inspect
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAsking(row)}>
                          <Question data-icon="inline-start" />
                          Request field
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {room.requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Disclosure requests</CardTitle>
            <CardDescription>Approved values are checked here against the original commitment.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {room.requests.map((r) => {
              const receipt = receiptOf(r.record_id);
              const check = r.disclosure && receipt ? verifyDisclosure(receipt, r.disclosure) : null;
              return (
                <Alert key={r.id} variant={r.status === "denied" || (check && !check.ok) ? "destructive" : "default"}>
                  <Eye />
                  <AlertTitle className="flex flex-wrap items-center gap-2">
                    <span className="font-mono">{r.field}</span> of <span className="font-mono">{r.record_id}</span>
                    <StatusBadge status={r.status === "denied" ? "invalid" : "neutral"}>{r.status}</StatusBadge>
                    {check && (
                      <StatusBadge status={check.ok ? "verified" : "invalid"}>
                        {check.ok ? "matches commitment" : "mismatch"}
                      </StatusBadge>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {r.disclosure && <p className="font-mono break-all text-foreground">{r.disclosure.value}</p>}
                    <p>
                      Requested by {r.requester} · {r.receipts.length} receipt(s) seal this request&apos;s history
                    </p>
                  </AlertDescription>
                </Alert>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.type}</SheetTitle>
                <SheetDescription>{selected.execution_id}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-4">
                <VerdictCard verdict={selected.verdict} pin={selected.pin} />
                <ReceiptView receipt={selected.receipt} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <RequestDialog
        token={token}
        row={asking}
        onClose={() => setAsking(null)}
        onDone={async () => {
          setAsking(null);
          await load();
        }}
      />
    </div>
  );
}

function RequestDialog({
  token,
  row,
  onClose,
  onDone,
}: {
  token: string;
  row: Checked | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [field, setField] = useState<Field>("state");
  const [requester, setRequester] = useState("auditor@bank.example");
  const [reason, setReason] = useState("Confirm the approval reference for this payment.");
  const [busy, setBusy] = useState(false);
  const commitments = row?.receipt.record.schema === "cool.evidence.v1" ? row.receipt.record.event.commitments : null;
  const available = (["input", "output", "state"] as const).filter((f) => commitments?.[f]);

  async function submit() {
    if (!row) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/share/${token}/requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ record_id: row.record_id, field, requester, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Request sent — it is sealed into the operator's log");
      await onDone();
    } catch (e) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request one committed field</DialogTitle>
          <DialogDescription>
            The operator sees your request and can disclose exactly that value — which you can check against
            the receipt yourself. Nothing else is opened.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Field</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={available.includes(field) ? field : ""}
              onValueChange={(v) => v && setField(v as Field)}
            >
              {available.map((f) => (
                <ToggleGroupItem key={f} value={f} className="font-mono">
                  {f}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="requester">Your identity</FieldLabel>
            <Input id="requester" value={requester} onChange={(e) => setRequester(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="reason">Reason</FieldLabel>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button onClick={submit} disabled={busy || !available.includes(field) || !requester.trim() || !reason.trim()}>
            {busy && <Spinner data-icon="inline-start" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
