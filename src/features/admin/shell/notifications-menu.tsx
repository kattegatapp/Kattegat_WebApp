"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, BellRing, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { adminPath } from "@/lib/admin/paths";
import { fetchAdminOverview } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

/** Exact attention keys from `/admin/overview` → admin screens. */
const NOTIFICATION_ROUTES: Record<string, string> = {
  listings: `${adminPath("/listings")}?view=pending`,
  requirements: `${adminPath("/requirements")}?view=pending`,
  identity: adminPath("/identity-verifications"),
  moderation: adminPath("/moderation"),
  founding: adminPath("/founding-members"),
  vetted: adminPath("/white-glove-applications"),
  vetted_chats: adminPath("/agent-requests"),
  recommended: adminPath("/recommended-leads"),
  contact: adminPath("/contact-submissions"),
  billing: adminPath("/billing"),
  payments: adminPath("/payments"),
  payment_issues: adminPath("/payments"),
};

function routeFor(key: string) {
  const normalized = key.trim().toLowerCase();
  if (NOTIFICATION_ROUTES[normalized]) {
    return NOTIFICATION_ROUTES[normalized]!;
  }

  // Prefer longest exact/prefix match so `vetted` never steals `vetted_chats`.
  const match = Object.keys(NOTIFICATION_ROUTES)
    .sort((a, b) => b.length - a.length)
    .find(
      (candidate) =>
        normalized === candidate ||
        normalized.startsWith(`${candidate}_`) ||
        normalized.startsWith(`${candidate}-`),
    );

  return match ? NOTIFICATION_ROUTES[match]! : adminPath();
}

export function AdminNotificationsMenu() {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 60_000,
    // Only poll while the menu is open — avoids burning overview API when idle.
    refetchInterval: open ? 60_000 : false,
    refetchIntervalInBackground: false,
    retry: false,
  });

  const items = useMemo(
    () => (query.data?.attention ?? []).filter((item) => item.count > 0),
    [query.data?.attention],
  );
  const pendingCount = items.reduce((total, item) => total + item.count, 0);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void query.refetch();
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-10 rounded-xl border border-transparent text-zinc-600 hover:border-white/70 hover:bg-white/45 hover:text-zinc-900 hover:backdrop-blur-xl sm:size-9"
            aria-label={pendingCount ? `${pendingCount} admin items need attention` : "Admin notifications"}
          />
        }
      >
        {pendingCount ? <BellRing className="size-4" /> : <Bell className="size-4" />}
        {pendingCount ? (
          <span className="absolute -right-1 -top-1 isolate flex min-w-4 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-red-500/40 motion-safe:animate-ping"
            />
            <span className="flex min-w-4 items-center justify-center rounded-full border border-white/70 bg-red-500/85 px-1 text-[9px] font-bold leading-4 text-white shadow-sm backdrop-blur-md ring-2 ring-white/60">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="ios-glass-pane w-[min(24rem,calc(100vw-1rem))] rounded-2xl border-white/70 bg-transparent p-1.5 text-zinc-900 shadow-[0_24px_60px_rgb(0_57_18/0.14)] ring-0 backdrop-blur-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-3 px-2 py-2">
            <span>
              <span className="block font-bold text-zinc-900">Notifications</span>
              <span className="block text-xs font-normal text-zinc-600">
                Live operations requiring attention
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full hover:bg-white/50"
              aria-label="Refresh notifications"
              disabled={query.isFetching}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void query.refetch();
              }}
            >
              {query.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/50" />
        <DropdownMenuGroup className="max-h-80 overflow-y-auto">
          {query.isError ? (
            <div className="px-3 py-6 text-center text-sm text-red-700">
              Notifications could not be loaded.
            </div>
          ) : query.isPending ? (
            <div className="px-3 py-6 text-center text-sm text-zinc-600" role="status">
              Loading…
            </div>
          ) : items.length ? (
            items.map((item) => (
              <DropdownMenuItem
                key={item.key}
                nativeButton={false}
                className="items-start gap-3 rounded-xl px-3 py-3 focus:bg-white/55 data-highlighted:bg-white/55"
                render={<Link href={routeFor(item.key)} />}
              >
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    item.severity === "high"
                      ? "bg-red-500"
                      : item.severity === "medium"
                        ? "bg-amber-500"
                        : "bg-brand-mantis",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-zinc-900">{item.label}</span>
                  <span className="block text-xs text-zinc-600">
                    {item.count} item{item.count === 1 ? "" : "s"} waiting
                  </span>
                </span>
                <span className="ios-glass-chip rounded-full px-2 py-0.5 text-xs font-bold text-zinc-800">
                  {item.count}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <CheckCheck className="mx-auto size-6 text-emerald-600" />
              <p className="mt-2 font-semibold text-zinc-900">You’re all caught up</p>
              <p className="mt-1 text-xs text-zinc-600">No operational queues need attention.</p>
            </div>
          )}
        </DropdownMenuGroup>
        {items.length ? (
          <>
            <DropdownMenuSeparator className="bg-white/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton={false}
                className="justify-center rounded-xl font-semibold text-zinc-800 focus:bg-white/55 data-highlighted:bg-white/55"
                render={<Link href={adminPath()} />}
              >
                View operations dashboard
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
