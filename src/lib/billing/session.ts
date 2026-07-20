import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { API_URL } from "@/lib/api/client";

export function billingApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${API_URL.endsWith("/api") ? normalized : `/api${normalized}`}`;
}

export async function getSellerAccessToken(): Promise<string | null> {
  const token = (await cookies()).get(SELLER_SESSION_COOKIE)?.value?.trim();
  return token || null;
}

export function unauthorizedSellerResponse() {
  return NextResponse.json(
    {
      success: false,
      error: { message: "Seller session required", code: "SELLER_SESSION_REQUIRED" },
    },
    { status: 401, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function requireSellerSession(): Promise<string | NextResponse> {
  const token = await getSellerAccessToken();
  if (!token) return unauthorizedSellerResponse();
  return token;
}

export async function proxySellerBackend(
  path: string,
  init?: {
    method?: string;
    body?: string;
  },
) {
  const session = await requireSellerSession();
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

export function sellerSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
