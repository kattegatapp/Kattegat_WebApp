import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { getPublicSeller } from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import { getSiteOrigin, jsonLdScript } from "@/lib/seo";

type PageProps = {
  params: Promise<{ sellerId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sellerId } = await params;
  const [seller, origin] = await Promise.all([getPublicSeller(sellerId), getSiteOrigin()]);
  if (!seller) {
    return { title: "Seller not found | Kattegat", robots: { index: false } };
  }

  const name = seller.displayName || "Kattegat seller";
  const description =
    seller.bio?.slice(0, 160) ||
    `${name} on Kattegat — Dubai events and hospitality talent marketplace.`;

  return {
    title: `${name} | Kattegat`,
    description,
    alternates: { canonical: `${origin}/seller/${seller.userId}` },
    openGraph: {
      title: name,
      description,
      url: `${origin}/seller/${seller.userId}`,
      images: seller.avatarUrl ? [{ url: seller.avatarUrl }] : undefined,
    },
  };
}

export default async function SellerPage({ params }: PageProps) {
  const { sellerId } = await params;
  const [settings, seller, origin] = await Promise.all([
    getPublicAppSettings(),
    getPublicSeller(sellerId),
    getSiteOrigin(),
  ]);

  if (!seller) notFound();

  const name = seller.displayName || "Kattegat seller";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: seller.bio,
    url: `${origin}/seller/${seller.userId}`,
    image: seller.avatarUrl || undefined,
    aggregateRating:
      seller.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: seller.aggregateRating,
            reviewCount: seller.reviewCount,
          }
        : undefined,
  };

  return (
    <main className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader
            brandName={settings.brand.siteName}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="size-20 overflow-hidden rounded-2xl bg-[#EEF2F0] sm:size-24">
              {seller.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar
                <img src={seller.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-extrabold text-brand-forest/30">
                  KG
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
                Seller profile
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                {name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-brand-forest/55">
                {seller.tier ? (
                  <span className="rounded-full bg-brand-mantis/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-forest">
                    {seller.tier === "white_glove" ? "White Glove" : seller.tier}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                  {seller.aggregateRating > 0 ? seller.aggregateRating.toFixed(1) : "New"}
                  {seller.reviewCount > 0 ? ` · ${seller.reviewCount}` : ""}
                </span>
              </div>
            </div>
          </div>

          <ContinueInApp
            title="Download the app to continue"
            description={`Open Kattegat to view ${name}'s full profile, message them, and book directly.`}
            deepLinkPath={`/seller/${seller.userId}`}
            webOrigin={origin}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
        </div>

        <p className="mt-8 max-w-3xl text-base leading-8 text-brand-forest/65">
          {seller.bio ||
            `${name} is live on Kattegat. Continue in the app for portfolio details, chat, and booking.`}
        </p>

        {seller.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {seller.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand-forest/10 bg-white px-3 py-1 text-xs font-bold text-brand-forest/70"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {seller.listings && seller.listings.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Services</h2>
            <ul className="mt-4 divide-y divide-brand-forest/10 border-y border-brand-forest/10">
              {seller.listings.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="flex items-center justify-between gap-4 py-4 text-sm font-extrabold hover:text-brand-blue"
                  >
                    {listing.title}
                    <span className="text-xs font-bold text-brand-forest/45">View</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <SiteFooter
        brandName={settings.brand.siteName}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
