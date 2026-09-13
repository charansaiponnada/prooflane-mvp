/** Where ProofLane calls the CooL SDK — one list shared by the dashboard and the pitch deck. */

export const REPO_URL = "https://github.com/charansaiponnada/prooflane-mvp";
export const COOL_SDK_URL = "https://github.com/Northwind-Cipher/cool-sdk";
export const sourceUrl = (file: string) => `${REPO_URL}/blob/main/${file}`;
export const DEMO_VIDEO_URL = "https://youtu.be/p-M4uQmwT1I";
export const DEMO_VIDEO_EMBED = "https://www.youtube-nocookie.com/embed/p-M4uQmwT1I";

export type CoolMetric =
  | "sealed"
  | "evaluated"
  | "tree"
  | "measurement"
  | "verified"
  | "disclosed"
  | "shares"
  | "p99";

export type CoolUsage = {
  step: number;
  api: string;
  module: "cool-nwc" | "cool-nwc/phala" | "cool-nwc/verify";
  where: "gateway" | "browser";
  purpose: string;
  file: string;
  metric: CoolMetric;
  metricLabel: string;
};

export const COOL_USAGE: CoolUsage[] = [
  {
    step: 1,
    api: "evaluate(PolicySet)",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Decide payment.release under dual-control policy; decision + policy_hash are sealed",
    file: "src/lib/policy.ts",
    metric: "evaluated",
    metricLabel: "actions evaluated",
  },
  {
    step: 2,
    api: "SimulatedDstackClient · sealedKeyset",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Measurement-sealed signing and log keys bound to the deployed build",
    file: "src/lib/gateway.ts",
    metric: "measurement",
    metricLabel: "measurement",
  },
  {
    step: 3,
    api: "CoolTee.connect · tee.record",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Commit, bind (CBOR), sign (ML-DSA-65 + Ed25519) every authorization, refusal and outcome",
    file: "src/lib/ledger.ts",
    metric: "sealed",
    metricLabel: "receipts sealed",
  },
  {
    step: 4,
    api: "EvidenceLog · MemoryLog",
    module: "cool-nwc",
    where: "gateway",
    purpose: "One RFC 6962 transparency tree per workspace, persisted and replayed across instances",
    file: "src/lib/ledger.ts",
    metric: "tree",
    metricLabel: "tree size",
  },
  {
    step: 5,
    api: "tee.stats()",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Measured capture cost and loss on the evidence path",
    file: "src/lib/ledger.ts",
    metric: "p99",
    metricLabel: "p99 enqueue",
  },
  {
    step: 6,
    api: "buildAuditPack · coverage",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Package receipts, keys and obligation coverage for evidence rooms",
    file: "src/lib/ledger.ts",
    metric: "shares",
    metricLabel: "evidence rooms",
  },
  {
    step: 7,
    api: "verifyEvidence · withTrustedKeys · verifyAuditPack",
    module: "cool-nwc/verify",
    where: "browser",
    purpose: "Re-verify every receipt in the reader's browser against pinned keys and measurement",
    file: "src/lib/trust.ts",
    metric: "verified",
    metricLabel: "verified here",
  },
  {
    step: 8,
    api: "disclose · verifyDisclosure",
    module: "cool-nwc/phala",
    where: "gateway",
    purpose: "Open one committed field; refuse any value that does not match the sealed commitment",
    file: "src/lib/ledger.ts",
    metric: "disclosed",
    metricLabel: "fields disclosed",
  },
];
