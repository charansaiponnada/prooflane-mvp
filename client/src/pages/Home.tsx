import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  Eye,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Menu,
  Network,
  Play,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Terminal,
  UserRoundCheck,
  X,
  Zap,
} from "lucide-react";

const initialEvent = {
  amount: "48200",
  customerRef: "CUST-0192",
  approvalId: "APR-8842",
  tool: "releasePayment",
  software: "northstar-agent@2026.09.12",
};

type Verdict = "idle" | "valid" | "tampered";

const canonicalPayload = (event: typeof initialEvent) =>
  JSON.stringify({
    action: { amount: Number(event.amount), tool: event.tool },
    approval: event.approvalId,
    customer: event.customerRef,
    software: event.software,
  });

function StatusPill({ tone, children }: { tone: "cyan" | "mint" | "amber" | "red" | "slate"; children: React.ReactNode }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function AppMark() {
  return (
    <div className="app-mark" aria-label="ProofLane">
      <div className="mark-icon"><ShieldCheck size={18} strokeWidth={2.5} /></div>
      <div>
        <div className="brand-name">ProofLane</div>
        <div className="brand-subtitle">evidence control room</div>
      </div>
    </div>
  );
}

function App() {
  const [event, setEvent] = useState(initialEvent);
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [disclosed, setDisclosed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [binding, setBinding] = useState("sha256:pending…");

  const receipt = useMemo(() => {
    const canonical = canonicalPayload(event);
    return {
      id: `rcpt_${event.approvalId.toLowerCase().replaceAll("-", "_")}_01`,
      digest: binding,
      canonical,
      timestamp: "2026-09-13 11:56:31 UTC",
    };
  }, [binding, event]);

  const capture = async () => {
    const bytes = new TextEncoder().encode(receipt.canonical);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
    setBinding(`sha256:${hash.slice(0, 8)}…${hash.slice(-4)}`);
    setVerdict("valid");
    setDisclosed(false);
  };

  const tamper = async () => {
    if (verdict === "idle") await capture();
    setVerdict("tampered");
    setDisclosed(false);
  };

  const reset = () => {
    setEvent(initialEvent);
    setVerdict("idle");
    setDisclosed(false);
    setBinding("sha256:pending…");
  };

  const copyReceipt = async () => {
    await navigator.clipboard?.writeText(JSON.stringify({ ...receipt, type: "cool.receipt.v2" }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const amountDisplay = Number(event.amount || 0).toLocaleString("en-US");

  return (
    <div className="app-shell">
      <header className="topbar">
        <AppMark />
        <div className="topbar-context">
          <span className="context-dot" />
          <span>Northstar Bank</span>
          <ChevronDown size={15} />
        </div>
        <div className="topbar-actions">
          <span className="env-pill"><span className="live-dot" /> demo environment</span>
          <button className="icon-button" aria-label="Menu" onClick={() => setMenuOpen((value) => !value)}><Menu size={18} /></button>
          {menuOpen && <div className="menu-popover"><strong>Demo controls</strong><span>Environment: simulated</span><span>Evidence plane: local</span><span>Backend access: none</span></div>}
        </div>
      </header>

      <main className="main-content">
        <section className="hero-row">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> LIVE EVIDENCE DEMO</div>
            <h1>When trust breaks,<br /><span>the receipt stands.</span></h1>
            <p className="hero-copy">Create a portable proof of a consequential AI action — without handing over the operator&apos;s logs or the customer&apos;s secrets.</p>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">ACTION UNDER REVIEW</span>
            <div className="hero-stat-value">${amountDisplay}</div>
            <div className="hero-stat-meta"><span className="risk-dot" /> payment release <span className="muted-separator">·</span> disputed</div>
          </div>
        </section>

        <div className="trust-strip">
          <div className="trust-strip-main"><Network size={17} /><strong>Evidence consumer outside the boundary</strong><ArrowRight size={15} /><span>verifies receipt bytes, not the bank&apos;s backend</span></div>
          <StatusPill tone="amber"><ShieldEllipsis size={13} /> attestation: simulated</StatusPill>
        </div>

        <section className="workspace-grid">
          <div className="left-column">
            <div className="panel action-panel">
              <div className="panel-heading">
                <div><SectionLabel>01 / ACTION BOUNDARY</SectionLabel><h2>Northstar payment agent</h2></div>
                <StatusPill tone="amber"><CircleAlert size={13} /> disputed</StatusPill>
              </div>
              <div className="agent-summary">
                <div className="agent-avatar"><Zap size={21} /></div>
                <div><strong>northstar-agent</strong><span>autonomous payment workflow</span></div>
                <div className="agent-version">v2026.09.12</div>
              </div>
              <div className="field-grid">
                <label>Action tool<input value={event.tool} onChange={(e) => setEvent({ ...event, tool: e.target.value })} /></label>
                <label>Payment amount<div className="money-input"><span>$</span><input value={event.amount} onChange={(e) => setEvent({ ...event, amount: e.target.value.replace(/\D/g, "") })} /></div></label>
                <label>Customer reference<input value={event.customerRef} onChange={(e) => setEvent({ ...event, customerRef: e.target.value })} /></label>
                <label>Approval reference<input value={event.approvalId} onChange={(e) => setEvent({ ...event, approvalId: e.target.value })} /></label>
              </div>
              <div className="action-note"><LockKeyhole size={14} /><span>Inputs and tool result will be committed, not copied into the receipt.</span></div>
              <button className="primary-button" onClick={capture}><ScanLine size={16} /> Capture execution <ArrowRight size={16} /></button>
            </div>

            <div className="panel trace-panel">
              <div className="panel-heading compact"><div><SectionLabel>OPERATIONAL TRACE</SectionLabel><h3>What the bank already sees</h3></div><StatusPill tone="slate">operator-controlled</StatusPill></div>
              <div className="trace-list">
                <div className="trace-row"><span className="trace-icon"><Terminal size={14} /></span><span>agent.run</span><code>northstar-001</code><span className="trace-time">11:56:30.781</span></div>
                <div className="trace-row"><span className="trace-icon"><Zap size={14} /></span><span>tool.call</span><code>{event.tool}</code><span className="trace-time">11:56:31.002</span></div>
                <div className="trace-row"><span className="trace-icon"><UserRoundCheck size={14} /></span><span>approval</span><code>{event.approvalId}</code><span className="trace-time">11:56:31.019</span></div>
              </div>
              <div className="trace-footnote"><Eye size={14} /> Useful for operations. Not independently verifiable evidence.</div>
            </div>
          </div>

          <div className="right-column">
            <div className={`panel receipt-panel ${verdict === "tampered" ? "panel-danger" : verdict === "valid" ? "panel-valid" : ""}`}>
              <div className="panel-heading">
                <div><SectionLabel>02 / COOL RECEIPT</SectionLabel><h2>Portable evidence object</h2></div>
                {verdict === "valid" && <StatusPill tone="mint"><Check size={13} /> receipt valid</StatusPill>}
                {verdict === "tampered" && <StatusPill tone="red"><X size={13} /> invalid</StatusPill>}
                {verdict === "idle" && <StatusPill tone="slate">awaiting capture</StatusPill>}
              </div>
              <div className="receipt-id-row"><span className="receipt-type">cool.receipt.v2</span><code>{receipt.id}</code><button className="mini-icon" onClick={copyReceipt} aria-label="Copy receipt"><Copy size={14} /></button>{copied && <span className="copied-label">copied</span>}</div>
              <div className="receipt-map">
                <div className="receipt-row"><span>action</span><strong>{event.tool}</strong><span className="commit-tag"><LockKeyhole size={12} /> committed</span></div>
                <div className="receipt-row"><span>software</span><strong>{event.software}</strong><span className="commit-tag"><Fingerprint size={12} /> identified</span></div>
                <div className="receipt-row"><span>payment</span><strong className={verdict === "tampered" ? "tampered-value" : ""}>${amountDisplay}</strong><span className="commit-tag"><LockKeyhole size={12} /> hidden</span></div>
                <div className="receipt-row"><span>tool result</span><strong className="redacted">••••••••••••••</strong><span className="commit-tag"><LockKeyhole size={12} /> hidden</span></div>
              </div>
              <div className="digest-box"><div><span className="digest-label">CANONICAL BINDING</span><code>{receipt.digest}</code></div><FileCheck2 size={17} className="cyan-icon" /></div>
              <div className="receipt-actions"><button className="secondary-button" onClick={() => setDisclosed((value) => !value)} disabled={verdict !== "valid"}><Eye size={15} /> {disclosed ? "Hide disclosure" : "Selective disclosure"}</button><button className="danger-button" onClick={tamper}><X size={15} /> Tamper receipt</button></div>
              {disclosed && <div className="disclosure-callout"><div className="disclosure-check"><Check size={15} /></div><div><span className="section-label">FIELD DISCLOSURE VERIFIED</span><strong>approvalId = {event.approvalId}</strong><p>One field opened. Customer reference and tool result remain private.</p></div></div>}
            </div>

            <div className="panel verifier-panel">
              <div className="panel-heading compact"><div><SectionLabel>03 / INDEPENDENT VERIFIER</SectionLabel><h3>Evidence consumer view</h3></div><span className="outside-badge">outside bank boundary</span></div>
              <div className="verifier-grid">
                {[
                  { label: "Binding", status: verdict === "tampered" ? "fail" : verdict === "valid" ? "pass" : "pending", Icon: FileCheck2 },
                  { label: "Ed25519", status: verdict === "tampered" ? "fail" : verdict === "valid" ? "pass" : "pending", Icon: KeyRound },
                  { label: "ML-DSA-65", status: verdict === "tampered" ? "fail" : verdict === "valid" ? "pass" : "pending", Icon: ShieldCheck },
                  { label: "Inclusion", status: verdict === "tampered" ? "fail" : verdict === "valid" ? "pass" : "pending", Icon: Network },
                ].map(({ label, status, Icon }) => <div className="verifier-check" key={label}><div className={`check-icon check-${status}`}><Icon size={15} /></div><span>{label}</span><strong>{status === "pass" ? "PASS" : status === "fail" ? "FAIL" : "—"}</strong></div>)}
              </div>
              <div className="verifier-footer"><div><span className="verifier-result-label">VERDICT</span><strong className={verdict === "tampered" ? "result-fail" : verdict === "valid" ? "result-pass" : "result-pending"}>{verdict === "tampered" ? "RECEIPT INVALID" : verdict === "valid" ? "RECEIPT VALID" : "AWAITING RECEIPT"}</strong></div><button className="reset-button" onClick={reset}><RefreshCcw size={14} /> reset demo</button></div>
            </div>
          </div>
        </section>

        <footer className="bottom-bar">
          <div className="footer-proof"><span className="footer-check"><Check size={12} /></span><span>Proof of captured execution</span><span className="footer-divider" /><span>not proof of correctness, fairness, or completeness</span></div>
          <span className="footer-build">ProofLane MVP · browser demo</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
