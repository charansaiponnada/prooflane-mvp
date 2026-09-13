import { decideRequest, handle, jsonBody, requireWorkspace } from "@/lib/ledger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () =>
    decideRequest(await requireWorkspace(req), (await params).id, await jsonBody(req))
  );
}
