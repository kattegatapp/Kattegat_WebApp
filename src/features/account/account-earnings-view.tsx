"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Megaphone,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { CurrencyAmount, DirhamSymbol, MoneyText } from "@/components/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AccountDashboard } from "@/lib/api/account";
import {
  createPayoutRequest,
  fetchAvailableWithdrawalBalance,
  fetchMyPayouts,
  type PayoutStatus,
} from "@/lib/api/account-payouts";
import { fetchAccountReferralSummary } from "@/lib/api/account-referrals";
import {
  aedInputToFils,
  computeWithdrawalMath,
  formatAedFils,
} from "@/lib/wallet-math";
import { cn } from "@/lib/utils";

const MIN_WITHDRAWAL_AED = 100;
const MIN_WITHDRAWAL_FILS = MIN_WITHDRAWAL_AED * 100;
const IBAN_PATTERN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

function payoutStatusLabel(status: PayoutStatus) {
  if (status === "processed") return "Paid";
  if (status === "failed") return "Rejected";
  return "In review";
}

function payoutStatusClass(status: PayoutStatus) {
  if (status === "processed") return "border-brand-mantis/30 bg-brand-mantis/10 text-brand-forest";
  if (status === "failed") return "border-red-200 bg-red-50 text-red-800";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

type AccountEarningsViewProps = {
  dashboard: AccountDashboard;
  onOpenReferrals?: () => void;
  onOpenRecommend?: () => void;
  onOpenSellerTools?: () => void;
};

export function AccountEarningsView({
  dashboard,
  onOpenReferrals,
  onOpenRecommend,
  onOpenSellerTools,
}: AccountEarningsViewProps) {
  const queryClient = useQueryClient();
  const isProSeller =
    dashboard.sellerProfile?.tier === "pro" || dashboard.sellerProfile?.tier === "white_glove";

  const summaryQuery = useQuery({
    queryKey: ["account", "referrals", "summary"],
    queryFn: fetchAccountReferralSummary,
    initialData: dashboard.referral ?? undefined,
  });
  const balanceQuery = useQuery({
    queryKey: ["account", "payouts", "available-balance"],
    queryFn: fetchAvailableWithdrawalBalance,
  });
  const payoutsQuery = useQuery({
    queryKey: ["account", "payouts", "list"],
    queryFn: fetchMyPayouts,
  });

  const [amountAed, setAmountAed] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [memberNote, setMemberNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const withdrawMutation = useMutation({
    mutationFn: createPayoutRequest,
    onSuccess: async () => {
      setFormSuccess("Withdrawal request submitted. We’ll review it before paying out.");
      setFormError(null);
      setAmountAed("");
      setMemberNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["account", "payouts"] }),
        queryClient.invalidateQueries({ queryKey: ["account", "referrals", "summary"] }),
      ]);
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError(error instanceof Error ? error.message : "Could not submit withdrawal request");
    },
  });

  const referral = summaryQuery.data ?? dashboard.referral;
  const payouts = payoutsQuery.data ?? [];
  const reservedFromList = useMemo(
    () =>
      payouts
        .filter((request) => request.status === "pending")
        .reduce((sum, request) => sum + (request.amount ?? 0), 0),
    [payouts],
  );

  const math = useMemo(
    () =>
      computeWithdrawalMath({
        totalEarnedFils: balanceQuery.data?.totalEarnedFils ?? referral?.wallet.totalEarned,
        thisMonthFils: referral?.wallet.thisMonth,
        paidOutFils: balanceQuery.data?.paidOutFils ?? referral?.wallet.paidOut,
        walletPendingFils: balanceQuery.data?.walletPendingFils ?? referral?.wallet.pending,
        reservedFils: balanceQuery.data?.reservedFils ?? reservedFromList,
        availableFils: balanceQuery.data?.availableFils,
        breakdown: referral?.walletBreakdown,
      }),
    [balanceQuery.data, referral, reservedFromList],
  );

  const requestPreviewFils = aedInputToFils(amountAed);
  const canWithdraw = math.availableFils >= MIN_WITHDRAWAL_FILS;

  const sources = useMemo(
    () => [
      {
        id: "referral",
        icon: Users,
        title: "Referrals",
        amount: referral?.walletBreakdown?.referral ?? 0,
        onOpen: onOpenReferrals,
      },
      {
        id: "recommend",
        icon: Megaphone,
        title: "Recommend",
        amount: referral?.walletBreakdown?.recommend ?? 0,
        onOpen: onOpenRecommend,
      },
      {
        id: "invoice",
        icon: BriefcaseBusiness,
        title: "Buyer payments",
        amount: referral?.walletBreakdown?.invoice ?? 0,
        onOpen: isProSeller ? onOpenSellerTools : undefined,
      },
    ],
    [
      isProSeller,
      onOpenRecommend,
      onOpenReferrals,
      onOpenSellerTools,
      referral?.walletBreakdown?.invoice,
      referral?.walletBreakdown?.recommend,
      referral?.walletBreakdown?.referral,
    ],
  );

  function submitWithdraw(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const amountFils = aedInputToFils(amountAed);
    if (amountFils == null) {
      setFormError("Enter a valid amount (up to 2 decimal places)");
      return;
    }
    if (amountFils < MIN_WITHDRAWAL_FILS) {
      setFormError(`Minimum withdrawal is AED ${MIN_WITHDRAWAL_AED}`);
      return;
    }
    if (amountFils > math.availableFils) {
      setFormError(`Amount exceeds available balance of ${formatAedFils(math.availableFils)}`);
      return;
    }
    const normalizedIban = iban.trim().toUpperCase().replace(/\s+/g, "");
    if (!IBAN_PATTERN.test(normalizedIban)) {
      setFormError("Enter a valid IBAN");
      return;
    }
    if (accountHolderName.trim().length < 2 || bankName.trim().length < 2) {
      setFormError("Enter the account holder name and bank name");
      return;
    }

    withdrawMutation.mutate({
      amountFils,
      accountHolderName: accountHolderName.trim(),
      iban: normalizedIban,
      bankName: bankName.trim(),
      memberNote: memberNote.trim() || undefined,
    });
  }

  if (summaryQuery.isPending && !referral) {
    return (
      <AccountViewWrap>
        <AccountViewIntro title="Earnings & withdraw" description="Your wallet and withdrawals." />
        <AccountCardGridSkeleton count={3} columns={1} />
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Earnings & withdraw"
        description="See how you earned, then withdraw from your shared available balance."
      />

      {/* Hero balance */}
      <section className="overflow-hidden rounded-[22px] border border-brand-forest/10 bg-gradient-to-br from-[#F7F9F8] via-white to-brand-mantis/15">
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-forest/55">
            <Wallet className="size-3.5 text-brand-mantis" />
            Available to withdraw
          </p>
          <CurrencyAmount
            fils={math.availableFils}
            size="xl"
            showDecimals
            className="mt-2 text-brand-forest"
            symbolClassName="text-brand-mantis"
          />
          <p className="mt-2 text-[13px] text-brand-forest/55">
            In wallet{" "}
            <CurrencyAmount fils={math.walletPendingFils} size="sm" showDecimals className="inline-flex" />
            {math.reservedFils > 0 ? (
              <>
                {" "}
                − in review{" "}
                <CurrencyAmount fils={math.reservedFils} size="sm" showDecimals className="inline-flex" />
              </>
            ) : null}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px border-t border-brand-forest/8 bg-brand-forest/8">
          <StatCell label="Lifetime" fils={math.totalEarnedFils} />
          <StatCell label="This month" fils={math.thisMonthFils} />
          <StatCell label="Paid out" fils={math.paidOutFils} />
        </div>
      </section>

      {/* Sources */}
      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h3 className="text-base font-extrabold text-brand-forest">How you earned</h3>
          <p className="text-[11px] text-brand-forest/50">Lifetime totals · one shared wallet</p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {sources.map((source) => {
            const Icon = source.icon;
            const body = (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand-mantis/15">
                    <Icon className="size-4 text-brand-mantis" />
                  </span>
                  <span className="text-[13px] font-extrabold text-brand-forest">{source.title}</span>
                  {source.onOpen ? (
                    <ChevronRight className="ml-auto size-4 text-brand-forest/30" />
                  ) : null}
                </div>
                <CurrencyAmount
                  fils={source.amount}
                  size="lg"
                  showDecimals
                  className="mt-3"
                  symbolClassName="text-brand-mantis"
                />
              </>
            );
            if (source.onOpen) {
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={source.onOpen}
                  className="rounded-2xl border border-brand-forest/10 bg-white p-4 text-left transition hover:border-brand-mantis/35 hover:shadow-sm"
                >
                  {body}
                </button>
              );
            }
            return (
              <div
                key={source.id}
                className="rounded-2xl border border-brand-forest/10 bg-white p-4"
              >
                {body}
              </div>
            );
          })}
        </div>
      </section>

      {/* Withdraw form */}
      <section className="mt-5 overflow-hidden rounded-[22px] border border-brand-forest/10 bg-white">
        <div className="border-b border-brand-forest/8 bg-brand-forest/[0.02] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-mantis/15">
              <ArrowDownToLine className="size-5 text-brand-mantis" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-brand-forest">Request a withdrawal</h3>
              <p className="mt-0.5 text-[12px] text-brand-forest/55">
                Minimum{" "}
                <CurrencyAmount fils={MIN_WITHDRAWAL_FILS} size="sm" className="inline-flex" /> ·
                paid by bank transfer after review
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-5 px-5 py-5 sm:px-6 sm:py-6" onSubmit={submitWithdraw}>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <DirhamSymbol size={16} className="text-brand-mantis" />
              </span>
              <Input
                id="withdraw-amount"
                inputMode="decimal"
                placeholder="100.00"
                value={amountAed}
                onChange={(event) => setAmountAed(event.target.value)}
                className="h-12 rounded-xl !border-[1.5px] !border-brand-forest/35 bg-white pl-10 text-base font-bold tabular-nums shadow-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <p className="inline-flex flex-wrap items-center gap-1 text-[11px] text-brand-forest/50">
                Available{" "}
                <CurrencyAmount fils={math.availableFils} size="sm" showDecimals className="inline-flex" />
                {requestPreviewFils != null && requestPreviewFils > 0 ? (
                  <>
                    {" "}
                    · left{" "}
                    <CurrencyAmount
                      fils={Math.max(0, math.availableFils - requestPreviewFils)}
                      size="sm"
                      showDecimals
                      className="inline-flex"
                    />
                  </>
                ) : null}
              </p>
              <button
                type="button"
                disabled={math.availableFils <= 0}
                onClick={() => setAmountAed((math.availableFils / 100).toFixed(2))}
                className="text-[11px] font-bold text-brand-mantis hover:underline disabled:opacity-40"
              >
                Use full balance
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="withdraw-holder">Account holder</Label>
              <Input
                id="withdraw-holder"
                value={accountHolderName}
                onChange={(event) => setAccountHolderName(event.target.value)}
                placeholder="Name on the bank account"
                className="h-11 rounded-xl !border-[1.5px] !border-brand-forest/35 bg-white shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="withdraw-bank">Bank name</Label>
              <Input
                id="withdraw-bank"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="e.g. Emirates NBD"
                className="h-11 rounded-xl !border-[1.5px] !border-brand-forest/35 bg-white shadow-none"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="withdraw-iban">IBAN</Label>
              <Input
                id="withdraw-iban"
                autoCapitalize="characters"
                value={iban}
                onChange={(event) => setIban(event.target.value.toUpperCase())}
                placeholder="AE07 0331 2345 6789 0123 456"
                className="h-11 rounded-xl !border-[1.5px] !border-brand-forest/35 bg-white font-mono text-sm tracking-wide shadow-none"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="withdraw-note">Note (optional)</Label>
              <Textarea
                id="withdraw-note"
                rows={2}
                value={memberNote}
                onChange={(event) => setMemberNote(event.target.value)}
                placeholder="Anything the team should know"
                className="rounded-xl !border-[1.5px] !border-brand-forest/35 bg-white shadow-none"
              />
            </div>
          </div>

          {formError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              <MoneyText>{formError}</MoneyText>
            </p>
          ) : null}
          {formSuccess ? (
            <p className="rounded-xl border border-brand-mantis/30 bg-brand-mantis/10 px-3 py-2 text-sm font-semibold text-brand-forest">
              {formSuccess}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={withdrawMutation.isPending || !canWithdraw}
            className="h-12 w-full rounded-xl bg-gradient-to-br from-brand-mantis to-brand-emerald text-sm font-extrabold text-brand-forest sm:w-auto sm:min-w-[220px]"
          >
            {withdrawMutation.isPending ? (
              <>
                <Spinner className="size-4" />
                Submitting…
              </>
            ) : (
              "Submit withdrawal request"
            )}
          </Button>
          {!canWithdraw ? (
            <p className="text-[12px] text-brand-forest/50">
              You need at least{" "}
              <CurrencyAmount fils={MIN_WITHDRAWAL_FILS} size="sm" className="inline-flex" />{" "}
              available to request a withdrawal.
            </p>
          ) : null}
        </form>
      </section>

      {/* History */}
      <section className="mt-5">
        <h3 className="text-base font-extrabold text-brand-forest">Withdrawal history</h3>
        {payoutsQuery.isPending ? (
          <div className="mt-3">
            <AccountCardGridSkeleton count={2} columns={1} />
          </div>
        ) : payouts.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-brand-forest/15 bg-brand-forest/[0.02] px-4 py-8 text-center text-[13px] text-brand-forest/55">
            No requests yet. Submitted withdrawals will appear here.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {payouts.map((request) => (
              <li key={request.id}>
                <AccountListCard className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <CurrencyAmount fils={request.amount} size="md" showDecimals />
                    <p className="mt-0.5 text-[12px] text-brand-forest/55">
                      {new Date(request.requestedAt).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {request.bankName ? ` · ${request.bankName}` : ""}
                    </p>
                    {request.status === "failed" && request.adminNote ? (
                      <p className="mt-1 text-[12px] text-brand-forest/70">{request.adminNote}</p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
                      payoutStatusClass(request.status),
                    )}
                  >
                    {request.status === "processed" ? (
                      <Check className="size-3" />
                    ) : (
                      <Clock3 className="size-3" />
                    )}
                    {payoutStatusLabel(request.status)}
                  </span>
                </AccountListCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountViewWrap>
  );
}

function StatCell({ label, fils }: { label: string; fils: number }) {
  return (
    <div className="bg-white px-3 py-3.5 sm:px-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <CurrencyAmount
        fils={fils}
        size="sm"
        showDecimals
        className="mt-1"
        symbolClassName="text-brand-mantis"
      />
    </div>
  );
}
