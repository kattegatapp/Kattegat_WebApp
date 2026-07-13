import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(_request: NextRequest, context: RouteContext<"/api/admin/users/[userId]">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}`);
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/users/[userId]">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}`, { method: "PATCH", body: await request.text() });
}
