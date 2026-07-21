import { apiFetch } from "@/lib/api/client";

export type AccountNotification = {
  id: string;
  title: string;
  body: string | null;
  deepLink: string | null;
  readAt: string | null;
  createdAt: string;
};

export type AccountNotificationsState = {
  items: AccountNotification[];
  unreadCount: number;
};

export async function fetchAccountNotifications() {
  return apiFetch<AccountNotification[]>("/api/account/notifications", undefined, { baseUrl: "" });
}

export async function fetchAccountUnreadCount() {
  return apiFetch<{ count: number }>("/api/account/notifications/unread-count", undefined, { baseUrl: "" });
}

export async function clearAllAccountNotifications() {
  return apiFetch<null>(
    "/api/account/notifications/read-all",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    { baseUrl: "" },
  );
}
