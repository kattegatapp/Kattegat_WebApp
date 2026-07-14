import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/listings/[listingId]">,
) {
  const { listingId } = await context.params;
  return proxyAdminBackend(`/admin/listings/${listingId}`);
}
