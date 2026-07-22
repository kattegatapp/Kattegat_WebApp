import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";

const uploadSchema = z
  .object({
    fileBase64: z
      .string()
      .min(100)
      .max(8_000_000)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
  })
  .strict();

export async function POST(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, uploadSchema, {
    maxBytes: 10_000_000,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/sellers/me/identity-verification/document", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
