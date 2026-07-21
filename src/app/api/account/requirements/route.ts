import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireMemberSession } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";

/** Admin-approved open marketplace requirements (backend public catalog). */
export async function GET(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/requirements?${query}` : "/requirements";

  try {
    const response = await fetch(billingApiUrl(path), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);

    return NextResponse.json(
      payload ?? {
        success: false,
        error: { message: "Invalid API response", code: "INVALID_RESPONSE" },
      },
      {
        status: response.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Could not reach the Kattegat backend. Check that the API is running.",
          code: "BACKEND_UNREACHABLE",
        },
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
