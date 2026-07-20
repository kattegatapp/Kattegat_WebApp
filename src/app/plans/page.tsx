import type { Metadata } from "next";

import { PlansPageContent } from "@/features/marketing/plans-page-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { getPublicPlanFeatures } from "@/lib/api/plans";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Seller Plans | Kattegat",
  description:
    "Compare Kattegat seller plans — Starter, Pro, and White Glove. No booking commission. Keep what you earn.",
};

export default async function PlansPage() {
  const [plans, settings] = await Promise.all([
    getPublicPlanFeatures(),
    getPublicAppSettings(),
  ]);

  return (
    <MarketingPageShell
      eyebrow="For sellers"
      title="Plans built for hospitality professionals."
      description="Start free, upgrade when you need stronger discovery and direct buyer conversations — without giving up a cut of your bookings."
    >
      <PlansPageContent
        plans={plans}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
      />
    </MarketingPageShell>
  );
}
