import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const submitSchema = z
  .object({
    documentUrl: z.string().url(),
    documentBackUrl: z.string().url(),
  })
  .strict();

export async function GET() {
  return proxyMemberBackend("/sellers/me/identity-verification");
}

export async function POST(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, submitSchema, {
    maxBytes: 4_096,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/sellers/me/identity-verification", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
