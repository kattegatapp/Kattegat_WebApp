import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const applySchema = z
  .object({
    pitch: z.string().trim().min(1).max(2000),
    listingRef: z.string().uuid().optional(),
    quote: z.number().int().nonnegative().optional(),
  })
  .strict();

type RouteContext = { params: Promise<{ requirementId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { requirementId } = await context.params;
  if (!requirementId) {
    return NextResponse.json(
      { success: false, error: { message: "Requirement id required", code: "INVALID_ID" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/requirements/${requirementId}/applications`);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const { requirementId } = await context.params;
  if (!requirementId) {
    return NextResponse.json(
      { success: false, error: { message: "Requirement id required", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  const parsed = await parseSecureJson(request, applySchema, {
    maxBytes: 8_000,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend(`/requirements/${requirementId}/applications`, {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
