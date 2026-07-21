import type {
  AccountNotification,
  AccountNotificationsState,
} from "@/lib/api/account-notifications";
import { getMemberAccessToken } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";

async function memberFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const response = await fetch(billingApiUrl(path), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) return null;
    return payload.data as T;
  } catch {
    return null;
  }
}

export async function loadAccountNotifications(limit = 30): Promise<AccountNotificationsState> {
  const token = await getMemberAccessToken();
  if (!token) return { items: [], unreadCount: 0 };

  const [items, unread] = await Promise.all([
    memberFetch<AccountNotification[]>("/notifications", token),
    memberFetch<{ count: number }>("/notifications/unread-count", token),
  ]);

  return {
    items: (items ?? []).slice(0, limit),
    unreadCount: unread?.count ?? 0,
  };
}
