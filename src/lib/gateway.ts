import { CooL } from "cool-nwc";
import { SimulatedDstackClient } from "cool-nwc/phala";
import type { TrustAnchor } from "./trust";

const APP = "prooflane";

/**
 * The simulated dstack guest agent every evidence plane in this deployment uses.
 *
 * The simulator derives signing keys from (root seed, app, image digest).
 * - A secret root seed keeps keys underivable by anyone else and identical
 *   across serverless instances, so verifiers can pin them.
 * - The image digest is the deployed build, so shipping different code yields a
 *   different measurement and different keys — receipts stay tied to the build.
 */
export const dstack = new SimulatedDstackClient({
  appName: APP,
  imageDigest: `sha256:${process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? "local-development"}`,
  rootSeed: process.env.COOL_SIM_ROOT_SEED ?? "prooflane-insecure-local-seed",
});

// Used by the guided demo gateway and to publish the trust anchor.
export const cool = new CooL({ applicationId: "northstar-payments", dstackClient: dstack });

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
