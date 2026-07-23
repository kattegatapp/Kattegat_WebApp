import { NextResponse, type NextRequest } from "next/server";

import { proxyMemberBackend, requireMemberSession } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";
import { sellerPlanAccess } from "@/lib/auth/member-access";
import {
  effectiveCanChatDirectly,
  isAdminOrVettedConversation,
} from "@/lib/chat/chat-access";
import { getPublicAppSettings } from "@/lib/api/settings";

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
    const settings = await getPublicAppSettings();
    if (!settings.features.chatEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Messaging is temporarily unavailable.", code: "CHAT_DISABLED" },
        },
        { status: 403 },
      );
    }

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

    // Starter sellers may always reply to Kattegat.Vetted / admin threads.
    // Direct buyer↔seller chat still requires Pro / White Glove (unless free access mode).
    const isSellerParticipant = String(conversation.sellerId ?? "") === userId;
    const vettedThread = isAdminOrVettedConversation({
      adminId: conversation.adminId ?? null,
      counterpartyName: conversation.counterpartyName ?? null,
    });

    if (isSellerParticipant && !vettedThread && !settings.features.freeAccessMode) {
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
      const canChat = effectiveCanChatDirectly(
        sellerPlanAccess(tier, plans).canChatDirectly,
        settings.features,
      );
      if (!canChat) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Direct seller chat requires a Pro or White Glove plan.",
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
