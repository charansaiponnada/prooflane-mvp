# ProofLane — Product Requirements Document

**Version:** 1.0
**Status:** Hackathon concept → design-partner MVP
**Underlying technology:** [Northwind-Cipher/cool-sdk](https://github.com/Northwind-Cipher/cool-sdk)
**Beachhead:** AI-agent payment release in regulated financial services

---

## 1. Summary

ProofLane is an evidence gateway for **consequential AI-agent actions**. It sits between an AI agent and the tool it's about to call — releasing a payment, changing a beneficiary, modifying access, disposing a fraud case — and uses the CooL SDK to create a portable, cryptographically signed `cool.receipt.v2` receipt for that one action.

The receipt commits to the action's metadata, inputs, outputs, approval context, and software identity **without including the plaintext**. An external party (customer, auditor, investigator, regulator) can verify the receipt offline, with no access to the enterprise's backend. One field can be selectively disclosed on request. Any modification causes verification to fail.

**The precise claim, stated once and never overstated:**

> ProofLane proves the integrity of a captured execution statement. It reduces the evidence consumer's dependence on operator-controlled logs. It does not prove the AI's decision was correct, fair, safe, legal, or complete.

That last sentence is load-bearing for the whole product. Every requirement, every UI label, and every pitch line downstream must respect it.

---

## 2. Problem

### 2.1 Core problem
When a consequential AI agent takes an action, an outside party may need proof of what happened, which software ran it, and what approval governed it — **without trusting the enterprise's mutable logs, and without receiving sensitive underlying data.**

### 2.2 Concrete scenario
A bank's AI agent releases a **$48,200 payment**. The customer disputes it. The bank has traces, cloud logs, IAM records, approval tickets, model metadata — real evidence, but all of it controlled by the bank. The reviewer has no choice but to trust the bank's export process and its claim of completeness. Meanwhile, the raw data (account numbers, customer IDs, tool arguments) is too sensitive to just hand over.

### 2.3 Why now
| Driver | Evidence |
|---|---|
| Regulatory traceability | EU AI Act Art. 12 requires automatic event logging for high-risk AI systems, effective Aug 2026 |
| Governance execution gap | Only 22% of 500 senior legal/executive leaders were confident they could produce governance evidence for regulators; only 33% had defined escalation paths (AAA/ICDR/IResearch) |
| AI security control gap | 13% of 600 orgs had an AI model/app breach; 97% of those lacked proper AI access controls; 63% lacked or were still developing an AI governance policy (IBM/Ponemon 2025) |
| Existing telemetry is sensitive by default | OTel and Microsoft Foundry tracing docs capture full tool args/results and explicitly warn they need redaction and access control |

These numbers establish that the underlying traceability/governance/security problem is real and current. **They do not prove a standalone "AI receipts" budget exists yet** — that's a hypothesis the pilot must test.

---

## 3. Product definition

| | |
|---|---|
| **Name** | ProofLane — a controlled path from an AI action to independent proof |
| **One-line positioning** | The evidence layer for consequential AI actions, for when the person receiving the evidence doesn't fully trust the system that produced the logs |
| **Category** | Evidence/trust infrastructure — not observability, not GRC, not an AI-safety product |

### 3.1 What ProofLane promises
- Identifies the captured action and execution
- Binds metadata and payload **commitments** (not plaintext)
- Identifies the software version that performed the action
- Supports offline verification, no backend access needed
- Supports selective disclosure of individual fields
- Detects any modification to the receipt
- Optionally anchors to an append-only transparency log
- Optionally binds to a measured hardware workload (real dstack/TDX, production only)

### 3.2 What ProofLane explicitly does not promise
- That the AI's decision was correct, fair, safe, or legal
- That the organization's identity is independently certified
- That every relevant event was captured
- That the application didn't lie before submitting the event
- That simulated attestation is hardware security
- That a valid receipt implies regulatory compliance

---

## 4. Users and jobs to be done

| Role | Job to be done |
|---|---|
| Economic buyer (CISO / Risk / Compliance leader) | Reduce audit, incident, and dispute evidence cost |
| AI platform engineer | Instrument the agent/tool boundary without replacing OTel/IAM/SIEM |
| Security engineering | Strengthen provenance and evidence integrity for privileged actions |
| Model-risk / responsible-AI team | Tie model/policy/software identity to consequence-bearing outcomes |
| Internal audit / compliance | Get reviewable evidence not entirely owned by engineering |
| Incident responder | Reconstruct a disputed action, preserve chain of custody |
| External evidence consumer (auditor, customer, regulator, insurer) | Verify the receipt without touching the operator's backend |

---

## 5. Scope

### 5.1 MVP — one action class only
**AI-agent payment release in a regulated financial-services workflow.**

Included:
- Agent/tool gateway integration, synchronous receipt generation
- `cool.receipt.v2` creation via CooL SDK
- Capture of action metadata, execution ID, approval context, software identity, input/output/state
- Portable receipt export + independent offline verifier
- Signature/binding verdict display; optional transparency-log inclusion
- Selective disclosure of one field (approval ID first)
- Deterministic tamper demo ($48,200 → $4,820)
- Explicit simulated-attestation labeling
- Basic evidence-pack export

Explicitly out of scope for MVP:
- Every AI event or token; a hosted trace dashboard; general observability
- Full AI governance or compliance certification
- Correctness/fairness/safety evaluation
- Real payments or production customer data
- Automatic detection of omitted actions
- Multi-tenant SaaS, non-TypeScript SDKs, production hardware attestation, default global witnessing

### 5.2 Later expansion (post-pilot)
Beneficiary changes → privileged access changes → fraud disposition → incident/dispute evidence packs → model/prompt/policy change control → third-party AI vendor assurance → credit/insurance decisions → cross-company private computation.

---

## 6. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | Capture a selected agent/tool event at the action boundary (event type, execution ID, action/tool metadata, approval/policy reference, software name+version, input/output/state, timestamp, record ID) |
| FR-2 | Call CooL SDK to produce a `cool.receipt.v2`, exposing receipt bytes, record ID, execution ID, binding digest, attestation mode, optional inclusion evidence |
| FR-3 | Receipt contains commitments + salts, not plaintext, by default |
| FR-4 | External verifier validates offline: structural validity, binding, Ed25519, ML-DSA-65, transparency inclusion, witness evidence, attestation status, enclave status, anchor status |
| FR-5 | Operator can selectively disclose one committed field (approval ID first); verifier checks disclosed plaintext against the original commitment |
| FR-6 | Verifier rejects a modified receipt; demo visibly mutates $48,200 → $4,820 and shows an invalid verdict |
| FR-7 | Product distinguishes mock/absent, simulated, and hardware attestation — simulated is never shown as hardware pass |
| FR-8 | Preserves and integrates with existing OTel/IAM/SIEM/cloud logs/approval systems/model registries — never replaces them |
| FR-9 | Exports a portable evidence package: receipt, verification result, authorized disclosures, software identity, human-readable summary |
| FR-10 | Exposes capture health: attempted/successful receipts, failures, queue depth, dropped events, retries, high-water mark. High-consequence events use synchronous capture, not best-effort async |

---

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Verifier operates from receipt bytes + configured trust material only — no operator backend dependency |
| NFR-2 | Default receipt excludes raw account details, tool results, full prompts unless explicitly included by policy |
| NFR-3 | Canonical binding is deterministic regardless of JSON property order |
| NFR-4 | Verification failures are structured and explainable; malformed receipts never silently pass |
| NFR-5 | Trust mode is always visible in UI and evidence package; simulation is never shown as hardware |
| NFR-6 | No unacceptable latency added to the underlying action; full path must be benchmarked before any production performance claim |
| NFR-7 | Dropped events and failed batches are visible — never silently claim complete evidence under capture loss |
| NFR-8 | Receipt format stays consumable by non-TypeScript systems long-term, even though the initial SDK is Node/TS |

---

## 8. Architecture

```
                         REGULATED ENTERPRISE
┌────────────────────────────────────────────────────────┐
│  AI Agent                                               │
│    │ consequential tool call                            │
│    ▼                                                    │
│  ProofLane Gateway  (action + approval + software ctx)  │
│    ▼                                                    │
│  CooL Evidence Plane                                    │
│    Capture → Commit → Sign → Package                    │
│    salted commitments · canonical binding                │
│    Ed25519 + ML-DSA-65 · optional Merkle inclusion        │
│    optional dstack/TDX binding (production)               │
└──────────────────────┬───────────────────────────────────┘
                        │ portable cool.receipt.v2
                        ▼
              ┌──────────────────────┐
              │ External Verifier    │
              │ no operator backend  │
              │ access required      │
              └──────────────────────┘

AI Agent ──► OTel / SIEM / IAM / existing systems   (operational telemetry, unchanged)
```

**Data flow:** agent receives instruction → selects tool → ProofLane intercepts the consequential boundary → gathers fields → CooL creates salted commitments → deterministic CBOR canonicalization → binding digest → Ed25519 + ML-DSA-65 signatures → optional Merkle log append → receipt exported → external verifier validates offline → operator discloses one field on request → verifier checks disclosure against commitment.

**Trust boundary:** the enterprise app + ProofLane gateway are inside the operator's trust boundary; the verifier is outside it and must never need to trust the operator's database as the sole source of truth.

### 8.1 CooL SDK capability mapping

| Requirement | CooL capability | Status |
|---|---|---|
| Capture action + payloads | `CooL.record()` | Shipped |
| Hide plaintext | Per-field salted commitments | Shipped |
| Bind exact bytes | Deterministic CBOR canonicalization | Shipped |
| Authenticate receipt | Ed25519 + ML-DSA-65 hybrid signatures | Shipped |
| Prove log inclusion | RFC 6962 Merkle log | Shipped / config-dependent |
| Verify outside backend | Structured offline verifier | Shipped |
| Reveal one field | Selective disclosure + verification | Shipped |
| Bind measured workload | dstack quote + measurement-derived keys | Conditional (production only) |
| Maintain capture path | Bounded async queue | Shipped — loss possible under overload |

Runtime: TypeScript/Node.js ≥20, ESM. No native Python/Go/Rust/Java/.NET SDK yet. 86 tests: 85 passed, 0 failed, 1 skipped. No published `record()` throughput benchmark — must be measured before any production performance claim.

---

## 9. Security & privacy model

**Inherited security properties:** tamper detection, JSON-reorder-invariant canonical binding, rejection of swapped signature keys, rejection of truncated Merkle paths, structured failure on malformed evidence, no silent simulation→hardware upgrade, selective disclosure must match commitment.

**Privacy caveats — state these explicitly in every customer conversation:**
- The application sees plaintext *before* commitment — ProofLane can't protect against a compromised or lying application
- Commitments are **not encryption**; low-entropy values may be guessable
- Disclosed fields are no longer private from the recipient, and disclosure is permanent for that field
- Metadata (names, sizes, timing, repeated identifiers) can still leak information

**Threat model — what ProofLane does *not* solve:**
- A compromised application submitting false data
- An event omitted before it reaches the capture boundary
- Malicious-but-approved logic
- Unauthorized side effects that bypass the gateway entirely
- Weak signing-key identity binding or wrong trust-root policy
- Loss from a fail-open async queue
- Legal or semantic interpretation of the recorded event

**Attestation modes:** Mock/absent → Simulated (software-only, hackathon/MVP default) → Hardware (real quote + measurement chain). The UI must show this mode prominently, always.

---

## 10. Where this succeeds, where it fails, and how to respond

This section exists so the team never gets caught flat-footed by an obvious objection.

| Failure mode | Why it matters | Mitigation |
|---|---|---|
| **The AI lies before ProofLane sees it** | A valid receipt can faithfully record a false statement | Put the gateway at the actual tool/API boundary, not after the fact; capture confirmation from the downstream system where possible |
| **The agent bypasses ProofLane** | A parallel path directly to the payment API produces zero evidence, while the receipted path looks perfectly valid | Make ProofLane part of the *enforced* execution path for the selected action ("no receipt → no action"); expose attempted vs. successful vs. dropped counts |
| **"We already have Splunk/OTel/IAM"** | Biggest commercial risk — feature-based selling loses to the incumbent stack | Never sell cryptography; sell time-to-evidence. Measure the current process (systems touched, engineer-hours, sensitive fields copied) before and after |
| **The evidence consumer doesn't accept the receipt** | Technically perfect proof that no auditor recognizes as evidence is worthless commercially | Involve the actual evidence consumer (audit/compliance/legal) in the pilot design *before* building; ask directly: "would you use this in an investigation?" |
| **Privacy leakage despite commitments** | Metadata, low-entropy fields, or permanent disclosure can still leak | Threat-model each field before commitment; commitments are not encryption — say so in the product itself, not just internally |
| **Overclaiming AI trustworthiness** | The fastest way to lose a technical judge or a security review | Never say "proves the AI was right" or "tamper-proof AI." Always say: "proves the integrity of a captured execution statement" |

Where this succeeds best: **AI + consequential action + external scrutiny, all at once.** Ranked: financial services (payments, fraud, beneficiary/access changes) → fintech (often faster to close than a bank) → insurance claims → investment/trading actions → enterprise security (privileged access changes) → AI agent platforms (long-term, sell the receipt layer as infrastructure).

---

## 11. Metrics & pilot validation

| Metric | Baseline | Pilot target |
|---|---|---|
| Time to assemble an evidence pack | Measure current process | Materially reduced |
| Time to reconstruct a disputed action | Measure current process | Materially reduced |
| Systems manually correlated | Count | Reduced for the selected action |
| Sensitive fields copied into the evidence package | Count/classify | Reduced |
| Receipt generation latency | Measure full path | Within agreed action budget |
| Receipt loss rate | Attempted vs. completed | Zero for required synchronous actions |
| Verifier success on valid receipts | Test corpus | 100% |
| Tamper detection | Mutation corpus | 100% |
| Evidence-consumer acceptance | Interview + pilot review | Explicit "would use this" |

**Pilot success is not "the demo verified."** It's: real consequence-bearing action, receipt generated at the enforced boundary, external consumer verifies independently, sensitive-data exposure reduced, faster/more reliable than the current process, and the customer is willing to pay to continue.

---

## 12. Roadmap

| Phase | Goal | Key deliverables |
|---|---|---|
| **0 — Hackathon proof** | Demonstrate the concept in 3 minutes | Fake Northstar payment agent, one gateway, real CooL receipt, independent verifier, hidden-payload display, one-field disclosure, $48,200→$4,820 tamper attack, explicit simulated-attestation badge |
| **1 — Design-partner MVP** | Validate one real workflow, synthetic/approved data | Synchronous boundary integration, receipt+verifier API, evidence-pack export, OTel/SIEM/IAM correlation links, coverage/loss metrics, configurable disclosure policy, customer-controlled keys, baseline measurement |
| **2 — Production readiness** | Operate in a controlled regulated deployment | Language-neutral protocol/bindings, key rotation, hosted/self-hosted verifier, durable transparency + external witnesses, real dstack/TDX, air-gapped verification, retention/legal-hold controls, security review, benchmarks |
| **3 — Vertical expansion** | Repeatable evidence workflows | Payment / fraud / credit / vendor-assurance / model-change-control packs, regulated audit & dispute integrations |

---

## 13. Non-negotiable positioning rules

Never describe ProofLane as: "tamper-proof AI," a replacement for OpenTelemetry, a compliance certification product, a correctness guarantee, an AI-safety system, a blockchain product, or a generic trust dashboard.

Always describe it as:

> **A privacy-preserving evidence layer for moments when the evidence consumer does not fully trust the evidence producer.**

---

## References
CooL SDK README & source (`client.ts`, `engine.ts`, `verify.ts`, `disclose.ts`, `capture.ts`, `policy.ts`) · EU AI Act Article 12 · AAA/ICDR AI governance survey · IBM/Ponemon AI breach & governance research · OpenTelemetry GenAI semantic conventions · Microsoft Foundry agent tracing docs
