/**
 * ProofLane SDK — put an evidence gateway in front of any consequential agent tool.
 *
 *   const proof = new ProofLane({ apiKey, agent: "payments-agent" });
 *   const releasePayment = proof.guard("payment.release", rawReleasePayment, (args) => ({
 *     id: args.approvalId,
 *     approvers: args.approvers,
 *   }));
 *   await releasePayment({ amount: 48200, beneficiary: "…", approvalId: "APR-1", approvers: ["a", "b"] });
 *
 * Every call is authorized against policy and sealed into a CooL receipt BEFORE
 * the tool runs, then its result is sealed under the same execution id. If
 * ProofLane cannot seal the authorization, the tool never runs.
 *
 * Framework-free: works with OpenAI / Anthropic tool calls, LangChain tools, MCP
 * handlers — anything that is an async function.
 */
import type { ReceiptV2 } from "cool-nwc";

/** Plaintext the caller keeps. ProofLane receipts only carry its commitments. */
export type Vault = { input?: string; output?: string; state?: string };

export type ProofLaneOptions = {
  apiKey: string;
  /** Name of the agent recorded in every receipt. */
  agent: string;
  baseUrl?: string;
  software?: { name: string; version: string };
  /** Called with each sealed receipt and the plaintext it commits to — store the vault to answer disclosure requests later. */
  onReceipt?: (receipt: ReceiptV2, vault: Vault) => void;
};

export type PolicyDecision = { decision: string; rule: string | null; policy_hash: string };

export class ProofLaneBlockedError extends Error {
  constructor(
    readonly decision: PolicyDecision,
    readonly receipt: ReceiptV2
  ) {
    super(`ProofLane blocked the action: ${decision.decision} (${decision.rule ?? "no rule matched"})`);
    this.name = "ProofLaneBlockedError";
  }
}

export class ProofLane {
  constructor(private readonly options: ProofLaneOptions) {}

  async request<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.options.baseUrl ?? ""}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`ProofLane ${res.status}: ${data.error}`);
    return data as T;
  }

  /** Wrap a tool. No receipt, no action. */
  guard<A extends { amount: number }, R>(
    action: "payment.release",
    tool: (args: A) => Promise<R>,
    approval: (args: A) => { id: string; approvers: string[] }
  ): (args: A) => Promise<R> {
    return async (args) => {
      const input = JSON.stringify(args);
      const appr = approval(args);
      const auth = await this.request<{
        executionId: string;
        allowed: boolean;
        decision: PolicyDecision;
        receipt: ReceiptV2;
      }>("/api/v1/actions/authorize", {
        action,
        agent: this.options.agent,
        software: this.options.software,
        input,
        approval: appr,
      });
      this.options.onReceipt?.(auth.receipt, { input, state: appr.id });
      if (!auth.allowed) throw new ProofLaneBlockedError(auth.decision, auth.receipt);

      const finish = async (output: string, status: "succeeded" | "failed") => {
        const done = await this.request<{ receipt: ReceiptV2 }>(
          `/api/v1/actions/${auth.executionId}/complete`,
          { output, status }
        );
        this.options.onReceipt?.(done.receipt, { output });
      };

      let result: R;
      try {
        result = await tool(args);
      } catch (error) {
        await finish(JSON.stringify({ error: String(error) }), "failed");
        throw error;
      }
      await finish(JSON.stringify(result ?? null), "succeeded");
      return result;
    };
  }

  /** Open one committed field for an auditor. The server checks it against the sealed commitment. */
  approveDisclosure(requestId: string, value: string) {
    return this.request(`/api/v1/disclosure-requests/${requestId}`, { decision: "approve", value });
  }

  denyDisclosure(requestId: string) {
    return this.request(`/api/v1/disclosure-requests/${requestId}`, { decision: "deny" });
  }

  /** Create an evidence-room link for an auditor. */
  share(label: string, recordIds?: string[]) {
    return this.request<{ share: { token: string } }>("/api/v1/shares", { label, record_ids: recordIds });
  }
}
