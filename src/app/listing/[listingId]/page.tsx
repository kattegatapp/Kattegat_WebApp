import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { DUBAI_SEO_PAGES } from "@/features/marketing/local-seo";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import {
  getCatalogCategories,
  getPublicListing,
  getPublicListingMedia,
  getPublicSeller,
  searchListings,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import {
  getSiteOrigin,
  jsonLdScript,
  listingPageDescription,
  listingPageTitle,
  locationLabel,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

function relatedDubaiPath(categoryName?: string | null) {
  if (!categoryName) return "/dubai";
  const normalized = categoryName.toLowerCase();
  const match = DUBAI_SEO_PAGES.find(
    (page) =>
      normalized.includes(page.name.toLowerCase()) ||
      page.categoryQuery.toLowerCase() === normalized ||
      normalized.includes(page.searchQuery.toLowerCase()),
  );
  return match ? `/dubai/${match.slug}` : "/dubai";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingId } = await params;
  const [listing, origin, categories] = await Promise.all([
    getPublicListing(listingId),
    getSiteOrigin(),
    getCatalogCategories(),
  ]);
  if (!listing) {
    return { title: "Listing not found | Kattegat", robots: { index: false } };
  }

  const seller = await getPublicSeller(listing.sellerId);
  const category = categories.find((item) => item.id === listing.categoryId);
  const sellerName = seller?.displayName || null;
  const title = listingPageTitle({
    title: listing.title,
    categoryName: category?.name,
    location: listing.location,
    sellerName,
  });
  const description = listingPageDescription({
    title: listing.title,
    description: listing.description,
    categoryName: category?.name,
    location: listing.location,
    sellerName,
  });

  return {
    title,
    description,
    alternates: { canonical: `${origin}/listing/${listing.id}` },
    openGraph: {
      title,
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

  const [seller, origin, related] = await Promise.all([
    getPublicSeller(listing.sellerId),
    getSiteOrigin(),
    searchListings({
      categoryId: listing.categoryId,
      pageSize: 8,
      sort: "recommended",
    }),
  ]);

  const category = categories.find((item) => item.id === listing.categoryId);
  const cover = media[0] || seller?.avatarUrl || null;
  const sellerName = seller?.displayName || "Kattegat seller";
  const place = locationLabel(listing.location);
  const dubaiHref = relatedDubaiPath(category?.name);
  const relatedListings = related.items
    .filter((item) => item.id !== listing.id)
    .slice(0, 4);
  const relatedSellers = [
    ...new Map(
      related.items
        .filter((item) => item.sellerId !== listing.sellerId)
        .map((item) => [item.sellerId, item]),
    ).values(),
  ].slice(0, 4);

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
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-forest/45">
          <Link href="/" className="hover:text-brand-blue">
            Home
          </Link>
          <span>/</span>
          {category ? (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-brand-blue">
                {category.name}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-brand-forest/70 line-clamp-1">{listing.title}</span>
        </nav>

        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          {category?.name || "Service listing"} · {place}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          {listing.title}
        </h1>
        <p className="mt-3 text-base font-semibold text-brand-forest/55">
          {category?.name || "Service"} in {place} by {sellerName}
        </p>

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
              <Link
                href={`/seller/${listing.sellerId}`}
                className="text-sm font-extrabold hover:text-brand-blue"
              >
                {sellerName}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-brand-forest/55">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                  {listing.aggregateRating > 0 ? listing.aggregateRating.toFixed(1) : "New"}
                  {listing.reviewCount > 0 ? ` · ${listing.reviewCount} reviews` : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {place}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-brand-forest/65">
                {listing.description ||
                  `${listing.title} is a live ${category?.name?.toLowerCase() || "marketplace"} listing in ${place} on Kattegat. Continue in the app to message ${sellerName} and book directly — with 0% booking commission.`}
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

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-extrabold">
              {category ? (
                <Link href={`/category/${category.slug}`} className="text-brand-blue hover:underline">
                  More in {category.name}
                </Link>
              ) : null}
              <Link href={dubaiHref} className="text-brand-blue hover:underline">
                {category?.name || "Services"} in Dubai
              </Link>
              <Link href="/search" className="text-brand-blue hover:underline">
                Search all
              </Link>
            </div>
          </div>
        </div>

        {relatedListings.length > 0 ? (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                  Related
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                  More {category?.name?.toLowerCase() || "services"} near {place}
                </h2>
              </div>
              {category ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm font-extrabold text-brand-blue hover:underline"
                >
                  View category
                </Link>
              ) : null}
            </div>
            <ul className="mt-6 divide-y divide-brand-forest/10 border-y border-brand-forest/10">
              {relatedListings.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/listing/${item.id}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-extrabold group-hover:text-brand-blue">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-bold text-brand-forest/50">
                        {item.sellerName}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-brand-forest/35 group-hover:text-brand-blue" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedSellers.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Related sellers</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {relatedSellers.map((item) => (
                <li key={item.sellerId}>
                  <Link
                    href={`/seller/${item.sellerId}`}
                    className="flex items-center gap-3 rounded-2xl border border-brand-forest/10 bg-white px-4 py-3 transition hover:border-brand-mantis/40"
                  >
                    <div className="size-12 overflow-hidden rounded-xl bg-[#EEF2F0]">
                      {item.sellerAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote avatar
                        <img src={item.sellerAvatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] font-extrabold text-brand-forest/30">
                          KG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{item.sellerName}</p>
                      <p className="truncate text-xs font-bold text-brand-forest/50">{item.title}</p>
                    </div>
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
        mobileAppUrl={settings.links.mobileAppUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
