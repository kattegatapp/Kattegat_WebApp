import { NextResponse, type NextRequest } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";
import { updateAccountProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  return proxyMemberBackend("/users/me");
}

export async function PATCH(request: NextRequest) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const parsed = await parseSecureJson(request, updateAccountProfileSchema, {
    maxBytes: 4_096,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxyMemberBackend("/users/me", {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
}
