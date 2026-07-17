import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/features/marketing/contact-form";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Support | Kattegat",
  description: "Contact Kattegat support for help with the app or your account.",
};

export default async function SupportPage() {
  const settings = await getPublicAppSettings();
  const supportEmail = settings.brand.supportEmail;

  return (
    <main className="min-h-screen bg-[#f6f7f2] px-4 py-5 text-brand-forest sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Kattegat home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-4">
            <Image
              src="/brand/logo/logo-horizontal-alternative.png"
              alt="Kattegat"
              width={180}
              height={56}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
            Back home
          </Link>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">Support</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">How can we help?</h1>
          <p className="mt-4 max-w-xl leading-7 text-brand-forest/65">
            Send us a short message and we’ll reply within one business day. You can also email{" "}
            <a href={`mailto:${supportEmail}`} className="font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
              {supportEmail}
            </a>
            .
          </p>
          <div className="mt-8">
            <ContactForm supportEmail={supportEmail} />
          </div>
        </section>
      </div>
    </main>
  );
}
