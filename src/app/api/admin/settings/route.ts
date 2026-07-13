import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET() {
  return proxyAdminBackend("/admin/settings");
}

export async function PATCH(request: NextRequest) {
  return proxyAdminBackend("/admin/settings", {
    method: "PATCH",
    body: await request.text(),
  });
}
