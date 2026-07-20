import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/users/[userId]/delegate/listings/[listingId]">,
) {
  const { userId, listingId } = await context.params;
  return proxyAdminBackend(`/admin/users/${userId}/delegate/listings/${listingId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
