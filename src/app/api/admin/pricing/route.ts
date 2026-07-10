import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";

const ADMIN_COOKIE = "kattegat_admin_access_token";

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Admin session required", code: "ADMIN_SESSION_REQUIRED" } },
      { status: 401 },
    );
  }

  const response = await fetch(`${apiPath("/admin/pricing")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => null);

  return NextResponse.json(payload ?? { success: false, error: { message: "Invalid API response", code: "INVALID_RESPONSE" } }, {
    status: response.status,
  });
}

function apiPath(path: string) {
  return `${API_URL}${API_URL.endsWith("/api") ? path : `/api${path}`}`;
}
