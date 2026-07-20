import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(_request: NextRequest, context: RouteContext<"/api/admin/users/[userId]/delegate/eligibility">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/eligibility`);
}
