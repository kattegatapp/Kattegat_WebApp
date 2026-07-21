import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ listingId: string }> };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(_request: Request, context: RouteContext) {
  const { listingId } = await context.params;
  if (!isUuid(listingId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid listing id", code: "INVALID_ID" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/sellers/me/listings/${listingId}/unpublish`, { method: "POST" });
}
