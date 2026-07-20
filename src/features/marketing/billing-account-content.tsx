"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatFilsAsAed } from "@/lib/admin/money";
import { fetchBillingHistory, fetchBillingMe, type BillingUser } from "@/lib/api/billing";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  succeeded: "bg-brand-mantis/15 text-brand-forest",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-amber-100 text-amber-900",
  disputed: "bg-violet-100 text-violet-800",
} as const;

export function BillingAccountContent() {
  const [user, setUser] = useState<BillingUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchBillingMe().then((me) => {
      if (active) {
        setUser(me);
        setLoadingSession(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const historyQuery = useQuery({
    queryKey: ["billing", "history"],
    queryFn: fetchBillingHistory,
    enabled: Boolean(user?.sid),
    retry: false,
  });

  if (loadingSession) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-brand-forest/55">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading your billing account…
      </div>
    );
  }

  if (!user?.sid) {
    return (
      <div className="mx-auto max-w-xl rounded-[1.75rem] border border-brand-forest/10 bg-white p-8 text-center shadow-[0_18px_50px_rgb(0_57_18/0.08)]">
        <CreditCard className="mx-auto size-8 text-brand-blue" />
        <h2 className="mt-4 text-xl font-extrabold">Sign in to view billing</h2>
        <p className="mt-2 text-sm leading-7 text-brand-forest/60">
          Use your Kattegat seller account to see payment history and manage Pro.
        </p>
        <Link
          href="/plans/checkout"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-forest px-5 text-sm font-extrabold text-white hover:bg-brand-blue"
        >
          Go to checkout sign-in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-7">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
          Billing account
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
          {user.businessName || user.username || "Seller account"}
        </h2>
        <p className="mt-1 text-sm text-brand-forest/55">{user.email}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/plans/checkout"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
          >
            Manage Pro plan
          </Link>
          <Link
            href="/plans"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-forest/12 px-5 text-sm font-extrabold hover:border-brand-mantis/50"
          >
            View plans
          </Link>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Receipt className="size-4" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold">Payment history</h3>
            <p className="text-sm text-brand-forest/55">Receipts from your Kattegat Pro subscriptions.</p>
          </div>
        </div>

        {historyQuery.isPending ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-brand-forest/55">
            <Loader2 className="size-4 animate-spin" />
            Loading payment history…
          </div>
        ) : null}

        {historyQuery.data && historyQuery.data.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-brand-forest/60">
            No payments recorded yet. Upgrade to Pro and your receipts will appear here after Stripe
            confirms payment.
          </p>
        ) : null}

        {historyQuery.data && historyQuery.data.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {historyQuery.data.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] px-4 py-3"
              >
                <div>
                  <p className="font-extrabold text-brand-forest">{payment.description}</p>
                  <p className="text-xs text-brand-forest/50">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-forest">{formatFilsAsAed(payment.amount)}</p>
                  <span
                    className={cn(
                      "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]",
                      STATUS_STYLES[payment.status],
                    )}
                  >
                    {payment.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Link
        href="/plans"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-brand-blue hover:text-brand-forest"
      >
        <ArrowLeft className="size-4" />
        Back to plans
      </Link>
    </div>
  );
}
