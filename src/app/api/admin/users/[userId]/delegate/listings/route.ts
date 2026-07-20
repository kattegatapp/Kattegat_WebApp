import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(_request: NextRequest, context: RouteContext<"/api/admin/users/[userId]/delegate/listings">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/listings`);
}

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/users/[userId]/delegate/listings">) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/listings`, {
    method: "POST",
    body: await request.text(),
  });
}
