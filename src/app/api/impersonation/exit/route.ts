import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { IMPERSONATION_COOKIE } from "@/lib/admin/constants";
import { adminPath } from "@/lib/admin/paths";
import { SELLER_SESSION_COOKIE } from "@/lib/billing/constants";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SELLER_SESSION_COOKIE);
  cookieStore.delete(IMPERSONATION_COOKIE);

  return NextResponse.json({
    success: true,
    data: { redirectTo: adminPath("/users") },
  });
}
