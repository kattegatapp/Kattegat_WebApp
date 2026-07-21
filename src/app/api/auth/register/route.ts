import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import {
  MEMBER_SESSION_COOKIE,
  memberSessionCookieOptions,
} from "@/lib/auth/session";
import {
  clearAdminSessionCookie,
  staffMemberLoginError,
} from "@/lib/auth/session-isolation";
import { billingApiUrl } from "@/lib/billing/session";
import { parseSecureJson, requestIp } from "@/lib/security/request";
import { memberRegisterSchema } from "@/lib/validations/auth";

function toMemberUser(user: Record<string, unknown> | null | undefined) {
  if (!user?.id || typeof user.email !== "string") return null;
  return {
    id: user.id,
    email: user.email,
    sid: (user.sid as string | null) ?? null,
    bid: (user.bid as string | null) ?? null,
    businessName: (user.businessName as string | null) ?? null,
    username: (user.username as string | null) ?? null,
  };
}

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, memberRegisterSchema, {
    maxBytes: 6_144,
    rateLimit: {
      key: `auth-register:${requestIp(request)}`,
      windowMs: 60 * 60 * 1000,
      max: 10,
    },
  });
  if (!parsed.ok) return parsed.response;

  let response: Response;
  try {
    response = await fetch(billingApiUrl("/auth/register"), {
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

  const needsEmailConfirmation =
    payload?.error?.code === "CONFIRMATION_REQUIRED" ||
    response.status === 202 ||
    (typeof payload?.error?.message === "string" &&
      payload.error.message.toLowerCase().includes("email confirmation"));

  if (needsEmailConfirmation) {
    return NextResponse.json(
      {
        success: true,
        data: null,
        meta: { requiresEmailConfirmation: true },
      },
      { status: 200 },
    );
  }

  if (!response.ok || !payload?.success) {
    return NextResponse.json(
      payload ?? {
        success: false,
        error: { message: "Registration failed", code: "REGISTER_FAILED" },
      },
      { status: response.status || 500 },
    );
  }

  const user = toMemberUser(payload.data?.user);
  const accessToken = payload.data?.session?.accessToken;

  const staffError = staffMemberLoginError(payload.data?.user);
  if (staffError) {
    return NextResponse.json({ success: false, error: staffError }, { status: 403 });
  }

  if (typeof accessToken === "string" && accessToken.trim() && user) {
    const expiresAt = Number(payload.data.session.expiresAt ?? 0);
    const maxAge = expiresAt > 0 ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60) : 60 * 60;
    await clearAdminSessionCookie();
    (await cookies()).set(MEMBER_SESSION_COOKIE, accessToken, memberSessionCookieOptions(maxAge));
  }

  return NextResponse.json({
    success: true,
    data: user,
    meta: payload.data?.session ? undefined : { requiresEmailConfirmation: true },
  });
}
