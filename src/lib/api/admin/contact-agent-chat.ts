import { apiFetch } from "@/lib/api/client";
import { validateChatMessageInput } from "@/lib/sanitize/chat-message";

export interface AdminConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image" | "link" | "file";
  body: string | null;
  createdAt: string;
}

export const openContactAgentThread = (requestId: string, role: "buyer" | "seller") =>
  apiFetch<{ conversationId: string }>(
    `/api/admin/contact-agent-requests/${requestId}/${role}-thread`,
    { method: "POST" },
    { baseUrl: "" },
  );

export const fetchConversationMessages = (conversationId: string) =>
  apiFetch<AdminConversationMessage[]>(
    `/api/admin/conversations/${conversationId}/messages`,
    undefined,
    { baseUrl: "" },
  );

export async function sendConversationMessage(conversationId: string, body: string) {
  const validated = validateChatMessageInput(body);
  if (!validated.ok) {
    throw new Error(validated.error);
  }

  return apiFetch<AdminConversationMessage>(
    `/api/admin/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify({ body: validated.value, type: "text" }) },
    { baseUrl: "" },
  );
}

export async function sendConversationImage(conversationId: string, imageUrl: string) {
  const url = imageUrl.trim();
  if (!url.startsWith("https://")) {
    throw new Error("Image URL must start with https://");
  }
  return apiFetch<AdminConversationMessage>(
    `/api/admin/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify({ body: url, type: "image" }) },
    { baseUrl: "" },
  );
}
