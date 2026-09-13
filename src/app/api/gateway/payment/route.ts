import { cool, trustAnchor } from "@/lib/gateway";
import { APPROVAL_ID, PAYMENT, SOFTWARE, type CaptureStats } from "@/lib/receipt";

// ponytail: per-instance counters, reset on cold start; persist when pilots need history.
const stats: CaptureStats = { attempted: 0, succeeded: 0, failed: 0 };

/**
 * ProofLane gateway for the `payment.release` tool. Synchronous capture: the
 * release is only reported back to the agent once its receipt exists.
 */
export async function POST() {
  stats.attempted++;
  const input = JSON.stringify(PAYMENT);
  const output = JSON.stringify({
    status: "released",
    txn_id: `TXN-${Date.now()}`,
    rail: "wire",
  });
  try {
    const { evidence } = await cool.record({
      type: "agent.action",
      metadata: {
        action: "payment.release",
        tool: "northstar.payments.release",
        policy_ref: "POL-PAY-RELEASE-v3",
        agent: SOFTWARE.name,
      },
      payloads: { input, output, state: APPROVAL_ID },
      software: SOFTWARE,
    });
    stats.succeeded++;
    return Response.json({
      receipt: evidence,
      vault: { input, output, state: APPROVAL_ID },
      trust: await trustAnchor(),
      stats,
    });
  } catch (error) {
    stats.failed++;
    return Response.json(
      { error: error instanceof Error ? error.message : String(error), stats },
      { status: 500 }
    );
  }
}
