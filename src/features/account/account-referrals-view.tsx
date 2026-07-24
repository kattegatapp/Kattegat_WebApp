"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Clock3,
  Gift,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CompetitionDashboardBanner } from "@/features/account/competition-dashboard-banner";
import { ReferralSharePanel } from "@/features/account/referral-share-panel";
import {
  AccountAvatar,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { CurrencyAmount } from "@/components/currency";
import { Button } from "@/components/ui/button";
import type { AccountDashboard } from "@/lib/api/account";
import { formatRelativeTime } from "@/lib/api/account-home";
import {
  fetchAccountReferralSummary,
  fetchReferralLeaderboard,
  fetchReferredUsers,
} from "@/lib/api/account-referrals";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const REFERRAL_MILESTONES = [
  { tier: "builder", activeReferralsMin: 1, residualRate: 0.2 },
  { tier: "pro_referrer", activeReferralsMin: 25, residualRate: 0.25 },
  { tier: "elite", activeReferralsMin: 50, residualRate: 0.3 },
] as const;

type ListTab = "people" | "leaderboard";

function tierLabel(tier?: string | null) {
  if (!tier) return "Starter";
  return tier.replaceAll("_", " ");
}

function EmptyBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Gift;
  title: string;
  body: string;
}) {
  return (
    <AccountGlass className="rounded-[18px] p-10 text-center">
      <Icon className="mx-auto size-7 text-brand-mantis" />
      <p className="mt-4 font-bold text-brand-forest">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-brand-forest/65">{body}</p>
    </AccountGlass>
  );
}

