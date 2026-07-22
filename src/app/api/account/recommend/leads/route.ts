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

const listRecommendLeadsSchema = z.object({
  status: z.enum(["submitted", "in_progress", "confirmed", "completed", "not_proceeding"]).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const parsed = listRecommendLeadsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid lead filters." } }, { status: 400 });
  const query = new URLSearchParams(parsed.data).toString();
  return proxyMemberBackend(`/recommend/leads${query ? `?${query}` : ""}`);
}

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, submitRecommendLeadSchema, { maxBytes: 8_192 });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/recommend/leads", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
