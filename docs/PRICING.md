# PRICING.md — ProofLane

## 1. Value Analysis

**Outcome:** When a fintech's AI agent releases a payment, the company can hand any auditor, regulator, or counterparty a link that proves — without anyone trusting ProofLane or the company's own logs — that the action was policy-checked, unaltered, and (if blocked) blocked for a named reason.

**Why it matters:** Regulated fintechs already spend real headcount-hours assembling "evidence packs" (logs, tickets, IAM records) every time a payment is disputed, an auditor asks, or a regulator examines AI governance. EU AI Act Article 12 makes this a legal requirement for high-risk AI, not a nice-to-have — and only 22% of senior leaders are confident they could produce it today. The cost of *not* having this is: failed audits, regulatory fines, drawn-out disputes, and — worst case — a breach where nobody can prove what the agent actually did (97% of AI-breach orgs lacked proper access controls).

**Estimated value to the buyer:**
- **Time saved:** evidence-pack prep for one disputed payment can run 4–20 analyst-hours today (pulling logs, IAM, tickets, tracing across systems). At a loaded compliance/audit rate of ~$100–150/hr, that's $400–$3,000 *per incident* — and mid-sized fintechs field dozens of these a year.
- **Risk avoided:** a single EU AI Act Article 12 finding, or a failed SOC2/audit cycle tied to AI governance, costs far more than a subscription — in remediation cost, delayed certifications, or fines.
- **Deal-enablement value:** being able to show enterprise counterparties and regulators verifiable AI-agent evidence is increasingly a sales-enablement asset, not just a cost center.

> ProofLane helps compliance/security teams at fintechs prove their AI payment agent behaved — cutting evidence-prep time and regulatory exposure — which is worth thousands of dollars per incident and, at the extreme, a blocked audit or fine. A price in the low-to-mid four figures per month is a rounding error against that.

## 2. Delivery Model Impact

ProofLane is fundamentally **DWY moving toward DIY**: the SDK integration is self-serve (`npm i prooflane-sdk`, wrap a function), but at this stage — pre-pilot, one action type, evolving policy needs — the actual value lands through a **guided pilot** (DWY): ProofLane's team helps wire the policy rules, defines what "authorized" means for that customer's payment flows, and sits in the room with the evidence consumer (audit/compliance) to make sure the receipts actually satisfy their real question.

- **Now (pilot stage):** DWY — priced as a fixed-fee engagement, not a subscription, because the product surface (one action, fixed rules) is still being validated against a real evidence consumer.
- **Post-pilot (platform stage):** shifts toward DIY/self-serve SDK + subscription, as policies become configurable and the Console handles more of the setup a human currently does.
- **Enterprise/scale stage:** re-introduces a DFY layer (customer-hosted evidence plane, dedicated support, custom action types) at the top tier.

This justifies **starting with a high-touch, premium-anchored pilot price**, then **unbundling into self-serve tiers** once the workflow is proven — never starting low and trying to raise later.

## 3. Pricing Range

| | Low | Mid | High |
|---|---|---|---|
| **Pilot (one-time, 8–12 wks)** | $8,000 | $15,000 | $30,000 |
| **Post-pilot platform (monthly)** | $500/mo | $2,000/mo | $8,000+/mo |

Reasoning: security/compliance tooling at fintechs routinely lands in the $1.5k–$10k/mo range once past pilot (comparable to vendor risk, GRC, and audit-evidence tooling categories); a pilot fee in the $8k–$30k range is standard for a paid design-partner engagement with a named technical champion and a dedicated integration window, and is small next to the cost of one failed audit cycle.

## 4. Recommended Pricing Strategy

**Hybrid: high-ticket pilot → tiered subscription ladder.**

- Don't sell a subscription on day one — sell a **fixed-fee pilot** that de-risks adoption for the buyer (bounded cost, bounded time, one action) while letting ProofLane charge for the "DWY" hand-holding it's actually doing.
- Convert every successful pilot into a **recurring platform subscription**, tiered by receipt volume, number of action types, and hosting model (ProofLane-hosted vs. customer-hosted evidence plane).
- This matches the buyer's real budget path: security/compliance tools get funded first as a **project** (pilot budget), then as an **operating line item** (subscription) once a champion has proof it works.

## 5. Pricing Tiers

### Pilot — "Design Partner Pilot" (one-time)
- **What's included:** integrate `prooflane-sdk` into one payment action, configure policy rules (PAY-001–004 style) with the technical champion, stand up a workspace + evidence room, run a live proof session with the named evidence consumer (audit/compliance), and deliver a pilot report measuring evidence-prep time saved and sensitive-data exposure reduced.
- **Who it's for:** mid-sized fintechs validating whether verifiable AI-agent evidence is worth adopting company-wide.
- **Price:** **$15,000 flat, 8–12 weeks** (add-on: $5,000 if a second action type is added mid-pilot).
- **Guarantee:** if the evidence consumer doesn't accept the pilot's evidence pack as sufficient by week 12, the customer gets 50% back — this is a Hormozi-style risk-reversal that also filters for real intent (the "evidence consumer must be in the room from day one" requirement already screens for this).

