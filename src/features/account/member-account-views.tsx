"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  Gift,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  AccountAvatar,
  AccountGlass,
  IdChip,
  SectionHeading,
  accountDisplayName,
} from "@/features/account/account-shared";
import { AccountProfileEditDialog } from "@/features/account/account-profile-edit-dialog";
import { ReferralSharePanel } from "@/features/account/referral-share-panel";
import { Button } from "@/components/ui/button";
import type { AccountIdentity } from "@/features/account/types";
import type { AccountDashboard, AccountListing } from "@/lib/api/account";
import type { AccountNotification } from "@/lib/api/account-notifications";
import {
  clearAllAccountNotifications,
  fetchAccountNotifications,
  fetchAccountUnreadCount,
} from "@/lib/api/account-notifications";
import { formatRelativeTime } from "@/lib/api/account-home";
import { getCatalogCategories } from "@/lib/api/marketing";
import { profileSetupPath } from "@/lib/auth/profile-completion";
import { normalizeMemberDeepLink, isChatDeepLink } from "@/lib/navigation/member-deep-links";
import { cn } from "@/lib/utils";

type DashboardProps = {
  dashboard: AccountDashboard;
  identity?: AccountIdentity;
  accessNotice?: AccountIdentity | null;
};

function tierLabel(tier?: string | null) {
  if (!tier) return "Starter";
  if (tier === "white_glove") return "Vetted";
  return tier.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function listingStatusClass(status: string) {
  const variant =
    status === "live"
      ? "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald"
      : status === "rejected"
        ? "border-red-400/35 bg-red-50 text-red-600"
        : status === "pending_review"
          ? "border-amber-400/35 bg-amber-50 text-amber-700"
          : "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/65";
  return cn("rounded-md border px-2 py-0.5 text-[11px] font-bold", variant);
}

function ViewWrap({ children }: { children: ReactNode }) {
  return <div className="account-view mx-auto max-w-5xl">{children}</div>;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <AccountGlass className="rounded-[16px] px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-forest">{value}</p>
    </AccountGlass>
  );
}

export function AccountCategoriesView({
  onBrowseCategory,
}: {
  onBrowseCategory?: (categoryId: string) => void;
}) {
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCatalogCategories,
    staleTime: 300_000,
  });
  const categories = categoriesQuery.data ?? [];

  return (
    <ViewWrap>
      <SectionHeading title="All categories" />
      {categoriesQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[72px] animate-pulse rounded-[16px] border border-brand-forest/10 bg-white"
            />
          ))}
        </div>
      ) : categories.length ? (
        <div className="flex flex-col gap-2">
          {categories.map((category) => {
            const className =
              "group flex w-full items-center gap-4 rounded-[16px] border border-brand-forest/10 bg-white px-4 py-3.5 text-left transition hover:border-brand-mantis/25 hover:bg-brand-forest/5";
            const body = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-brand-mantis/10 text-brand-mantis">
                  <ClipboardList className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brand-forest">{category.name}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-brand-forest/65">
                    Browse live services in {category.name}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-brand-mantis" />
              </>
            );

            if (onBrowseCategory) {
              return (
                <button
                  key={category.id}
                  type="button"
                  className={className}
                  onClick={() => onBrowseCategory(category.id)}
                >
                  {body}
                </button>
              );
            }

            return (
              <Link
                key={category.id}
                href={`/account?view=browse&categoryId=${encodeURIComponent(category.id)}`}
                className={className}
              >
                {body}
              </Link>
            );
          })}
        </div>
      ) : (
        <AccountGlass className="rounded-[18px] p-8 text-center">
          <p className="font-bold text-brand-forest">Categories unavailable</p>
          <p className="mt-1 text-sm text-brand-forest/65">
            Could not load the catalog right now. Try again shortly.
          </p>
        </AccountGlass>
      )}
    </ViewWrap>
  );
}

export { AccountChatView } from "@/features/account/account-chat-view";

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

