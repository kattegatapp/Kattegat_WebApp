import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/payouts/[payoutId]/reject">,
) {
  const { payoutId } = await context.params;
  return proxyAdminBackend(`/admin/payouts/${payoutId}/reject`, {
    method: "POST",
    body: await request.text(),
  });
}
