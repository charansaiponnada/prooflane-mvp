import { evaluate, type PolicyOutcome, type PolicySet } from "cool-nwc/phala";

export const HIGH_VALUE_THRESHOLD = 25_000;

/**
 * Payment-release policy, evaluated by the CooL policy engine (strictest rule
 * wins, silence escalates). The outcome and the policy hash are sealed into the
 * authorization receipt, so a reviewer can see which rules the action met.
 */
export const PAYMENT_POLICY: PolicySet = {
  id: "prooflane.payment-release.v1",
  fallback: "escalate",
  rules: [
    {
      id: "PAY-001",
      title: "Standard payment with a human approver",
      when: { ref: "payment.release", labels: ["tier:standard"], minApprovers: 1 },
      decision: "approved",
      because: "Payments under $25,000 need one named approver.",
    },
    {
      id: "PAY-002",
      title: "High-value payment under dual control",
      when: { ref: "payment.release", labels: ["tier:high"], minApprovers: 2 },
      decision: "approved",
      because: "Payments of $25,000 or more need two distinct approvers.",
    },
    {
      id: "PAY-003",
      title: "High-value payment without dual control",
      when: { ref: "payment.release", labels: ["tier:high"], minApprovers: 1, maxApprovers: 1 },
      decision: "escalate",
      because: "A single approver cannot release a high-value payment.",
    },
    {
      id: "PAY-004",
      title: "No human approval",
      when: { ref: "payment.release", maxApprovers: 0 },
      decision: "rejected",
      because: "An agent may never release a payment on its own authority.",
    },
  ],
};

export function tierOf(amount: number) {
  return amount >= HIGH_VALUE_THRESHOLD ? "high" : "standard";
}

export function decidePayment(
  agent: string,
  amount: number,
  approvers: string[]
): PolicyOutcome {
  return evaluate(PAYMENT_POLICY, {
    kind: "tool",
    ref: "payment.release",
    environment: "production",
    actor: { id: `agent:${agent}`, method: "service-account" },
    approvers: [...new Set(approvers)],
    labels: [`tier:${tierOf(amount)}`],
  });
}

export const isAllowed = (outcome: PolicyOutcome) =>
  outcome.decision === "approved" || outcome.decision === "auto-approved";
