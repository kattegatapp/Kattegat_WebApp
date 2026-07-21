import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { billingApiUrl, sellerSessionCookieOptions } from "@/lib/billing/session";

/** Member web session reuses the seller access cookie (same JWT for billing + account). */
export async function getMemberAccessToken(): Promise<string | null> {
  const token = (await cookies()).get(SELLER_SESSION_COOKIE)?.value?.trim();
  return token || null;
}

export function unauthorizedMemberResponse() {
  return NextResponse.json(
    {
      success: false,
      error: { message: "Sign in required", code: "MEMBER_SESSION_REQUIRED" },
    },
    { status: 401, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function requireMemberSession(): Promise<string | NextResponse> {
  const token = await getMemberAccessToken();
  if (!token) return unauthorizedMemberResponse();
  return token;
}

export async function proxyMemberBackend(
  path: string,
  init?: {
    method?: string;
    body?: string;
  },
) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  let response: Response;
  try {
    response = await fetch(billingApiUrl(path), {
      method: init?.method ?? (init?.body === undefined ? "GET" : "POST"),
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
          message: "Could not reach the Kattegat backend. Check that the API is running.",
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

export function memberSessionCookieOptions(maxAge: number) {
  return sellerSessionCookieOptions(maxAge);
}

export { SELLER_SESSION_COOKIE as MEMBER_SESSION_COOKIE };
