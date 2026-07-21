import { NextResponse, type NextRequest } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";
import { sellerPlanAccess } from "@/lib/auth/member-access";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { conversationId } = await params;
  return proxyMemberBackend(`/chat/conversations/${conversationId}/messages`);
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;

  const { conversationId } = await params;
  const headers = { Authorization: `Bearer ${session}`, Accept: "application/json" };

  try {
    const [userResponse, conversationsResponse] = await Promise.all([
      fetch(billingApiUrl("/users/me"), { headers, cache: "no-store" }),
      fetch(billingApiUrl("/chat/conversations"), { headers, cache: "no-store" }),
    ]);
    const [userPayload, conversationsPayload] = await Promise.all([
      userResponse.json().catch(() => null),
      conversationsResponse.json().catch(() => null),
    ]);

    if (!userResponse.ok || !userPayload?.success || !conversationsResponse.ok || !conversationsPayload?.success) {
      return NextResponse.json(
        { success: false, error: { message: "Could not verify chat access.", code: "CHAT_ACCESS_UNAVAILABLE" } },
        { status: 502 },
      );
    }

    const userId = String(userPayload.data?.id ?? "");
    const conversations = Array.isArray(conversationsPayload.data) ? conversationsPayload.data : [];
    const conversation = conversations.find(
      (item: { id?: unknown }) => String(item?.id ?? "") === conversationId,
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { message: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" } },
        { status: 404 },
      );
    }

    if (String(conversation.sellerId ?? "") === userId) {
      const [profileResponse, plansResponse] = await Promise.all([
        fetch(billingApiUrl("/sellers/me/profile"), { headers, cache: "no-store" }),
        fetch(billingApiUrl("/catalog/plan-features"), {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
      ]);
      const [profilePayload, plansPayload] = await Promise.all([
        profileResponse.json().catch(() => null),
        plansResponse.json().catch(() => null),
      ]);
      if (!profileResponse.ok || !profilePayload?.success) {
        return NextResponse.json(
          { success: false, error: { message: "Could not verify seller plan.", code: "CHAT_ACCESS_UNAVAILABLE" } },
          { status: 502 },
        );
      }

      const tier = String(profilePayload.data?.tier ?? "starter").toLowerCase();
      const plans = plansResponse.ok && Array.isArray(plansPayload?.data) ? plansPayload.data : undefined;
      if (!sellerPlanAccess(tier, plans).canChatDirectly) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Direct seller chat requires a Pro or Vetted plan.",
              code: "DIRECT_CHAT_UPGRADE_REQUIRED",
            },
          },
          { status: 403 },
        );
      }
    }
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Could not verify chat access.", code: "CHAT_ACCESS_UNAVAILABLE" } },
      { status: 502 },
    );
  }

  const body = await request.text();

  return proxyMemberBackend(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body,
  });
}
