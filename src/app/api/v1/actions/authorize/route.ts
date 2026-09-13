import { authorize, handle, jsonBody, requireWorkspace } from "@/lib/ledger";

export async function POST(req: Request) {
  return handle(async () => authorize(await requireWorkspace(req), await jsonBody(req)));
}
