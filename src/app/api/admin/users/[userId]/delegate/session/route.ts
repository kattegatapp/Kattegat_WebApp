import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(_request: NextRequest, context: RouteContext<"/api/admin/users/[userId]/delegate/session">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/session`, { method: "POST", body: "{}" });
}
