import { complete, handle, jsonBody, requireWorkspace } from "@/lib/ledger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ executionId: string }> }
) {
  return handle(async () =>
    complete(await requireWorkspace(req), (await params).executionId, await jsonBody(req))
  );
}
