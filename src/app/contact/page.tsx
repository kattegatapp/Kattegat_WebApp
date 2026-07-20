import type { Metadata } from "next";

import { ContactPageContent } from "@/features/marketing/contact-page-content";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Contact | Kattegat",
  description:
    "Contact Kattegat for marketplace, partnership, and support enquiries in Dubai.",
};

export default async function ContactPage() {
  const settings = await getPublicAppSettings();

  return (
    <MarketingPageShell
      eyebrow="Contact us"
      title="Let's start a useful conversation."
      description="Questions about joining, finding the right seller, partnerships, or platform support? Send a note and the right person will respond."
    >
      <ContactPageContent
        supportEmail={settings.brand.supportEmail}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </MarketingPageShell>
  );
}
