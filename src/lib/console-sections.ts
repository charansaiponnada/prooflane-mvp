export const CONSOLE_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "run", label: "Run agent" },
  { id: "ledger", label: "Ledger" },
  { id: "auditors", label: "Auditors" },
  { id: "cool", label: "CooL SDK" },
  { id: "integrate", label: "Integrate" },
] as const;

export type ConsoleSection = (typeof CONSOLE_SECTIONS)[number]["id"];

export const sectionOf = (hash: string): ConsoleSection =>
  CONSOLE_SECTIONS.find((s) => s.id === hash)?.id ?? "overview";
