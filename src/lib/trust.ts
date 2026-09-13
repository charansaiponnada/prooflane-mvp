import type { KeyDirectory, Measurement, ReceiptV2, VerdictV2 } from "cool-nwc";
import { verifyEvidence, withTrustedKeys } from "cool-nwc/verify";

/**
 * Trust material a verifier pins ahead of time — the operator's published
 * signing keys and the measurement of the approved deployment. Like a JWKS:
 * fetched or received once, out of band, then every receipt is checked offline.
 */
export type TrustAnchor = {
  app_id: string;
  mode: string;
  key_directory: KeyDirectory;
  measurement: Measurement;
};

export type PinCheck = { ok: boolean; detail: string };

/** The receipt must be signed by a pinned key, with the pinned public key bytes. */
export function checkKeyPin(receipt: unknown, trusted: KeyDirectory): PinCheck {
  const r = receipt as Partial<ReceiptV2> | null;
  const keyId = r?.record?.signature?.key_id;
  if (!keyId) return { ok: false, detail: "receipt carries no signing key id" };
  const pinned = trusted[keyId];
  if (!pinned) {
    return {
      ok: false,
      detail: `signing key ${keyId} is not in the pinned operator key directory — possible key substitution`,
    };
  }
  if (JSON.stringify(pinned) !== JSON.stringify(r.key_directory?.[keyId])) {
    return { ok: false, detail: "embedded public key differs from the pinned key" };
  }
  return { ok: true, detail: `signed by pinned operator key ${keyId}` };
}

/**
 * Verify a receipt from its bytes. With a trust anchor, the pinned keys replace
 * whatever the receipt embeds and the deployment measurement is enforced, so a
 * receipt re-signed by an attacker's key or produced by different code fails.
 */
export async function verifyReceipt(
  receipt: unknown,
  trust?: TrustAnchor | null
): Promise<{ verdict: VerdictV2; pin: PinCheck | null }> {
  if (!trust) return { verdict: await verifyEvidence(receipt), pin: null };
  const pin = checkKeyPin(receipt, trust.key_directory);
  let subject = receipt;
  try {
    subject = withTrustedKeys(receipt as ReceiptV2, trust.key_directory);
  } catch {
    // Malformed receipt: let the verifier report structured failures.
  }
  const verdict = await verifyEvidence(subject, {
    expectedMeasurement: trust.measurement,
  });
  return { verdict, pin };
}
