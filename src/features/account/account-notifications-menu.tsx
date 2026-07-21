"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bell,
  BellRing,
  CheckCheck,
  ClipboardList,
  Gift,
  Loader2,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AccountIdentity } from "@/features/account/types";
import { formatRelativeTime } from "@/lib/api/account-home";
import {
  clearAllAccountNotifications,
  fetchAccountNotifications,
  fetchAccountUnreadCount,
  type AccountNotification,
  type AccountNotificationsState,
} from "@/lib/api/account-notifications";
import {
  normalizeMemberDeepLink,
  isChatDeepLink,
} from "@/lib/navigation/member-deep-links";
import { cn } from "@/lib/utils";

function notificationIcon(notification: AccountNotification) {
  const haystack = `${notification.title} ${notification.body ?? ""} ${notification.deepLink ?? ""}`.toLowerCase();
  if (haystack.includes("referral") || haystack.includes("reward")) return Gift;
  if (haystack.includes("listing")) return BadgeCheck;
  if (haystack.includes("profile view")) return TrendingUp;
  if (haystack.includes("plan") || haystack.includes("membership") || haystack.includes("pro")) return Sparkles;
  if (haystack.includes("requirement")) return ClipboardList;
  if (isChatDeepLink(notification.deepLink) || haystack.includes("message") || haystack.includes("chat")) {
    return MessageCircle;
  }
  return Bell;
}

type AccountNotificationsMenuProps = {
  identity: AccountIdentity;
  notifications: AccountNotificationsState;
  onViewAll: () => void;
};

export function AccountNotificationsMenu({
  identity,
  notifications: initial,
  onViewAll,
}: AccountNotificationsMenuProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ["account", "notifications"],
    queryFn: fetchAccountNotifications,
    initialData: initial.items,
    enabled: open,
  });

  const unreadQuery = useQuery({
    queryKey: ["account", "notifications", "unread-count"],
    queryFn: fetchAccountUnreadCount,
    initialData: { count: initial.unreadCount },
    refetchInterval: open ? 30_000 : 60_000,
  });

  const clearAll = useMutation({
    mutationFn: clearAllAccountNotifications,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["account", "notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["account", "notifications", "unread-count"] }),
      ]);
    },
  });

  const items = notificationsQuery.data ?? initial.items;
  const unreadCount = unreadQuery.data?.count ?? 0;
  const preview = items.slice(0, 8);
  const title = identity === "seller" ? "Seller notifications" : "Buyer notifications";

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          void notificationsQuery.refetch();
          void unreadQuery.refetch();
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "relative size-9 shrink-0 rounded-lg border border-brand-forest/12 bg-white text-brand-forest hover:bg-brand-forest/5 sm:size-10",
              unreadCount > 0 && "account-notification-bell--active",
            )}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
          />
        }
      >
        {unreadCount > 0 ? (
          <BellRing className="size-4 sm:size-5 motion-safe:animate-pulse" />
        ) : (
          <Bell className="size-4 sm:size-5" />
        )}
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 isolate flex min-w-4 items-center justify-center">
            <span
              aria-hidden
              className="account-notification-badge-shimmer absolute inset-0 -z-10 rounded-full"
            />
            <span className="account-notification-badge-pulse flex min-w-4 items-center justify-center rounded-full border border-white bg-brand-mantis px-1 text-[9px] font-bold leading-4 text-brand-forest shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl border-brand-forest/10 bg-white p-1.5 text-brand-forest shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-start justify-between gap-3 px-2 py-2">
            <span>
              <span className="block font-bold text-brand-forest">Notifications</span>
              <span className="block text-xs font-normal text-muted-foreground">{title}</span>
            </span>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-lg border-brand-forest/10 px-2.5 text-[11px] font-bold"
                disabled={clearAll.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearAll.mutate();
                }}
              >
                {clearAll.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Clear all"}
              </Button>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-brand-forest/8" />

        <DropdownMenuGroup className="max-h-80 overflow-y-auto">
          {notificationsQuery.isFetching && !preview.length ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground" role="status">
              Loading…
            </div>
          ) : preview.length ? (
            preview.map((item) => {
              const Icon = notificationIcon(item);
              const isNew = !item.readAt;
              const href = normalizeMemberDeepLink(item.deepLink);

              return (
                <DropdownMenuItem
                  key={item.id}
                  nativeButton={false}
                  className={cn(
                    "items-start gap-3 rounded-xl px-3 py-3 focus:bg-brand-forest/5 data-highlighted:bg-brand-forest/5",
                    isNew && "bg-brand-mantis/5",
                  )}
                  render={
                    href ? (
                      <Link href={href} onClick={() => setOpen(false)} />
                    ) : (
                      <button type="button" className="w-full text-left" onClick={() => setOpen(false)} />
                    )
                  }
                >
                  <span className="relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-mantis/12 text-brand-forest">
                    <Icon className="size-4" />
                    {isNew ? (
                      <span className="account-notification-dot-shimmer absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-brand-mantis ring-2 ring-white" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={cn("line-clamp-1 text-sm", isNew ? "font-extrabold" : "font-semibold")}>
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </span>
                    {item.body ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-brand-forest/65">
                        {item.body}
                      </span>
                    ) : null}
                  </span>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <CheckCheck className="mx-auto size-6 text-brand-emerald" />
              <p className="mt-2 font-semibold text-brand-forest">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">New updates will appear here.</p>
            </div>
          )}
        </DropdownMenuGroup>

        {preview.length ? (
          <>
            <DropdownMenuSeparator className="bg-brand-forest/8" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="justify-center rounded-xl py-2.5 font-semibold text-brand-forest focus:bg-brand-forest/5 data-highlighted:bg-brand-forest/5"
                onClick={() => {
                  setOpen(false);
                  onViewAll();
                }}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
