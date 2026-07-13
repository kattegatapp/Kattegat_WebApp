import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tier: string }> },
) {
  const { tier } = await params;

  if (!["starter", "pro", "white_glove"].includes(tier)) {
    return Response.json(
      {
        success: false,
        error: { message: "Invalid seller tier", code: "INVALID_TIER" },
      },
      { status: 400 },
    );
  }

  return proxyAdminBackend(`/admin/pricing/${tier}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