export function AccountNotificationsView({
  identity,
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
}: {
  identity?: AccountIdentity;
  notifications: AccountNotification[];
  unreadCount: number;
}) {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["account", "notifications"],
    queryFn: fetchAccountNotifications,
    initialData: initialNotifications,
  });
  const unreadQuery = useQuery({
    queryKey: ["account", "notifications", "unread-count"],
    queryFn: fetchAccountUnreadCount,
    initialData: { count: initialUnreadCount },
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
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  return (
    <ViewWrap>
      <SectionHeading title={identity === "seller" ? "Seller notifications" : "Buyer notifications"} />
      <AccountGlass className="mb-4 rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-brand-forest">Inbox</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-brand-forest/10 text-xs font-bold"
              disabled={clearAll.isPending}
              onClick={() => clearAll.mutate()}
            >
              {clearAll.isPending ? "Clearing…" : "Clear all"}
            </Button>
          ) : null}
        </div>
      </AccountGlass>
      <div className="flex flex-col gap-2">
        {notifications.length ? (
          notifications.map((item) => {
            const Icon = notificationIcon(item);
            const isNew = !item.readAt;
            const time = formatRelativeTime(item.createdAt);
            const href = normalizeMemberDeepLink(item.deepLink);
            const content = (
              <>
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand-mantis/10 text-brand-mantis">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-brand-forest">{item.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
                  </div>
                  {item.body ? (
                    <p className="mt-1 text-[13px] leading-5 text-brand-forest/65">{item.body}</p>
                  ) : null}
                  {href ? (
                    <span className="mt-2 inline-flex text-[12px] font-semibold text-brand-forest">
                      Open update
                    </span>
                  ) : null}
                </div>
              </>
            );

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[16px] border bg-white p-4",
                isNew ? "border-brand-mantis/35" : "border-brand-forest/10",
              )}
            >
              {href ? (
                <Link href={href} className="flex gap-3">
                  {content}
                </Link>
              ) : (
                <div className="flex gap-3">{content}</div>
              )}
            </div>
          );
          })
        ) : (
          <AccountGlass className="rounded-[18px] p-8 text-center">
            <Bell className="mx-auto size-6 text-brand-mantis" />
            <p className="mt-3 font-bold text-brand-forest">You’re all caught up</p>
            <p className="mt-1 text-[13px] leading-6 text-brand-forest/65">
              New account updates, matches, and referral events will appear here.
            </p>
          </AccountGlass>
        )}
      </div>
    </ViewWrap>
  );
}

function useIdentityMutations() {
  const router = useRouter();
  const becomeSeller = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/account/become-seller", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) throw new Error(body?.error?.message ?? "Could not add seller identity");
    },
    onSuccess: () => {
      router.replace(profileSetupPath("seller-setup", "/account"));
      router.refresh();
    },
  });
  const becomeBuyer = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/account/become-buyer", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) throw new Error(body?.error?.message ?? "Could not add buyer identity");
    },
    onSuccess: () => {
      router.replace(profileSetupPath("profile-details", "/account"));
      router.refresh();
    },
  });
  return { becomeSeller, becomeBuyer };
}

