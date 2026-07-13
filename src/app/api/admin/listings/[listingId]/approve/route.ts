import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  return proxyAdminBackend(`/admin/listings/${listingId}/approve`, { method: "POST" });
}
