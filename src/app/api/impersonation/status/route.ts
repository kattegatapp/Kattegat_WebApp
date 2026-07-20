import { NextResponse } from "next/server";

import { readImpersonationState } from "@/lib/admin/impersonation";

export async function GET() {
  const state = await readImpersonationState();
  return NextResponse.json({ success: true, data: state });
}
