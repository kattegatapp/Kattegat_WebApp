import type { NextRequest } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";
import { z } from "zod";

const submitRecommendLeadSchema = z
  .object({
    clientName: z.string().trim().min(1).max(120),
    inquiry: z.string().trim().min(1).max(1000),
    clientPhone: z.string().trim().min(1).max(30),
    clientEmail: z.string().trim().email(),
  })
  .strict();

export async function GET() {
  return proxyMemberBackend("/recommend/leads");
}

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, submitRecommendLeadSchema, { maxBytes: 8_192 });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/recommend/leads", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
