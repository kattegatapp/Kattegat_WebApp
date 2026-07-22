import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const startConversationSchema = z
  .object({
    sellerId: z.string().uuid(),
    listingId: z.string().uuid().optional(),
    firstMessage: z.string().trim().min(1).max(4000),
  })
  .strict();

export async function GET() {
  return proxyMemberBackend("/chat/conversations");
}

export async function POST(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, startConversationSchema, {
    maxBytes: 8_192,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/chat/conversations", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
