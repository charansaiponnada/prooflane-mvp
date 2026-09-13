import { createShare, handle, jsonBody, requireWorkspace } from "@/lib/ledger";

export async function POST(req: Request) {
  return handle(async () => createShare(await requireWorkspace(req), await jsonBody(req)));
}
