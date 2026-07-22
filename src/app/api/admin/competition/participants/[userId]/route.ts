import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/competition/participants/[userId]">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/competition/participants/${userId}`, { method: "PATCH", body: await request.text() });
}
