import { handle, listEntries, requireWorkspace } from "@/lib/ledger";

export async function GET(req: Request) {
  return handle(async () => listEntries(await requireWorkspace(req)));
}
