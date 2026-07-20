import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlansCheckoutContent } from "@/features/marketing/plans-checkout-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { getPublicPlanFeatures } from "@/lib/api/plans";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Checkout | Kattegat Pro",
  description: "Upgrade to Kattegat Pro with secure Stripe checkout.",
};

export default async function PlansCheckoutPage() {
  const [plans, settings] = await Promise.all([getPublicPlanFeatures(), getPublicAppSettings()]);
  const proPlan = plans.find((plan) => plan.tier === "pro");

  if (!proPlan) {
    notFound();
  }

  return (
    <MarketingPageShell
      eyebrow="Checkout"
      title="Complete your Pro upgrade."
      description="Sign in with your Kattegat seller account, then pay securely on the web via Stripe."
    >
      <PlansCheckoutContent plan={proPlan} paymentsEnabled={settings.features.paymentsEnabled} />
    </MarketingPageShell>
  );
}
