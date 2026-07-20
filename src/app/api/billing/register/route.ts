import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { billingApiUrl, sellerSessionCookieOptions } from "@/lib/billing/session";

export async function POST(request: NextRequest) {
  const body = await request.text();
  let response: Response;

  try {
    response = await fetch(billingApiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
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
      payload ?? { success: false, error: { message: "Registration failed", code: "REGISTER_FAILED" } },
      { status: response.status || 500 },
    );
  }

  const user = payload.data?.user;
  const accessToken = payload.data?.session?.accessToken;

  if (typeof accessToken === "string" && accessToken.trim() && user?.sid) {
    const expiresAt = Number(payload.data.session.expiresAt ?? 0);
    const maxAge = expiresAt > 0 ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60) : 60 * 60;
    (await cookies()).set(SELLER_SESSION_COOKIE, accessToken, sellerSessionCookieOptions(maxAge));
  }

  return NextResponse.json({
    success: true,
    data: user
      ? {
          id: user.id,
          email: user.email,
          sid: user.sid,
          bid: user.bid,
          businessName: user.businessName,
          username: user.username,
        }
      : null,
    meta: payload.data?.session ? undefined : { requiresEmailConfirmation: true },
  });
}
