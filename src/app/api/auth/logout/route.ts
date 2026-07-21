import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { IMPERSONATION_COOKIE } from "@/lib/admin/constants";
import { impersonationCookieOptions } from "@/lib/admin/impersonation";
import {
  MEMBER_SESSION_COOKIE,
  memberSessionCookieOptions,
} from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value?.trim();

  if (token) {
    try {
      await fetch(billingApiUrl("/auth/logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Still clear the local session.
    }
  }

  cookieStore.set(MEMBER_SESSION_COOKIE, "", memberSessionCookieOptions(0));
  // Real member logout should not leave a staff impersonation marker behind.
  if (cookieStore.get(IMPERSONATION_COOKIE)?.value) {
    cookieStore.set(IMPERSONATION_COOKIE, "", impersonationCookieOptions(0));
  }

  return NextResponse.json({ success: true, data: null });
}
