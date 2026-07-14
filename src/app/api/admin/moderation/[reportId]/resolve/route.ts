import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/moderation/[reportId]/resolve">,
) {
  const { reportId } = await context.params;
  return proxyAdminBackend(`/admin/moderation/${reportId}/resolve`, {
    method: "POST",
    body: await request.text(),
  });
}
