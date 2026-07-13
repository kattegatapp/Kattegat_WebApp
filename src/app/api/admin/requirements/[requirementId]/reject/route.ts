import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requirementId: string }> },
) {
  const { requirementId } = await params;
  return proxyAdminBackend(`/admin/requirements/${requirementId}/reject`, {
    method: "POST",
    body: await request.text(),
  });
}
