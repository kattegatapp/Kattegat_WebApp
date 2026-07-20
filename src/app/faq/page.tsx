import type { Metadata } from "next";

import { FaqPageContent } from "@/features/marketing/faq-page-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "FAQ | Kattegat",
  description:
    "Answers to common questions about Kattegat for buyers, sellers, and the Dubai hospitality marketplace.",
};

export default function FaqPage() {
  return (
    <MarketingPageShell
      eyebrow="Frequently asked questions"
      title="The useful answers, all in one place."
      description="Learn how the marketplace works for businesses and sellers, how direct booking operates, and what kinds of services belong on Kattegat."
    >
      <FaqPageContent />
    </MarketingPageShell>
  );
}
