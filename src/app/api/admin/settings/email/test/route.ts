import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  return proxyAdminBackend("/admin/settings/email/test", {
    method: "POST",
    body: await request.text(),
  });
}
