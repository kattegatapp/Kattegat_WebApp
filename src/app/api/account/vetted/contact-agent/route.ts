import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const contactAgentSchema = z
  .object({
    sellerId: z.string().uuid(),
    listingId: z.string().uuid().optional(),
    message: z.string().trim().min(1).max(1000),
  })
  .strict();

export async function POST(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, contactAgentSchema, {
    maxBytes: 4_096,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/vetted/contact-agent", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
