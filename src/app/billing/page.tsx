import type { Metadata } from "next";

import { BillingAccountContent } from "@/features/marketing/billing-account-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Billing | Kattegat",
  description: "View your Kattegat Pro payment history and manage your subscription.",
};

export default function BillingAccountPage() {
  return (
    <MarketingPageShell
      eyebrow="Billing"
      title="Your billing account."
      description="Payment history and Pro subscription management on the web."
    >
      <section className="marketing-section-content marketing-container py-10 sm:py-14">
        <BillingAccountContent />
      </section>
    </MarketingPageShell>
  );
}
