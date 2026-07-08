import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { API_URL } from "@/lib/api/client";

const ADMIN_COOKIE = "kattegat_admin_access_token";

export async function GET() {
  return proxyAdminSettings();
}

export async function PATCH(request: NextRequest) {
  return proxyAdminSettings(await request.text());
}

async function proxyAdminSettings(body?: string) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Admin session required", code: "ADMIN_SESSION_REQUIRED" } },
      { status: 401 },
    );
  }

  const response = await fetch(`${apiPath("/admin/settings")}`, {
    method: body === undefined ? "GET" : "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  const payload = await response.json().catch(() => null);

  return NextResponse.json(payload ?? { success: false, error: { message: "Invalid API response", code: "INVALID_RESPONSE" } }, {
    status: response.status,
  });
}

function apiPath(path: string) {
  return `${API_URL}${API_URL.endsWith("/api") ? path : `/api${path}`}`;
}
