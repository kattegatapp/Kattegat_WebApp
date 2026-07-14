import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  _request: NextRequest,
  context: RouteContext<"/api/admin/contact-agent-requests/[requestId]/touch">,
) {
  const { requestId } = await context.params;
  return proxyAdminBackend(`/admin/contact-agent-requests/${requestId}/touch`, {
    method: "POST",
    body: "{}",
  });
}
