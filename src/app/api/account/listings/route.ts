import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { createListingBodySchema } from "@/lib/validations/listing";

export async function GET() {
  return proxyMemberBackend("/sellers/me/listings");
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body", code: "INVALID_BODY" } },
      { status: 400 },
    );
  }

  const parsed = createListingBodySchema.safeParse(json);
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

  return proxyMemberBackend("/sellers/me/listings", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
