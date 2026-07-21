import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { adminApiUrl, adminSessionCookieOptions } from "@/lib/admin/session";
import { clearMemberSessionCookie } from "@/lib/auth/session-isolation";
import { parseSecureJson, requestIp } from "@/lib/security/request";
import { adminLoginPasswordSchema } from "@/lib/validations/admin";

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, adminLoginPasswordSchema, {
    maxBytes: 4_096,
    rateLimit: {
      key: `admin-login:${requestIp(request)}`,
      windowMs: 15 * 60 * 1000,
      max: 15,
    },
  });
  if (!parsed.ok) return parsed.response;

  let response: Response;
  try {
    response = await fetch(adminApiUrl("/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "Kattegat Web",
        "X-Kattegat-Platform": request.headers.get("sec-ch-ua-platform") ?? "web",
      },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "The Kattegat backend is offline or unreachable. Start it and try again.",
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

  if (!payload.data?.user?.adminRole) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "This account does not have admin access.", code: "ADMIN_REQUIRED" },
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

  await clearMemberSessionCookie();
  (await cookies()).set(ADMIN_SESSION_COOKIE, accessToken, adminSessionCookieOptions(maxAge));

  return NextResponse.json({ success: true, data: payload.data.user });
}
