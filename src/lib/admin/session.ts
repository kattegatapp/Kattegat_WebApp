import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { resolveBackendApiUrl } from "@/lib/api/settings";

export function adminApiUrl(path: string) {
  const base = resolveBackendApiUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${base.endsWith("/api") ? normalized : `/api${normalized}`}`;
}

export async function getAdminAccessToken(): Promise<string | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value?.trim();
  return token || null;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(
    {
      success: false,
      error: { message: "Admin session required", code: "ADMIN_SESSION_REQUIRED" },
    },
    { status: 401, headers: { "Cache-Control": "private, no-store" } },
  );
}

/** Require a non-empty admin session cookie; returns the token or a 401 response. */
export async function requireAdminSession(): Promise<string | NextResponse> {
  const token = await getAdminAccessToken();
  if (!token) return unauthorizedAdminResponse();
  return token;
}

export async function proxyAdminBackend(
  path: string,
  init?: {
    method?: string;
    body?: string;
  },
) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  let response: Response;
  try {
    response = await fetch(adminApiUrl(path), {
      method: init?.method ?? (init?.body === undefined ? "GET" : "PATCH"),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: init?.body,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Could not reach the Kattegat backend. Check NEXT_PUBLIC_API_URL and that the API is running.",
          code: "BACKEND_UNREACHABLE",
        },
      },
      { status: 502 },
    );
  }

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
}

export function adminSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}
