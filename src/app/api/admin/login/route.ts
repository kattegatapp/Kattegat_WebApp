import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { API_URL } from "@/lib/api/client";

const ADMIN_COOKIE = "kattegat_admin_access_token";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch(`${apiPath("/auth/login")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    return NextResponse.json(payload ?? { success: false, error: { message: "Login failed", code: "LOGIN_FAILED" } }, {
      status: response.status || 500,
    });
  }

  if (!payload.data.user.adminRole) {
    return NextResponse.json(
      { success: false, error: { message: "This account does not have admin access.", code: "ADMIN_REQUIRED" } },
      { status: 403 },
    );
  }

  const expiresAt = Number(payload.data.session.expiresAt ?? 0);
  const maxAge = expiresAt > 0 ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60) : 60 * 60;

  (await cookies()).set(ADMIN_COOKIE, payload.data.session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ success: true, data: { user: payload.data.user } });
}

function apiPath(path: string) {
  return `${API_URL}${API_URL.endsWith("/api") ? path : `/api${path}`}`;
}
