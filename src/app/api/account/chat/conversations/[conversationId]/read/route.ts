import type { NextRequest } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

type Params = { params: Promise<{ conversationId: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { conversationId } = await params;
  return proxyMemberBackend(`/chat/conversations/${conversationId}/read`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
