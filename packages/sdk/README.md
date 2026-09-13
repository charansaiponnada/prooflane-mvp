# prooflane-sdk

**The evidence gateway for AI agents that move money — built on the [CooL SDK](https://github.com/Northwind-Cipher/cool-sdk).**

Wrap any consequential agent tool. Every call is checked against policy and sealed into an independently verifiable CooL receipt **before** the tool runs; the result is sealed under the same execution id. Blocked calls throw with a signed refusal. No receipt, no action.

```bash
npm i prooflane-sdk
```

```ts
import { ProofLane, ProofLaneBlockedError } from "prooflane-sdk";

const proof = new ProofLane({
  apiKey: process.env.PROOFLANE_API_KEY!, // create a workspace at https://prooflane-mvp.vercel.app/console
  agent: "payments-agent",
  onReceipt: (receipt, vault) => db.save(receipt.record.record_id, vault), // keep plaintext for disclosures
});

const releasePayment = proof.guard("payment.release", bank.releasePayment, (args) => ({
  id: args.approval_id,
  approvers: args.approvers,
}));

try {
  await releasePayment({ amount: 48200, currency: "USD", beneficiary: "Acme Ltd", approval_id: "APR-1", approvers: ["alice@acme.example"] });
} catch (e) {
  if (e instanceof ProofLaneBlockedError) console.log(e.decision.rule, e.receipt); // e.g. PAY-003, signed refusal
}
```

Give `releasePayment` to your OpenAI / Anthropic / LangChain / MCP agent as its tool — it's just an async function.

- `baseUrl` defaults to `https://prooflane-mvp.vercel.app`; pass your own deployment's URL to change it.
- `proof.share(label)` creates an auditor evidence-room link; `approveDisclosure` / `denyDisclosure` answer field requests.

Docs, architecture, and the live demo: https://github.com/charansaiponnada/prooflane-mvp

MIT licensed.
