import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const { applicationId } = await context.params;
  if (!applicationId) {
    return NextResponse.json(
      { success: false, error: { message: "Application id required", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  return proxyMemberBackend(`/applications/${applicationId}/award`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
