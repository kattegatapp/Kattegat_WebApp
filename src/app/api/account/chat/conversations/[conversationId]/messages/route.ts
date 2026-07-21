import { NextResponse, type NextRequest } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { conversationId } = await params;
  return proxyMemberBackend(`/chat/conversations/${conversationId}/messages`);
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const { conversationId } = await params;
  const body = await request.text();

  return proxyMemberBackend(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body,
  });
}
