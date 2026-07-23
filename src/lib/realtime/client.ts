"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { apiFetch } from "@/lib/api/client";

type RealtimeSession = {
  accessToken: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let sessionPromise: Promise<RealtimeSession> | null = null;
let client: SupabaseClient | null = null;
let clientToken: string | null = null;

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

/** One shared Supabase Realtime client/websocket for the whole account app — chat and
 * notifications both subscribe over it rather than each opening their own connection. */
export async function getRealtimeClient(): Promise<SupabaseClient> {
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

export function replaceExistingChannel(supabase: SupabaseClient, name: string): void {
  const realtimeTopic = `realtime:${name}`;
  const existing = supabase.getChannels().find((channel) => channel.topic === realtimeTopic);
  if (existing) void supabase.removeChannel(existing);
}
