import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

export async function GET() {
  return proxyMemberBackend("/requirements/applications/mine");
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: { message: "Method not allowed", code: "METHOD_NOT_ALLOWED" } },
    { status: 405 },
  );
}
