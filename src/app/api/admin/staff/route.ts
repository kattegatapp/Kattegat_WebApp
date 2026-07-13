import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET() {
  return proxyAdminBackend("/admin/staff");
}

export async function POST(request: NextRequest) {
  return proxyAdminBackend("/admin/staff", {
    method: "POST",
    body: await request.text(),
  });
}
