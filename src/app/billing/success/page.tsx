import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Payment successful | Kattegat",
  description: "Your Kattegat Pro subscription is active.",
};

export default function BillingSuccessPage() {
  return (
    <MarketingPageShell
      eyebrow="Payment complete"
      title="Welcome to Kattegat Pro."
      description="Your subscription is active. Open the Kattegat app to start using your upgraded seller tools."
    >
      <section className="marketing-section-content marketing-container py-14 sm:py-20">
        <div className="mx-auto max-w-xl rounded-[1.75rem] border border-brand-mantis/30 bg-white p-8 text-center shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
            <CheckCircle2 className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">You&apos;re on Pro</h2>
          <p className="mt-3 text-sm leading-7 text-brand-forest/65">
            Your payment was received. Pro features may take a minute to appear across your account.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/download"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
            >
              <Download className="size-4" />
              Get the app
            </Link>
            <Link
              href="/billing"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-brand-forest/12 px-5 text-sm font-extrabold hover:border-brand-mantis/50"
            >
              View billing
            </Link>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
