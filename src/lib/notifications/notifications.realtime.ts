"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";

import type { AccountNotification } from "@/lib/api/account-notifications";
import { getRealtimeClient } from "@/lib/realtime/client";

/** Raw Postgres row shape from a Realtime payload — snake_case, unlike `AccountNotification`. */
type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  deep_link: string | null;
  read_at: string | null;
  created_at: string;
};

function toAccountNotification(row: NotificationRow): AccountNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    deepLink: row.deep_link,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/**
 * Postgres Changes over Supabase Realtime, scoped to this user's own rows via the
 * `user_id=eq.` filter (RLS scopes it again server-side regardless) — same pattern as
 * mobile's `notifications.realtime.ts`. `notifications` is already in the
 * `supabase_realtime` publication (0014), so this streams new rows (including the
 * "new message" notification `chat.service.ts` queues on every send) so the bell badge
 * updates sub-second instead of waiting on the 30-60s poll interval.
 */
export async function subscribeToAccountNotifications(
  userId: string,
  onInsert: (notification: AccountNotification) => void,
): Promise<RealtimeChannel> {
  const supabase = await getRealtimeClient();
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(toAccountNotification(payload.new as NotificationRow)),
    )
    .subscribe();
}

export async function unsubscribeAccountRealtime(channel: RealtimeChannel | null | undefined) {
  if (!channel) return;
  const supabase = await getRealtimeClient().catch(() => null);
  if (supabase) void supabase.removeChannel(channel);
}
