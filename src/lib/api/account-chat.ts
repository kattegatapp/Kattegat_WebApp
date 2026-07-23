import { apiFetch } from "@/lib/api/client";

export type AccountConversation = {
  id: string;
  buyerId: string | null;
  sellerId: string | null;
  adminId: string | null;
  listingId: string | null;
  status: "open" | "closed";
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  createdAt: string;
  counterpartyName: string | null;
  counterpartyAvatarUrl: string | null;
  lastMessagePreview: string | null;
};

export type AccountChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image" | "link" | "file";
  body: string | null;
  createdAt: string;
  readAt: string | null;
};

export async function fetchAccountConversations() {
  return apiFetch<AccountConversation[]>("/api/account/chat/conversations", undefined, { baseUrl: "" });
}

export async function fetchAccountConversationMessages(conversationId: string) {
  return apiFetch<AccountChatMessage[]>(
    `/api/account/chat/conversations/${conversationId}/messages`,
    undefined,
    { baseUrl: "" },
  );
}

export async function sendAccountConversationMessage(conversationId: string, body: string) {
  return apiFetch<AccountChatMessage>(
    `/api/account/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body, type: "text" }),
    },
    { baseUrl: "" },
  );
}

/** Marks every message the caller received in this conversation as read — the sender's
 * open chat sees the checkmarks turn blue live via the existing realtime subscription. */
export async function markAccountConversationRead(conversationId: string) {
  return apiFetch<{ readAt: string }>(
    `/api/account/chat/conversations/${conversationId}/read`,
    { method: "POST", body: JSON.stringify({}) },
    { baseUrl: "" },
  );
}

export async function startAccountConversation(input: {
  sellerId: string;
  listingId?: string;
  firstMessage: string;
}) {
  return apiFetch<AccountConversation>(
    "/api/account/chat/conversations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { baseUrl: "" },
  );
}

export async function contactAgentForListing(input: {
  sellerId: string;
  listingId?: string;
  message: string;
}) {
  return apiFetch<null>(
    "/api/account/vetted/contact-agent",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { baseUrl: "" },
  );
}
