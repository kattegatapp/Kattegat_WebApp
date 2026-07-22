import { NextResponse, type NextRequest } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";
import { updateSellerProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  return proxyMemberBackend("/sellers/me/profile");
}

export async function PATCH(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, updateSellerProfileSchema, {
    maxBytes: 48_000,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/sellers/me/profile", {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
}
