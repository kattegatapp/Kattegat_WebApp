import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageSquare } from "lucide-react";

import { ContactForm } from "@/features/marketing/contact-form";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Contact | Kattegat",
  description:
    "Contact Kattegat for marketplace, partnership, and support enquiries.",
};

export default async function ContactPage() {
  const settings = await getPublicAppSettings();
  const email = settings.brand.supportEmail;

  return (
    <MarketingPageShell
      eyebrow="Contact us"
      title="Let’s start a useful conversation."
      description="Questions about joining, finding the right provider, partnerships, or platform support? Send a note and the right person will respond."
    >
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.2fr]">
        <div className="space-y-4">
          {(
            [
              [Mail, "Email", email],
              [MapPin, "Based in", "Dubai, United Arab Emirates"],
              [Clock3, "Response time", "Usually within one business day"],
              [
                MessageSquare,
                "Best for",
                "Hiring help, provider onboarding, partnerships, and support",
              ],
            ] as const
          ).map(([Icon, label, value]) => (
            <div key={label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgb(0_57_18/0.05)]">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-mantis/20">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                  {label}
                </p>
                <p className="mt-1 font-bold leading-6">{value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-[1.75rem] bg-brand-forest p-7 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Prefer email directly?
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              You can also write to us at{" "}
              <a
                href={`mailto:${email}`}
                className="font-extrabold text-brand-mantis hover:text-white"
              >
                {email}
              </a>
              . Include your company or service and the best way to reach you.
            </p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
            Contact form
          </p>
          <ContactForm supportEmail={email} />
        </div>
      </section>
    </MarketingPageShell>
  );
}
