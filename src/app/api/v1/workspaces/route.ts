import { createWorkspace, handle, jsonBody } from "@/lib/ledger";

export async function POST(req: Request) {
  return handle(async () => createWorkspace(await jsonBody(req)));
}
