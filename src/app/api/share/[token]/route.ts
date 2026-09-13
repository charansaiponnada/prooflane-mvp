import { handle, publicShare } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  return handle(async () => publicShare((await params).token));
}
