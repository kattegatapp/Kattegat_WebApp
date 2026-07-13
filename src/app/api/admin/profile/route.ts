import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

/** Full user profile for the signed-in admin (via `/users/me`). */
export async function GET() {
  return proxyAdminBackend("/users/me");
}

export async function PATCH(request: NextRequest) {
  return proxyAdminBackend("/users/me", {
    method: "PATCH",
    body: await request.text(),
  });
}
