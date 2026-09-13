import { handle, requireWorkspace, stats } from "@/lib/ledger";

export async function GET(req: Request) {
  return handle(async () => stats(await requireWorkspace(req)));
}
