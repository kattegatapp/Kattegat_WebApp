"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

import { apiFetch } from "@/lib/api/client";
import type { AccountChatMessage } from "@/lib/api/account-chat";

type RealtimeSession = {
  accessToken: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: AccountChatMessage["type"];
  body: string | null;
  created_at: string;
};

let sessionPromise: Promise<RealtimeSession> | null = null;
let client: SupabaseClient | null = null;
let clientToken: string | null = null;
let myMessagesSubscriberCount = 0;

function toMessage(row: MessageRow): AccountChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    type: row.type,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function loadRealtimeSession() {
  if (!sessionPromise) {
    sessionPromise = apiFetch<RealtimeSession>("/api/account/realtime-session", undefined, {
      baseUrl: "",
    }).catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function getRealtimeClient() {
  const session = await loadRealtimeSession();
  if (!client || clientToken !== session.accessToken) {
    client = createClient(session.supabaseUrl, session.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    });
    // Realtime websocket auth is separate from REST headers — required for RLS filters.
    client.realtime.setAuth(session.accessToken);
    clientToken = session.accessToken;
  }
  return client;
}

function replaceExistingChannel(supabase: SupabaseClient, name: string) {
  const realtimeTopic = `realtime:${name}`;
  const existing = supabase.getChannels().find((channel) => channel.topic === realtimeTopic);
  if (existing) void supabase.removeChannel(existing);
}

/** Postgres Changes on `messages` for one conversation — same pattern as mobile. */
export async function subscribeToConversationMessages(
  conversationId: string,
  onInsert: (message: AccountChatMessage) => void,
): Promise<RealtimeChannel> {
  const supabase = await getRealtimeClient();
  const channelName = `conversation:${conversationId}`;
  replaceExistingChannel(supabase, channelName);
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(toMessage(payload.new as MessageRow)),
    )
    .subscribe();
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
