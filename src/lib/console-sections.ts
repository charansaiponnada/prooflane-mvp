/** Console tabs, ordered as the customer lifecycle: connect → enforce → record → prove. */
export const CONSOLE_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    stage: null,
    title: "Workspace overview",
    who: "Everyone",
    blurb: "Where your agents stand today and what to do next.",
  },
  {
    id: "integrate",
    label: "Connect",
    stage: 1,
    title: "Connect your agent",
    who: "Engineering",
    blurb: "Wrap the tools that move money with proof.guard(). One import, no agent rewrite.",
  },
  {
    id: "run",
    label: "Enforce",
    stage: 2,
    title: "Enforce payment policy",
    who: "Risk & compliance",
    blurb: "Every call is checked against policy before it runs. Try the built-in test agent.",
  },
  {
    id: "ledger",
    label: "Record",
    stage: 3,
    title: "Receipt ledger",
    who: "Operations",
    blurb: "Every approval, refusal and outcome as a signed receipt, re-verified in your browser.",
  },
  {
    id: "auditors",
    label: "Prove",
    stage: 4,
    title: "Share with auditors",
    who: "Auditors, customers, insurers",
    blurb: "Give reviewers one link. They verify everything and see only the fields you release.",
  },
  {
    id: "cool",
    label: "Under the hood",
    stage: null,
    title: "Where CooL runs",
    who: "Security review",
    blurb: "Each CooL SDK call behind the steps above, with live numbers.",
  },
] as const;

export type ConsoleSection = (typeof CONSOLE_SECTIONS)[number]["id"];

export const sectionOf = (hash: string): ConsoleSection =>
  CONSOLE_SECTIONS.find((s) => s.id === hash)?.id ?? "overview";
