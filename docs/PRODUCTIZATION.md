# PRODUCTIZATION.md — turning ProofLane from a pilot into a product

## 1. Current Service

- **What's offered today:** a hand-held pilot — integrate `prooflane-sdk` into one customer's payment-release agent, hand-configure CooL policy rules with their engineers, stand up a workspace, and run a live proof session with their audit/compliance team.
- **How it's delivered:** high-touch, one customer at a time, 8–12 weeks, ProofLane's founders in the room configuring rules and interpreting what "evidence" needs to mean for that specific buyer.
- **Where the time goes:** (1) translating a customer's actual payment-approval process into CooL policy rules, (2) wiring the SDK into their specific tool/agent stack, (3) coaching the evidence consumer (audit/compliance) on how to use an evidence room and trust it.

This is fine for proving the model with design partners — it is **not** a business yet, because revenue is capped by founder hours.

## 2. Repeatable Components

Across any pilot, the same steps repeat:
- **Policy templating** — every fintech's payment rules boil down to threshold + approver-count logic (PAY-001–004 is already a template, not a one-off).
- **The 4-step onboarding flow** — Connect → Enforce → Record → Prove — already exists as the Console's own UX; it just isn't yet self-serve enough to skip a human.
- **The evidence-room walkthrough** — the same 5–6 step script (share link → auditor verifies → request field → approve → re-verify) is run manually for every pilot's evidence consumer.
- **The "why CooL" pitch** — the same integrity/privacy/completeness explanation is repeated to every technical champion and CISO.

These are exactly the parts to standardize first — they're already frameworks, just undocumented as reusable assets.

## 3. Productized System — "The ProofLane Rollout System"

A named, repeatable system instead of ad hoc pilots:

1. **Map** — a policy-mapping worksheet/call turns the customer's real approval process into CooL policy rules (templated off PAY-001–004), in days not weeks.
2. **Wrap** — customer wraps their own payment tool with `proof.guard()` using a self-serve integration guide + example repo (no founder engineering time required for a standard agent stack: OpenAI/Anthropic/LangChain/MCP tool).
3. **Prove** — a scripted, repeatable evidence-room demo session with the named evidence consumer, using a fixed script instead of improvised discovery.
4. **Report** — an automatic "pilot scorecard" (evidence-prep time saved, receipts issued, refusals caught, sensitive fields never exposed) generated from Console stats, not manually assembled.

**Outcome:** the same pilot quality, delivered in less founder time per customer, so pilot #5 costs a fraction of pilot #1 in labor.

## 4. Product Format

**Toolkit + Program hybrid**, shifting weight from Program → Toolkit over time:
- **Now:** Program (DWY) — the Rollout System above, run with founder involvement.
- **Near-term:** Toolkit (DIY) — self-serve integration guide, templated policy library, in-Console guided setup replacing the manual "Map" call for standard cases.
- **Enterprise-only:** stays Program/DFY (custom action types, custom hosting) because that's where the premium tier's margin lives.

## 5. Delivery Model

| Stage | Model | What changes |
|---|---|---|
| Pilot (now) | DWY | Founder maps policy + coaches evidence consumer |
| Starter/Growth (product) | DIY | Console self-serve setup, templated policies, docs replace the human |
| Enterprise | DFY | Dedicated success engineer, custom hosting, custom action types |

The productization *is* this shift: every pilot should be mined for what could become a template, doc, or Console feature so the next customer needs less of the founder's time.

## 6. Final Product Offer

**ProofLane** — a self-serve evidence platform for AI agent actions, entered via a fixed-scope paid pilot and graduating into a subscription platform, so a fintech can prove any AI agent payment action is policy-checked and unaltered without a large integration project.

---

# OFFER_LADDER.md

## 1. Customer Journey

- **Beginner (evaluating):** "Our AI agent is about to touch money and I have no way to prove it behaved." Needs a low-risk way to test the idea against one real action, without committing to a platform.
- **Intermediate (adopted):** Pilot succeeded — evidence consumer accepted the proof. Needs this running continuously in production, ideally across more than one action type.
- **Advanced (scaling):** Multiple AI agents doing regulated actions (payments, bank-detail changes, access grants) across the org; compliance now depends on this being always-on, possibly on infrastructure they control.

## 2. Entry Offer — "Design Partner Pilot"

- **Price:** $15,000 flat (already defined in `docs/PRICING.md`), 8–12 weeks.
- **Outcome:** one AI-agent payment action, fully policy-gated and receipted, with the named evidence consumer having accepted a real evidence pack.
- **Format:** Program (DWY) — the 4-step Rollout System above.
- **Why it's the entry point:** bounded cost, bounded time, built-in guarantee (50% back if the evidence consumer doesn't accept by week 12) — this is the low-risk, fast-result offer that gets a skeptical CISO to say yes.

## 3. Core Offer — "Growth" subscription