function WorkspaceLink({ href, icon: Icon, label, tone }: { href: string; icon: typeof Download; label: string; tone: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-[16px] border border-brand-forest/10 bg-white px-4 py-3.5 transition hover:border-brand-mantis/25">
      <Icon className={cn("size-4", tone)} />
      <span className="text-sm font-bold text-brand-forest">{label}</span>
    </Link>
  );
}
function ListingsSummary({ listings }: { listings: AccountListing[] }) {
  if (!listings.length) {
    return <p className="text-[13px] text-brand-forest/65">No listings yet — create them in the mobile app.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-brand-forest/10 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <th className="pb-2 pr-4 font-semibold">Title</th>
            <th className="pb-2 pr-4 font-semibold">Location</th>
            <th className="pb-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {listings.slice(0, 5).map((listing) => (
            <tr key={listing.id} className="border-b border-brand-forest/10 last:border-0">
              <td className="max-w-[14rem] truncate py-2.5 pr-4 font-medium text-brand-forest">{listing.title}</td>
              <td className="py-2.5 pr-4 text-brand-forest/65">{listing.location || "—"}</td>
              <td className="py-2.5">
                <span className={listingStatusClass(listing.status)}>{listing.status.replaceAll("_", " ")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AccountDashboardView({ dashboard, identity, accessNotice }: DashboardProps) {
  const { user, sellerProfile, listings, referral } = dashboard;
  const isSeller = identity === "seller";
  const { becomeSeller, becomeBuyer } = useIdentityMutations();
  const [walletDisplay, setWalletDisplay] = useState(0);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const displayName = accountDisplayName({
    displayName: sellerProfile?.displayName,
    businessName: user.businessName,
    username: user.username,
    email: user.email,
  });
  const walletTotal = (referral?.wallet.totalEarned ?? 0) / 100;
  const tier = sellerProfile?.tier ?? "starter";

  useEffect(() => {
    if (!walletTotal) return;
    let frame = 0;
    let cancelled = false;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const progress = Math.min(1, (now - start) / duration);
      setWalletDisplay(walletTotal * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [walletTotal]);

  return (
    <ViewWrap>
      {accessNotice ? (
        <div role="status" aria-live="polite">
          <AccountGlass className="mb-4 rounded-[20px] border border-brand-mantis/30 bg-brand-mantis/[0.08] p-5">
            <div className="flex items-start gap-3">
              {accessNotice === "seller" ? (
                <Building2 className="mt-0.5 size-5 shrink-0 text-brand-mantis" />
              ) : (
                <Heart className="mt-0.5 size-5 shrink-0 text-brand-blue" />
              )}
              <div>
                <p className="font-extrabold text-brand-forest">
                  {accessNotice === "seller"
                    ? "Seller identity required"
                    : "Buyer identity required"}
                </p>
                <p className="mt-1 text-[13px] leading-6 text-brand-forest/70">
                  {accessNotice === "seller"
                    ? "Add a seller identity to access listings, Seller Tools, membership and verification. Your buyer profile stays on the same account."
                    : "Add a buyer identity to save services and publish requirements. Your seller profile stays on the same account."}
                </p>
              </div>
            </div>
          </AccountGlass>
        </div>
      ) : null}
      <AccountGlass className="rounded-[22px] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <AccountAvatar
              name={displayName}
              imageUrl={user.avatarUrl || sellerProfile?.avatarUrl}
              className="size-16 text-lg"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-mantis">
                {isSeller ? "Seller dashboard" : "Buyer dashboard"}
              </p>
              <h1 className="mt-1 truncate text-2xl font-extrabold text-brand-forest">{displayName}</h1>
              <p className="mt-1 text-sm text-brand-forest/65">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {isSeller && user.sid ? <IdChip gold>SID · {user.sid}</IdChip> : null}
                {!isSeller && user.bid ? <IdChip>BID · {user.bid}</IdChip> : null}
                {isSeller && user.sid ? (
                  <IdChip gold>{tierLabel(tier)}</IdChip>
                ) : null}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-brand-forest/10 px-4 py-2 text-xs font-bold text-brand-forest"
            onClick={() => setProfileEditOpen(true)}
          >
            Edit profile
          </Button>
        </div>
      </AccountGlass>

      <AccountProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
        dashboard={dashboard}
        identity={identity ?? (user.sid ? "seller" : "buyer")}
      />

      {referral ? (
        <>
          <AccountGlass className="mt-4 rounded-[20px] p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Referral wallet</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-mantis">
                {walletDisplay.toFixed(2)} <span className="text-lg text-brand-forest">AED</span>
              </p>
              <p className="mt-1 text-[12.5px] text-brand-forest/65">
                {referral.activeReferrals} active referral{referral.activeReferrals === 1 ? "" : "s"} · {tierLabel(referral.tier)} tier
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatTile label="This month" value={`${(referral.wallet.thisMonth / 100).toFixed(2)} AED`} />
              <StatTile label="Pending" value={`${(referral.wallet.pending / 100).toFixed(2)} AED`} />
              <StatTile label="Paid out" value={`${(referral.wallet.paidOut / 100).toFixed(2)} AED`} />
            </div>
          </AccountGlass>
          <ReferralSharePanel referral={referral} className="mt-4" />
        </>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatTile
          label="Live listings"
          value={String(listings.filter((l) => l.status === "live").length)}
        />
        <StatTile label="All listings" value={String(listings.length)} />
      </div>

      <SectionHeading title="Workspace" />
      <div className="grid gap-2 sm:grid-cols-3">
        <WorkspaceLink href="/download" icon={Download} label="Get the app" tone="text-brand-blue" />
        {isSeller && user.sid ? <WorkspaceLink href="/billing" icon={CreditCard} label="Billing" tone="text-brand-emerald" /> : null}
        {isSeller && user.sid ? <WorkspaceLink href="/plans" icon={Sparkles} label="Plans" tone="text-brand-mantis" /> : null}
      </div>

      {!user.sid || !user.bid ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {!user.sid ? (
            <AccountGlass className="rounded-[18px] p-4">
              <Building2 className="size-5 text-brand-mantis" />
              <p className="mt-2 font-bold text-brand-forest">Become a seller</p>
              <p className="mt-1 text-[13px] leading-5 text-brand-forest/65">
                List services, manage plans, and appear in discovery.
              </p>
              <Button
                type="button"
                disabled={becomeSeller.isPending}
                onClick={() => becomeSeller.mutate()}
                className="mt-3 rounded-xl bg-gradient-to-br from-brand-mantis to-brand-emerald text-xs font-bold text-brand-forest"
              >
                Add seller identity
              </Button>
            </AccountGlass>
          ) : null}
          {!user.bid ? (
            <AccountGlass className="rounded-[18px] p-4">
              <Heart className="size-5 text-brand-blue" />
              <p className="mt-2 font-bold text-brand-forest">Become a buyer</p>
              <p className="mt-1 text-[13px] leading-5 text-brand-forest/65">
                Save talent and browse as a buyer on the same login.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={becomeBuyer.isPending}
                onClick={() => becomeBuyer.mutate()}
                className="mt-3 rounded-xl border-brand-forest/10 text-xs font-bold text-brand-forest"
              >
                Add buyer identity
              </Button>
            </AccountGlass>
          ) : null}
        </div>
      ) : null}

      {isSeller && user.sid ? (
        <>
          <SectionHeading title="Your listings" />
          <AccountGlass className="rounded-[18px] p-4">
            <p className="mb-3 text-[12.5px] text-brand-forest/65">
              {listings.length} listing{listings.length === 1 ? "" : "s"} · manage in My listings
            </p>
            <ListingsSummary listings={listings} />
          </AccountGlass>
        </>
      ) : null}
    </ViewWrap>
  );
}

export { AccountMembershipView } from "@/features/account/account-membership-view";