export function AccountReferralsView({
  dashboard,
  onOpenEarnings,
}: {
  dashboard: AccountDashboard;
  onOpenEarnings?: () => void;
}) {
  const [listTab, setListTab] = useState<ListTab>("people");

  const summaryQuery = useQuery({
    queryKey: ["account", "referrals", "summary"],
    queryFn: fetchAccountReferralSummary,
    initialData: dashboard.referral ?? undefined,
  });
  const referredQuery = useQuery({
    queryKey: ["account", "referrals", "referred-users"],
    queryFn: fetchReferredUsers,
  });
  const leaderboardQuery = useQuery({
    queryKey: ["account", "referrals", "leaderboard"],
    queryFn: fetchReferralLeaderboard,
  });

  const referral = summaryQuery.data;
  const referred = referredQuery.data ?? [];
  const leaderboard = leaderboardQuery.data?.entries.slice(0, 10) ?? [];

  const progress = useMemo(() => {
    if (!referral) return null;
    const currentIndex = REFERRAL_MILESTONES.findIndex((item) => item.tier === referral.tier);
    const next = REFERRAL_MILESTONES[currentIndex + 1];
    if (!next) {
      return { percent: 100, caption: "You’re at the top referral tier." };
    }
    const remaining = Math.max(0, next.activeReferralsMin - referral.activeReferrals);
    const percent = Math.min(
      100,
      Math.round((referral.activeReferrals / next.activeReferralsMin) * 100),
    );
    return {
      percent,
      caption:
        remaining > 0
          ? `${remaining} more active referral${remaining === 1 ? "" : "s"} to reach ${tierLabel(next.tier)} (${Math.round(next.residualRate * 100)}%)`
          : `${tierLabel(next.tier)} unlocks on your next payout.`,
    };
  }, [referral]);

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Referrals"
        description="Share your link. When people join and subscribe, you earn — and climb the leaderboard."
      />

      <div className="mb-5">
        <CompetitionDashboardBanner
          activeReferrals={referral?.activeReferrals}
          href="/competition"
          ctaLabel="View competition"
        />
      </div>

      {!referral ? (
        <EmptyBlock
          icon={Gift}
          title="Referrals unavailable"
          body="Referral rewards will appear here when the program is enabled for your account."
        />
      ) : (
        <div className="space-y-5">
          <AccountListCard className="overflow-hidden p-0">
            <div className="border-b border-brand-forest/8 bg-gradient-to-br from-[#F7F9F8] via-white to-brand-mantis/10 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    <Wallet className="size-3.5" />
                    Total earned
                  </p>
                  <CurrencyAmount
                    fils={referral.wallet.totalEarned}
                    size="xl"
                    showDecimals
                    className="mt-2 text-brand-mantis"
                  />
                </div>
                <span className="rounded-full border border-brand-forest/10 bg-white px-3 py-1 text-[11px] font-bold capitalize text-brand-forest/70">
                  {tierLabel(referral.tier)} tier
                </span>
              </div>

              {progress ? (
                <div className="mt-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-forest/10">
                    <div
                      className="h-full rounded-full bg-brand-mantis transition-[width]"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-brand-forest/60">{progress.caption}</p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-px bg-brand-forest/8 sm:grid-cols-4">
              <MetricCell
                icon={CalendarDays}
                label="This month"
                value={
                  <CurrencyAmount fils={referral.wallet.thisMonth} size="sm" showDecimals />
                }
              />
              <MetricCell
                icon={Clock3}
                label="Pending"
                value={
                  <CurrencyAmount fils={referral.wallet.pending} size="sm" showDecimals />
                }
              />
              <MetricCell
                icon={Check}
                label="Paid out"
                value={
                  <CurrencyAmount fils={referral.wallet.paidOut} size="sm" showDecimals />
                }
              />
              <MetricCell
                icon={Users}
                label="Active refs"
                value={String(referral.activeReferrals)}
              />
            </div>
          </AccountListCard>

          <div className="grid gap-3 sm:grid-cols-3">
            <AccountGlass className="rounded-[18px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Referrals earned
              </p>
              <CurrencyAmount
                fils={referral.walletBreakdown?.referral ?? 0}
                size="lg"
                showDecimals
                className="mt-1"
              />
            </AccountGlass>
            <AccountGlass className="rounded-[18px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Recommend earned
              </p>
              <CurrencyAmount
                fils={referral.walletBreakdown?.recommend ?? 0}
                size="lg"
                showDecimals
                className="mt-1"
              />
            </AccountGlass>
            <AccountGlass className="rounded-[18px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Invoice credits
              </p>
              <CurrencyAmount
                fils={referral.walletBreakdown?.invoice ?? 0}
                size="lg"
                showDecimals
                className="mt-1"
              />
            </AccountGlass>
          </div>

          {onOpenEarnings ? (
            <Button
              type="button"
              onClick={onOpenEarnings}
              className="w-full rounded-xl bg-gradient-to-br from-brand-mantis to-brand-emerald font-bold text-brand-forest sm:w-auto"
            >
              <Wallet className="size-4" />
              Earnings & withdraw
            </Button>
          ) : null}

          <ReferralSharePanel referral={referral} />
        </div>
      )}

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold tracking-tight text-brand-forest">Activity</h3>
        <div className="inline-flex rounded-full border border-brand-forest/10 bg-white p-1">
          {(
            [
              { id: "people" as const, label: "Your referrals", count: referred.length },
              {
                id: "leaderboard" as const,
                label: "Leaderboard",
                count: leaderboardQuery.data?.totalParticipants,
              },
            ] as const
          ).map((tab) => {
            const selected = listTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setListTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition",
                  selected
                    ? "bg-brand-forest text-white"
                    : "text-brand-forest/65 hover:text-brand-forest",
                )}
              >
                {tab.label}
                {tab.count != null ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      selected ? "bg-white/15" : "bg-brand-forest/5",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {listTab === "people" ? (
        referredQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading referred members…</p>
        ) : referred.length ? (
          <div className="overflow-hidden rounded-[18px] border border-brand-forest/10 bg-white">
            <ul className="divide-y divide-brand-forest/8">
              {referred.map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-4 py-3.5">
                  <AccountAvatar
                    name={user.name}
                    imageUrl={user.avatarUrl}
                    className="size-10 rounded-full text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-forest">{user.name}</p>
                    <p className="text-[12px] capitalize text-brand-forest/55">
                      {user.role}
                      {user.tier ? ` · ${tierLabel(user.tier)}` : ""} · joined{" "}
                      {formatRelativeTime(user.joinedAt)}
                    </p>
                  </div>
                  {user.isSubscribed ? (
                    <span className="rounded-full border border-brand-emerald/35 bg-brand-emerald/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-emerald">
                      Subscribed
                    </span>
                  ) : (
                    <span className="rounded-full border border-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-forest/45">
                      Joined
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyBlock
            icon={Users}
            title="No referrals yet"
            body="Share your link — when friends join, they appear here."
          />
        )
      ) : leaderboardQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
      ) : leaderboard.length ? (
        <div className="overflow-hidden rounded-[18px] border border-brand-forest/10 bg-white">
          <ul className="divide-y divide-brand-forest/8">
            {leaderboard.map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5",
                  entry.isCurrentUser && "bg-brand-mantis/8",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                    entry.rank <= 3
                      ? "bg-brand-mantis/20 text-brand-forest"
                      : "bg-brand-forest/5 text-brand-forest/70",
                  )}
                >
                  {entry.rank}
                </span>
                <AccountAvatar
                  name={entry.displayName}
                  imageUrl={entry.avatarUrl}
                  className="size-9 rounded-full text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-brand-forest">
                    {entry.displayName}
                    {entry.isCurrentUser ? (
                      <span className="text-brand-mantis"> · You</span>
                    ) : null}
                  </p>
                  <p className="text-[12px] text-brand-forest/55">
                    {entry.referralCount} referral{entry.referralCount === 1 ? "" : "s"}
                  </p>
                </div>
                {entry.rank <= 3 ? <Trophy className="size-4 shrink-0 text-brand-mantis" /> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyBlock
          icon={Trophy}
          title="Leaderboard warming up"
          body="Be among the first referrers on Kattegat."
        />
      )}
    </AccountViewWrap>
  );
}

function MetricCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="bg-white px-4 py-3.5">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </p>
      <div className="mt-1 truncate text-[15px] font-extrabold text-brand-forest">{value}</div>
    </div>
  );
}