- **Price:** $2,000/mo ($20,000/yr).
- **Outcome:** every AI-agent payment (and up to 2 more action types) is continuously policy-checked and receipted in production, with quarterly evidence-readiness reviews.
- **Format:** Toolkit + light Program (DWY/DIY hybrid) — self-serve SDK/Console, ProofLane still shows up quarterly.
- **Why it's core:** this is where volume and revenue concentrate — the natural next step for every pilot that converts, and the tier most mid-sized fintechs actually need (multiple agent workflows, not just one).

## 4. Premium Offer — "Enterprise"

- **Price:** starts at $8,000/mo, custom-quoted.
- **Outcome:** unlimited action types and receipts, customer-hosted evidence plane (private data never leaves their infrastructure), SSO, dedicated success engineer, custom policy design, SLA.
- **Format:** DFY — ProofLane operates as an extension of the customer's platform/security team.
- **Why it's premium:** for the largest, most regulated buyers, "compliance mandates data residency" is a real, non-negotiable requirement — this tier exists specifically to capture that segment at the price it deserves.

## 5. Ladder Flow

Pilot ($15k, one-time) → **converts to** Starter ($499/mo, self-serve, low-commitment landing spot for teams not ready for Growth) or straight to Growth ($2,000/mo, the default expected outcome of a successful pilot) → **expands to** Enterprise ($8,000+/mo) once the customer adds action types, headcount, or a data-residency requirement.

Starter exists mainly as a **downsell inside the ladder**, not a primary acquisition channel — it catches pilot graduates who stall on budget approval for Growth, so they don't churn to zero.

---

# REVENUE_FLOW.md

## 1. Entry Point

First purchase = the **$15,000 Design Partner Pilot**. This is deliberately not free — a paid pilot filters for real buyers and funds the founder time it currently takes to deliver it.

## 2. Upsell Options

### Upsell 1 — Pilot → Growth subscription
- **Offer:** convert the just-proven single action into always-on coverage plus up to 2 more action types (bank-detail changes, access grants) at $2,000/mo.
- **Why it fits:** the customer already has a working integration and a convinced evidence consumer — this is "keep what already works running," the easiest upsell there is.
- **Price:** $2,000/mo.

### Upsell 2 — Growth → Enterprise
- **Offer:** move to a customer-hosted evidence plane with unlimited action types, SSO, and a dedicated success engineer.
- **Why it fits:** triggered naturally when the customer's compliance/security team raises data-residency requirements or wants to add a fourth+ action type — not pushed, pulled by their own growth.
- **Price:** $8,000+/mo, custom-quoted.

## 3. Downsell Options

### Downsell 1 — Growth → Starter
- **Offer:** if a pilot graduate can't get $2,000/mo approved immediately, drop to $499/mo self-serve (one action type, capped receipts) rather than losing them entirely.
- **Why it fits:** keeps the relationship and the data flowing while their budget cycle catches up — a lighter version, not a lost customer.
- **Price:** $499/mo.

## 4. Flow Logic

- **Upsell 1 appears:** automatically, in the pilot's week-10/11 "pilot scorecard" review — present it as the natural next step alongside the results, not a separate sales pitch.
- **Upsell 2 appears:** when Console usage data shows a Growth customer approaching action-type or receipt-volume limits, or when their compliance team asks about hosting/data residency (a good trigger to watch for, not force).
- **Downsell 1 appears:** only if the customer explicitly hesitates on Growth pricing at pilot's end — never offered upfront, since it undercuts pilot pricing psychology if seen too early.

## 5. Value Increase Strategy

Revenue per customer increases along the ladder from a $15,000 one-time pilot → $24,000/yr (Growth) → $96,000+/yr (Enterprise) as the same core value (verifiable evidence) is extended across more agent workflows, more receipt volume, and stricter hosting/compliance requirements — each step funded by the customer's own growth (more agents, more regulation exposure), not by ProofLane pushing harder.

---

# How to actually get customers (go-to-market, from zero)

1. **Design partners come from warm channels first**, not cold outbound: fintech-focused security/compliance communities, AI-agent infra Slack/Discord groups, YC/fintech founder networks, and the existing pitch deck/demo video as a credibility asset. Target the **technical champion** (platform/security eng) as first contact — they're the one who can say yes to a pilot without full CISO sign-off, then bring the CISO in once there's a working integration to show.
2. **Lead with the guided demo, not the deck.** `/demo` and `/console` are already built — "let me show you a $48,200 payment get blocked, then verified, then tampered and caught" converts skeptics faster than any slide. Use it in every first call.
3. **Price the pilot to filter, not to maximize early revenue.** $15,000 upfront (or 50/50 split) ensures only serious buyers with real budget and a real evidence consumer show up — avoids burning founder time on tire-kickers.
4. **Get one public case study before pilot #4.** A single named (or anonymized-but-verifiable) fintech logo saying "the auditor accepted it" is the single highest-leverage asset for closing the next five pilots faster and can justify raising the pilot fee back to full price after an early-adopter discount.
5. **Instrument the funnel from day one:** pilots started → pilots converted to Growth → Growth expanded to Enterprise. MRR growth from here is a conversion-rate problem (pilot → subscription) more than a top-of-funnel problem — fix conversion before spending on more top-of-funnel outreach.
