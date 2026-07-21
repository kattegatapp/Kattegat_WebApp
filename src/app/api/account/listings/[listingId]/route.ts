import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { updateListingBodySchema } from "@/lib/validations/listing";

type RouteContext = { params: Promise<{ listingId: string }> };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_request: Request, context: RouteContext) {
  const { listingId } = await context.params;
  if (!isUuid(listingId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid listing id", code: "INVALID_ID" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/sellers/me/listings/${listingId}`);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { listingId } = await context.params;
  if (!isUuid(listingId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid listing id", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body", code: "INVALID_BODY" } },
      { status: 400 },
    );
  }

  const parsed = updateListingBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: parsed.error.issues[0]?.message ?? "Invalid listing data",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 },
    );
  }

  return proxyMemberBackend(`/sellers/me/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
}
