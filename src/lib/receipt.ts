import {
  saltedCommit,
  type DomainStatusV2,
  type ReceiptV2,
  type VerdictChecksV2,
} from "cool-nwc";
import type { Disclosure } from "cool-nwc/phala";

export const APPROVAL_ID = "APR-2026-0912-7731";

// Synthetic demo data only — never real payments or customer data.
export const PAYMENT = {
  payment_id: "PAY-88213",
  beneficiary: "Harbor Freight Logistics Ltd",
  account: "GB29 NWBK 6016 1331 9268 19",
  amount: "48200.00",
  currency: "USD",
  reference: "INV-2026-4471",
};

export const SOFTWARE = {
  name: "northstar-payment-agent",
  version: "1.4.2",
  digest: null,
};

/** Plaintext the operator keeps; it never enters the receipt. */
export type Vault = { input: string; output: string; state: string };

export type CaptureStats = {
  attempted: number;
  succeeded: number;
  failed: number;
};

export const DOMAINS: { key: keyof VerdictChecksV2; label: string }[] = [
  { key: "binding", label: "Binding" },
  { key: "signature", label: "Signature · ML-DSA-65 + Ed25519" },
  { key: "inclusion", label: "Transparency inclusion · RFC 6962" },
  { key: "witnesses", label: "External witnesses" },
  { key: "attestation", label: "Attestation" },
  { key: "enclave", label: "Enclave binding" },
  { key: "anchor", label: "Anchor" },
];

export function statusOf(status: DomainStatusV2) {
  if (status === "pass") return "verified" as const;
  if (status === "fail") return "invalid" as const;
  if (status === "simulated") return "simulated" as const;
  return "neutral" as const;
}

/**
 * The attacker's edit: change $48,200 to $4,820 inside the receipt. The input
 * commitment is recomputed with the original salt so the receipt still looks
 * well-formed — only the binding and signatures can catch it.
 */
export function tamperAmount(receipt: ReceiptV2, vault: Vault) {
  const record = receipt.record;
  if (record.schema !== "cool.evidence.v1" || !record.event.commitments.input_salt) {
    throw new Error("receipt has no input commitment to tamper with");
  }
  const salt = record.event.commitments.input_salt;
  const input = vault.input.replace('"amount":"48200.00"', '"amount":"4820.00"');
  const tampered = {
    ...receipt,
    record: {
      ...record,
      event: {
        ...record.event,
        commitments: {
          ...record.event.commitments,
          input: saltedCommit(salt, input),
        },
      },
    },
  } as ReceiptV2;
  // The same lie told as a disclosure against the untouched receipt.
  const forgedDisclosure: Disclosure = {
    schema: "cool.disclosure.v1",
    record_id: record.record_id,
    binding_hash: receipt.binding_hash,
    field: "input",
    value: input,
    salt,
    commitment: record.event.commitments.input!,
  };
  return { receipt: tampered, input, forgedDisclosure };
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const STORAGE_KEY = "prooflane:handoff";
