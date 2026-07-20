import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { IMPERSONATION_COOKIE } from "@/lib/admin/constants";
import { impersonationCookieOptions } from "@/lib/admin/impersonation";
import { adminApiUrl, requireAdminSession } from "@/lib/admin/session";
import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { sellerSessionCookieOptions } from "@/lib/billing/session";

export async function POST(_request: NextRequest, context: RouteContext<"/api/admin/users/[userId]/impersonate">) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { userId } = await context.params;

  let response: Response;
  try {
    response = await fetch(adminApiUrl(`/admin/users/${userId}/impersonate`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: "{}",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Backend unreachable", code: "BACKEND_UNREACHABLE" },
      },
      { status: 502 },
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    return NextResponse.json(payload ?? { success: false, error: { message: "Impersonation failed" } }, {
      status: response.status || 500,
    });
  }

  const accessToken = payload.data?.session?.accessToken;
  const user = payload.data?.user;
  if (typeof accessToken !== "string" || !accessToken.trim() || !user?.id) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid impersonation response", code: "IMPERSONATE_INVALID" } },
      { status: 502 },
    );
  }

  const expiresAt = Number(payload.data.session.expiresAt ?? 0);
  const maxAge = expiresAt > 0 ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60) : 60 * 60;

  const label =
    user.businessName ||
    user.sellerProfile?.displayName ||
    user.username ||
    user.email;

  const cookieStore = await cookies();
  cookieStore.set(SELLER_SESSION_COOKIE, accessToken, sellerSessionCookieOptions(maxAge));
  cookieStore.set(
    IMPERSONATION_COOKIE,
    JSON.stringify({
      targetUserId: user.id,
      targetEmail: user.email,
      targetLabel: label,
      startedAt: new Date().toISOString(),
    }),
    impersonationCookieOptions(maxAge),
  );

  const redirectTo = user.sid ? "/as-user" : "/as-user";

  return NextResponse.json({
    success: true,
    data: {
      ...payload.data,
      redirectTo,
    },
  });
}
