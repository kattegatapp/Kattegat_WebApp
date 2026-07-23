import type { AccountConversation } from "@/lib/api/account-chat";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import type { PublicAppSettings } from "@/lib/api/settings";

export type AccountFeatureFlags = Pick<
  PublicAppSettings["features"],
  | "chatEnabled"
  | "referralsEnabled"
  | "recommendationsEnabled"
  | "paymentsEnabled"
  | "contactAgentEnabled"
  | "reviewsEnabled"
  | "freeAccessMode"
>;

/** Admin / Kattegat.Vetted threads — starter sellers may reply here (mobile parity). */
export function isAdminOrVettedConversation(
  conversation: Pick<AccountConversation, "adminId" | "counterpartyName"> | null | undefined,
) {
  if (!conversation) return false;
  if (conversation.adminId) return true;
  return conversation.counterpartyName?.trim().toLowerCase() === "kattegat.vetted";
}

export function conversationMatchesIdentity(
  conversation: Pick<AccountConversation, "buyerId" | "sellerId">,
  userId: string,
  identity: AccountIdentity,
) {
  if (identity === "buyer") return conversation.buyerId === userId;
  return conversation.sellerId === userId;
}

/** Plan tier gate, with free-access mode overlay (backend chat start parity). */
export function effectiveCanChatDirectly(
  planCanChatDirectly: boolean,
  features?: Pick<AccountFeatureFlags, "freeAccessMode"> | null,
) {
  if (features?.freeAccessMode) return true;
  return planCanChatDirectly;
}

/**
 * Lock direct buyer↔seller chat for starter sellers.
 * Never lock admin / Kattegat.Vetted threads.
 */
export function isSellerDirectChatLocked(input: {
  identity: AccountIdentity;
  canChatDirectly: boolean;
  conversation: Pick<AccountConversation, "adminId" | "counterpartyName"> | null;
  freeAccessMode?: boolean;
}) {
  if (input.identity !== "seller") return false;
  if (input.freeAccessMode || input.canChatDirectly) return false;
  if (!input.conversation) return false;
  return !isAdminOrVettedConversation(input.conversation);
}

export function isComposerLocked(input: {
  identity: AccountIdentity;
  canChatDirectly: boolean;
  conversation: AccountConversation | null;
  chatEnabled?: boolean;
  freeAccessMode?: boolean;
}) {
  if (input.chatEnabled === false) {
    return { locked: true, reason: "Messaging is temporarily unavailable." };
  }
  if (!input.conversation) {
    return { locked: true, reason: "Choose a conversation first." };
  }
  if (input.conversation.status === "closed") {
    return { locked: true, reason: "This conversation is closed." };
  }
  if (
    isSellerDirectChatLocked({
      identity: input.identity,
      canChatDirectly: input.canChatDirectly,
      conversation: input.conversation,
      freeAccessMode: input.freeAccessMode,
    })
  ) {
    return {
      locked: true,
      reason: "Direct seller chat requires Pro or White Glove. You can still reply to Kattegat Vetted.",
    };
  }
  return { locked: false, reason: null as string | null };
}

/** Which account views are allowed by public app feature flags. */
export function canAccessFeatureView(
  view: AccountViewId | string,
  features: Pick<
    AccountFeatureFlags,
    "chatEnabled" | "referralsEnabled" | "recommendationsEnabled"
  >,
) {
  if (view === "chat") return features.chatEnabled;
  if (view === "referrals") return features.referralsEnabled;
  if (view === "recommend") return features.recommendationsEnabled;
  return true;
}

export function pickAccountFeatureFlags(
  features: PublicAppSettings["features"],
): AccountFeatureFlags {
  return {
    chatEnabled: features.chatEnabled,
    referralsEnabled: features.referralsEnabled,
    recommendationsEnabled: features.recommendationsEnabled,
    paymentsEnabled: features.paymentsEnabled,
    contactAgentEnabled: features.contactAgentEnabled,
    reviewsEnabled: features.reviewsEnabled,
    freeAccessMode: features.freeAccessMode,
  };
}
