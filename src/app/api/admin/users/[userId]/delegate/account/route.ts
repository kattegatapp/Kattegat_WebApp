import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/users/[userId]/delegate/account">,
) {
  const { userId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/account`, {
    method: "PATCH",
    body: await request.text(),
  });
}
