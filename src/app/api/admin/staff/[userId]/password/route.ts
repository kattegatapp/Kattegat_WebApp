import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return proxyAdminBackend(`/admin/staff/${userId}/password`, {
    method: "POST",
    body: await request.text(),
  });
}
