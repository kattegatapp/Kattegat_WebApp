import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import {
  getCatalogCategories,
  getPublicListing,
  getPublicListingMedia,
  getPublicSeller,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import { getSiteOrigin, jsonLdScript } from "@/lib/seo";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingId } = await params;
  const [listing, origin] = await Promise.all([getPublicListing(listingId), getSiteOrigin()]);
  if (!listing) {
    return { title: "Listing not found | Kattegat", robots: { index: false } };
  }

  const description =
    listing.description?.slice(0, 160) ||
    `${listing.title} on Kattegat — Dubai events and hospitality talent marketplace.`;

  return {
    title: `${listing.title} | Kattegat`,
    description,
    alternates: { canonical: `${origin}/listing/${listing.id}` },
    openGraph: {
      title: listing.title,
      description,
      url: `${origin}/listing/${listing.id}`,
      type: "website",
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { listingId } = await params;
  const [settings, listing, media, categories] = await Promise.all([
    getPublicAppSettings(),
    getPublicListing(listingId),
    getPublicListingMedia(listingId),
    getCatalogCategories(),
  ]);

  if (!listing) notFound();

  const [seller, origin] = await Promise.all([
    getPublicSeller(listing.sellerId),
    getSiteOrigin(),
  ]);

  const category = categories.find((item) => item.id === listing.categoryId);
  const cover = media[0] || seller?.avatarUrl || null;
  const sellerName = seller?.displayName || "Kattegat seller";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: listing.title,
    description: listing.description,
    url: `${origin}/listing/${listing.id}`,
    areaServed: listing.location || "Dubai, UAE",
    provider: {
      "@type": "Person",
      name: sellerName,
      url: `${origin}/seller/${listing.sellerId}`,
    },
    aggregateRating:
      listing.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: listing.aggregateRating,
            reviewCount: listing.reviewCount,
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
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          {category?.name || "Service listing"}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          {listing.title}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[1.75rem] bg-[#EEF2F0]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote listing media
              <img src={cover} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm font-extrabold text-brand-forest/30">
                Kattegat
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6">
              <p className="text-sm font-extrabold">{sellerName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-brand-forest/55">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                  {listing.aggregateRating > 0 ? listing.aggregateRating.toFixed(1) : "New"}
                  {listing.reviewCount > 0 ? ` · ${listing.reviewCount} reviews` : ""}
                </span>
                {listing.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {listing.location}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-brand-forest/65">
                {listing.description ||
                  "This live listing is available on Kattegat. Continue in the app to message the seller and book directly."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ContinueInApp
                  title="Download the app to continue"
                  description={`Open Kattegat to view “${listing.title}” by ${sellerName}, message the seller, and book directly.`}
                  deepLinkPath={`/listing/${listing.id}`}
                  webOrigin={origin}
                  appStoreUrl={settings.links.appStoreUrl}
                  playStoreUrl={settings.links.playStoreUrl}
                  mobileAppUrl={settings.links.mobileAppUrl}
                />
                <Link
                  href={`/seller/${listing.sellerId}`}
                  className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
                >
                  View seller
                </Link>
              </div>
            </div>

            {category ? (
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex text-sm font-extrabold text-brand-blue hover:underline"
              >
                More in {category.name}
              </Link>
            ) : (
              <Link href="/search" className="inline-flex text-sm font-extrabold text-brand-blue hover:underline">
                Back to search
              </Link>
            )}
          </div>
        </div>
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
