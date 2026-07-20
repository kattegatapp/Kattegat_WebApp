import type { Metadata } from "next";

import { AboutPageContent } from "@/features/marketing/about-page-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "About | Kattegat",
  description:
    "Kattegat is a Dubai-built marketplace connecting venues, planners, and specialist sellers directly — without commission on bookings.",
};

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="About Kattegat"
      title="Built for the people who make hospitality happen."
      description="Kattegat is a Dubai-built marketplace connecting businesses and specialist sellers directly — without an agency sitting between the brief and the work."
    >
      <AboutPageContent />
    </MarketingPageShell>
  );
}
