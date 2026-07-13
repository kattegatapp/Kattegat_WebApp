import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return proxyAdminBackend(`/admin/staff/${userId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return proxyAdminBackend(`/admin/staff/${userId}`, {
    method: "DELETE",
  });
}
