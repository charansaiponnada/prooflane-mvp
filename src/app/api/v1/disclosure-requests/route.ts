import { handle, listRequests, requireWorkspace } from "@/lib/ledger";

export async function GET(req: Request) {
  return handle(async () => listRequests(await requireWorkspace(req)));
}
