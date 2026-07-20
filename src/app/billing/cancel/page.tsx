import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Checkout cancelled | Kattegat",
  description: "Your Kattegat checkout was cancelled.",
};

export default function BillingCancelPage() {
  return (
    <MarketingPageShell
      eyebrow="Checkout cancelled"
      title="No payment was taken."
      description="You can return to plans whenever you're ready to upgrade."
    >
      <section className="marketing-section-content marketing-container py-14 sm:py-20">
        <div className="mx-auto max-w-xl rounded-[1.75rem] border border-brand-forest/10 bg-white p-8 text-center shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-10">
          <CreditCard className="mx-auto size-8 text-brand-blue" />
          <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">Checkout cancelled</h2>
          <p className="mt-3 text-sm leading-7 text-brand-forest/65">
            Your card was not charged. You can try again or contact us if you need help choosing a plan.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/plans/checkout"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Return to checkout
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-brand-forest/12 px-5 text-sm font-extrabold hover:border-brand-mantis/50"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
