"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";

import type { AccountChatMessage } from "@/lib/api/account-chat";
import { getRealtimeClient, replaceExistingChannel } from "@/lib/realtime/client";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: AccountChatMessage["type"];
  body: string | null;
  created_at: string;
  read_at: string | null;
};

let myMessagesSubscriberCount = 0;

function toMessage(row: MessageRow): AccountChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    type: row.type,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

/** Postgres Changes on `messages` for one conversation — same pattern as mobile.
 * `onUpdate` fires for read-receipt UPDATEs (`markConversationRead` sets `read_at`), so
 * the sender's open chat can turn its checkmarks blue live without a refetch. */
export async function subscribeToConversationMessages(
  conversationId: string,
  onInsert: (message: AccountChatMessage) => void,
  onUpdate?: (message: AccountChatMessage) => void,
): Promise<RealtimeChannel> {
  const supabase = await getRealtimeClient();
  const channelName = `conversation:${conversationId}`;
  replaceExistingChannel(supabase, channelName);
  const channel = supabase.channel(channelName).on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => onInsert(toMessage(payload.new as MessageRow)),
  );
  if (onUpdate) {
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onUpdate(toMessage(payload.new as MessageRow)),
    );
  }
  return channel.subscribe();
}

/** List-wide inserts — RLS scopes to conversations this member belongs to. */
export async function subscribeToMyMessages(
  onInsert: (message: AccountChatMessage) => void,
): Promise<RealtimeChannel> {
  const supabase = await getRealtimeClient();
  myMessagesSubscriberCount += 1;
  return supabase
    .channel(`chat:my-messages:${myMessagesSubscriberCount}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) =>
      onInsert(toMessage(payload.new as MessageRow)),
    )
    .subscribe();
}

export async function unsubscribeRealtime(channel: RealtimeChannel | null | undefined) {
  if (!channel) return;
  const supabase = await getRealtimeClient().catch(() => null);
  if (supabase) void supabase.removeChannel(channel);
}
