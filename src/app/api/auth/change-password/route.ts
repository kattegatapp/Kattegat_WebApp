import type { NextRequest } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { parseSecureJson } from "@/lib/security/request";
import { memberChangePasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, memberChangePasswordSchema, {
    maxBytes: 4_096,
  });
  if (!parsed.ok) return parsed.response;

  const { currentPassword, newPassword } = parsed.data;

  return proxyMemberBackend("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
