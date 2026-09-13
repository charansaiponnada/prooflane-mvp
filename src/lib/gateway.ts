import { CooL } from "cool-nwc";
import { SimulatedDstackClient } from "cool-nwc/phala";
import type { TrustAnchor } from "@/lib/trust";

const APP = "northstar-payments";

/**
 * The evidence plane for the gateway.
 *
 * The simulator derives the signing key from (root seed, app, image digest).
 * - A secret root seed keeps the key underivable by anyone else and identical
 *   across serverless instances, so verifiers can pin it.
 * - The image digest is the deployed commit, so shipping different code yields a
 *   different measurement and a different key — receipts stay tied to the build.
 */
// ponytail: one process-wide plane + in-memory transparency log; each serverless instance has its own log. Use a durable EvidenceLog when receipts need a shared tree.
export const cool = new CooL({
  applicationId: APP,
  dstackClient: new SimulatedDstackClient({
    appName: APP,
    imageDigest: `sha256:${process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? "local-development"}`,
    rootSeed: process.env.COOL_SIM_ROOT_SEED ?? "prooflane-insecure-local-seed",
  }),
});

export async function trustAnchor(): Promise<TrustAnchor> {
  await cool.ready();
  const env = cool.environment;
  return {
    app_id: env.appId,
    mode: env.mode,
    key_directory: cool.keyDirectory,
    measurement: env.measurement,
  };
}
