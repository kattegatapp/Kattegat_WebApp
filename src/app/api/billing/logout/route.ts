import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";
import { billingApiUrl, sellerSessionCookieOptions } from "@/lib/billing/session";

export async function POST() {
  const token = (await cookies()).get(SELLER_SESSION_COOKIE)?.value?.trim();

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

  (await cookies()).set(SELLER_SESSION_COOKIE, "", sellerSessionCookieOptions(0));

  return NextResponse.json({ success: true, data: null });
}
