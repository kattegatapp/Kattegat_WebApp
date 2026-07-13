import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { adminApiUrl, adminSessionCookieOptions, getAdminAccessToken } from "@/lib/admin/session";

export async function POST() {
  const token = await getAdminAccessToken();

  if (token) {
    try {
      await fetch(adminApiUrl("/auth/logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Still clear the local session even if the backend is unreachable.
    }
  }

  (await cookies()).set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  });
  return NextResponse.json({ success: true, data: null });
}
