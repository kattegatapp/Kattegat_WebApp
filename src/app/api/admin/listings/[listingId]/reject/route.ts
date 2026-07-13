import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  return proxyAdminBackend(`/admin/listings/${listingId}/reject`, {
    method: "POST",
    body: await request.text(),
  });
}
