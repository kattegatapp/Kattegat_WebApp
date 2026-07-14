import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/vetted/[applicationId]/review">,
) {
  const { applicationId } = await context.params;
  return proxyAdminBackend(`/admin/vetted/${applicationId}/review`, {
    method: "POST",
    body: await request.text(),
  });
}
