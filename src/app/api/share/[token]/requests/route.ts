import { handle, jsonBody, requestDisclosure } from "@/lib/ledger";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return handle(async () => requestDisclosure((await params).token, await jsonBody(req)));
}
