import { NextResponse } from "next/server";

import { isStaffAccount } from "@/lib/auth/member-gate";
import { requireMemberSession } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";

export async function GET() {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  let response: Response;
  try {
    response = await fetch(billingApiUrl("/auth/me"), {
      headers: {
        Authorization: `Bearer ${session}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Could not reach the Kattegat backend.", code: "BACKEND_UNREACHABLE" },
      },
      { status: 502 },
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    return NextResponse.json(
      payload ?? { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: response.status || 401 },
    );
  }

  const user = payload.data as { adminRole?: string | null; isAdmin?: boolean } | null;
  if (user && isStaffAccount(user)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Staff accounts must use the admin portal.",
          code: "ADMIN_PORTAL_REQUIRED",
        },
      },
      { status: 403 },
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
