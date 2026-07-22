import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const updateStatusSchema = z
  .object({
    status: z.enum(["viewed", "shortlisted", "declined"]),
  })
  .strict();

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const { applicationId } = await context.params;
  if (!applicationId) {
    return NextResponse.json(
      { success: false, error: { message: "Application id required", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  const parsed = await parseSecureJson(request, updateStatusSchema, {
    maxBytes: 1_024,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend(`/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
}
