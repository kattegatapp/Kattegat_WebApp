import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(_request: Request, context: RouteContext<"/api/admin/contact-agent-requests/[requestId]/seller-thread">) {
  const { requestId } = await context.params;
  return proxyAdminBackend(`/admin/contact-agent-requests/${requestId}/seller-thread`, { method: "POST", body: "{}" });
}
