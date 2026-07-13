import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/recommend-leads/[leadId]">) {
  const { leadId } = await context.params;
  return proxyAdminBackend(`/admin/recommend-leads/${leadId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
