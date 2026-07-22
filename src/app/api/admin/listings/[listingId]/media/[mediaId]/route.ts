import { proxyAdminBackend } from "@/lib/admin/session";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ listingId: string; mediaId: string }> },
) {
  const { listingId, mediaId } = await context.params;
  return proxyAdminBackend(`/admin/listings/${listingId}/media/${mediaId}`, {
    method: "DELETE",
  });
}
