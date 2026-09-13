import { trustAnchor } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/** Published trust material: pin once, then verify receipts offline. */
export async function GET() {
  return Response.json(await trustAnchor());
}
