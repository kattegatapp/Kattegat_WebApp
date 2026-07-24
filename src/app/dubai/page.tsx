import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  DUBAI_SEO_PAGES,
  dubaiPageDescription,
} from "@/features/marketing/local-seo";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { getPublicAppSettings } from "@/lib/api/settings";
import { getSiteOrigin, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dubai talent & services | Kattegat",
  description:
    "Browse Dubai DJs, hosts, event management, restaurant consultancy, and more on Kattegat — the direct marketplace for hospitality and events.",
};

export default async function DubaiHubPage() {
  const [settings, origin] = await Promise.all([getPublicAppSettings(), getSiteOrigin()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Dubai talent & services on Kattegat",
    url: `${origin}/dubai`,
    about: "Dubai events and hospitality marketplace categories",
  };

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          Dubai marketplace
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          Find talent & services in Dubai
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-brand-forest/60">
          Local landing pages for the searches Dubai venues and event teams actually make —
          then continue in the Kattegat app to message and book.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DUBAI_SEO_PAGES.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/dubai/${page.slug}`}
                className="group flex h-full flex-col rounded-[1.5rem] border border-brand-forest/10 bg-white p-5 transition hover:border-brand-mantis/40 hover:shadow-[0_16px_40px_rgb(0_57_18/0.08)]"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                  Dubai
                </p>
                <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] group-hover:text-brand-blue">
                  {page.headline}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-brand-forest/60">
                  {dubaiPageDescription(page)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-forest/70 group-hover:text-brand-blue">
                  View listings <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex min-h-12 items-center rounded-2xl bg-brand-forest px-5 text-sm font-extrabold text-white"
          >
            Open search
          </Link>
          <Link
            href="/services"
            className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
          >
            All categories
          </Link>
        </div>
      </section>

      <SiteFooter
        brandName={settings.brand.siteName}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        mobileAppUrl={settings.links.mobileAppUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
