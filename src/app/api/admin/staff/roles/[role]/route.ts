import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> },
) {
  const { role } = await params;
  return proxyAdminBackend(`/admin/staff/roles/${role}`, {
    method: "PUT",
    body: await request.text(),
  });
}
