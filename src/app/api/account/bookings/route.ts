import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

const IDENTITIES = new Set(["buyer", "seller"]);

export async function GET(request: NextRequest) {
  const identity = request.nextUrl.searchParams.get("identity");
  if (!identity || !IDENTITIES.has(identity)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid identity", code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/bookings?identity=${identity}`);
}
