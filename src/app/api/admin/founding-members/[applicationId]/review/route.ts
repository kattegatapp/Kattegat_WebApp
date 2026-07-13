import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/founding-members/[applicationId]/review">) {
  const { applicationId } = await context.params;
  return proxyAdminBackend(`/admin/founding-members/${applicationId}/review`, {
    method: "POST",
    body: await request.text(),
  });
}
