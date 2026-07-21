import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  _request: NextRequest,
  context: RouteContext<"/api/admin/payouts/[payoutId]/process">,
) {
  const { payoutId } = await context.params;
  return proxyAdminBackend(`/admin/payouts/${payoutId}/process`, { method: "POST" });
}
