import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { proxyMemberBackend } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

type RouteContext = { params: Promise<{ quoteId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const respondSchema = z
  .object({
    response: z.enum(["accept", "decline"]),
  })
  .strict();

export async function POST(request: NextRequest, context: RouteContext) {
  const { quoteId } = await context.params;
  if (!UUID.test(quoteId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid quote", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  const parsed = await parseSecureJson(request, respondSchema, {
    maxBytes: 256,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend(`/quotes/${quoteId}/respond`, {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
