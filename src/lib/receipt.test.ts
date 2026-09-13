import { expect, it } from "vitest";
import { CooL } from "cool-nwc";
import { verifyEvidence } from "cool-nwc/verify";
import { buildAuditPack, disclose, verifyAuditPack, verifyDisclosure } from "cool-nwc/phala";
import { APPROVAL_ID, PAYMENT, tamperAmount } from "./receipt";
import { verifyReceipt, type TrustAnchor } from "./trust";

async function anchorOf(cool: CooL): Promise<TrustAnchor> {
  await cool.ready();
  const env = cool.environment;
  return { app_id: env.appId, mode: env.mode, key_directory: cool.keyDirectory, measurement: env.measurement };
}

it("verifies, discloses the approval ID, and rejects the $4,820 tamper", async () => {
  const cool = new CooL({ applicationId: "test" });
  const vault = { input: JSON.stringify(PAYMENT), output: "{}", state: APPROVAL_ID };
  const { evidence } = await cool.record({
    type: "agent.action",
    metadata: { action: "payment.release" },
    payloads: vault,
  });

  const verdict = await verifyEvidence(evidence);
  expect(verdict.ok).toBe(true);
  expect(verdict.checks.attestation.status).toBe("simulated");
  expect(JSON.stringify(evidence)).not.toContain("Harbor Freight");

  const disclosure = disclose(evidence, "state", APPROVAL_ID);
  expect(verifyDisclosure(evidence, disclosure).ok).toBe(true);

  const tampered = tamperAmount(evidence, vault);
  expect(tampered.input).toContain('"amount":"4820.00"');
  const bad = await verifyEvidence(tampered.receipt);
  expect(bad.ok).toBe(false);
  expect(bad.checks.binding.status).toBe("fail");
  expect(verifyDisclosure(evidence, tampered.forgedDisclosure).ok).toBe(false);

  const pack = buildAuditPack([evidence], { subject: "test" });
  expect((await verifyAuditPack(pack)).ok).toBe(true);

  await cool.close();
});

it("pinned trust rejects a receipt from a different signer", async () => {
  const operator = new CooL({ applicationId: "operator" });
  const impostor = new CooL({ applicationId: "impostor" });
  const trust = await anchorOf(operator);

  const genuine = await operator.record({ type: "agent.action", metadata: {} });
  const good = await verifyReceipt(genuine.evidence, trust);
  expect(good.verdict.ok && good.pin?.ok).toBe(true);

  const forged = await impostor.record({ type: "agent.action", metadata: {} });
  // Self-consistent on its own embedded keys...
  expect((await verifyEvidence(forged.evidence)).ok).toBe(true);
  // ...but not signed by the operator.
  expect((await verifyReceipt(forged.evidence, trust)).pin?.ok).toBe(false);

  await operator.close();
  await impostor.close();
});
