import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { billingApiUrl, sellerSessionCookieOptions } from "@/lib/billing/session";
import {
  clearAdminSessionCookie,
  staffMemberLoginError,
} from "@/lib/auth/session-isolation";
import { parseSecureJson, requestIp } from "@/lib/security/request";
import { memberLoginSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, memberLoginSchema, {
    maxBytes: 4_096,
    rateLimit: {
      key: `billing-login:${requestIp(request)}`,
      windowMs: 15 * 60 * 1000,
      max: 20,
    },
  });
  if (!parsed.ok) return parsed.response;

  let response: Response;
  try {
    response = await fetch(billingApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "The Kattegat backend is offline or unreachable.",
          code: "BACKEND_UNREACHABLE",
        },
      },
      { status: 502 },
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    return NextResponse.json(
      payload ?? { success: false, error: { message: "Login failed", code: "LOGIN_FAILED" } },
      { status: response.status || 500 },
    );
  }

  const user = payload.data?.user;
  const staffError = staffMemberLoginError(user);
  if (staffError) {
    return NextResponse.json({ success: false, error: staffError }, { status: 403 });
  }

  if (!user?.sid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "A seller account is required to purchase a plan. Sign up as a seller or contact support.",
          code: "SELLER_ONLY",
        },
      },
      { status: 403 },
    );
  }

  const accessToken = payload.data?.session?.accessToken;
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    return NextResponse.json(
      { success: false, error: { message: "Login session missing", code: "LOGIN_SESSION_MISSING" } },
      { status: 502 },
    );
  }

  const expiresAt = Number(payload.data.session.expiresAt ?? 0);
  const maxAge = expiresAt > 0 ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60) : 60 * 60;

  await clearAdminSessionCookie();
  (await cookies()).set(SELLER_SESSION_COOKIE, accessToken, sellerSessionCookieOptions(maxAge));

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      sid: user.sid,
      bid: user.bid,
      businessName: user.businessName,
      username: user.username,
    },
  });
}