### Tier 1 — Starter (DIY, self-serve, post-pilot)
- **What's included:** `prooflane-sdk`, one workspace, up to 1,000 receipts/mo, one action type, hosted evidence rooms, community/email support.
- **Who it's for:** a team that completed the pilot (or a smaller team piloting themselves) and wants to run this in production without white-glove support.
- **Price:** **$499/mo** (or $4,990/yr, ~2 months free).

### Tier 2 — Growth (DWY, core offer)
- **What's included:** everything in Starter, up to 3 action types (payments, bank-detail changes, access changes), up to 25,000 receipts/mo, configurable policies via Console, priority support, quarterly evidence-readiness review with ProofLane.
- **Who it's for:** the primary target — a fintech running this across more than one AI-agent workflow, with audit/compliance actively using evidence rooms.
- **Price:** **$2,000/mo** (annual: $20,000/yr, ~2 months free).

### Tier 3 — Enterprise (DFY, premium)
- **What's included:** everything in Growth, unlimited action types, unlimited receipts, customer-hosted evidence plane option, SSO, dedicated success engineer, custom policy design, external witness/anchoring add-on when available, SLA.
- **Who it's for:** larger fintechs / regulated enterprises where compliance mandates data residency or custom SLAs.
- **Price:** **starts at $8,000/mo**, custom-quoted based on volume and hosting model.

## 6. Psychological Pricing

- **Anchor high first:** always present Enterprise ("starts at $8,000/mo") before Growth — makes $2,000/mo look like the sensible middle choice (decoy/anchor effect).
- **Charm pricing on Starter only** ($499, not $500) — it's the volume-sensitive, self-serve tier where a few dollars affects conversion.
- **Round, clean pricing on Growth/Enterprise/Pilot** ($2,000, $8,000, $15,000) — round numbers read as premium and confident, not discount-hunted; this matters more to a CISO/CRO buyer than saving $3.
- **Annual discount framed as "months free"** rather than "% off" — reads as a bonus, not a markdown.
- **Pilot fee framed as investment vs. cost of one incident** — "$15,000 once vs. $400–$3,000 per disputed payment, dozens of times a year."

## 7. Price Justification Story

1. **Restate the outcome:** Your AI agent is going to release payments on its own. When one gets disputed — and one will — you need to hand someone a proof they don't have to take your word for.
2. **Show what it's worth:** Today that proof costs 4–20 analyst-hours per incident to assemble, and it's still just "trust our logs." Multiply that across a year of disputes, audits, and one looming EU AI Act Article 12 deadline, and you're looking at tens of thousands of dollars in evidence-prep cost and real regulatory exposure.
3. **Compare to alternatives:** The alternative isn't "do nothing" — it's manually correlating traces, IAM records, and tickets every single time, and still not being able to prove nothing was edited.
4. **Anchor the value stack:** A pilot that removes that entire manual process, produces receipts an auditor can check without touching your servers, and gives you a defensible answer for a regulator — that's worth far more than $15,000 once.
5. **Reveal the price as small:** $15,000 for 8–12 weeks, or $2,000/mo once it's running — against thousands of dollars and real regulatory risk per incident — is a small, bounded step.

## 8. Risk Check

- **Doesn't feel cheap:** pilot and Growth pricing are set well above "cheap SaaS" territory on purpose — this is a compliance/security-budget sale, and underpricing would read as "not serious" to a CISO.
- **Doesn't feel expensive without clarity:** every tier is tied to a concrete unit (receipts/mo, action types, hosting model) so the buyer can see exactly what scales the price.
- **Matches audience's ability to pay:** mid-sized fintechs already spend far more than this on GRC/vendor-risk tooling; the pilot fee is comparable to a single security-engineering sprint.
- **Watch item:** don't let the pilot become "free consulting" — the $15,000 pilot fee must be collected upfront (or 50/50 split at kickoff/delivery), never contingent-only, or it stops being a real pilot and starts being a sales-cycle cost.

## 9. Pricing Experiments

- **A/B the pilot fee** ($10k vs $15k vs $20k) across the first 3–5 design partners to find where conversion drops off — don't guess past that sample.
- **Test a "second action type" upsell** during the pilot itself (bank-detail changes, access grants) vs. saving it purely for the post-pilot Growth tier — see which drives faster expansion revenue.
- **Test annual vs. monthly billing** at the Growth tier once there are 3+ paying customers — annual improves cash flow and reduces churn risk for a still-young product.
- **Early-adopter pilot discount** (e.g. first 3 design partners at $10,000 instead of $15,000) in exchange for a public case study/logo — trades margin for the social proof that justifies full pricing on partner #4 onward.
