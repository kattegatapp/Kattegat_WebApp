import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  return proxyAdminBackend("/auth/change-password", {
    method: "POST",
    body: await request.text(),
  });
}
