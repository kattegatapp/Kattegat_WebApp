import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "kattegat_admin_access_token";

export async function POST() {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true, data: null });
}
