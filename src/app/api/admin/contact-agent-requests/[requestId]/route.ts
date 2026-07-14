import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/contact-agent-requests/[requestId]">) {
  const { requestId } = await context.params;
  return proxyAdminBackend(`/admin/contact-agent-requests/${requestId}`, { method: "PATCH", body: await request.text() });
}
