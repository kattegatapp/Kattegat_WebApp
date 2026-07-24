import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { ListingContactPanel } from "@/features/marketing/listing-contact-panel";
import { DUBAI_SEO_PAGES } from "@/features/marketing/local-seo";
import { ManagedListingBadge } from "@/features/marketing/managed-listing-badge";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { loadAccountDashboard } from "@/lib/api/account";
import { cloudinaryCrop } from "@/lib/cloudinary";
import {
  getCatalogCategories,
  getPublicListing,
  getPublicListingMediaItems,
  getPublicSeller,
  searchListings,
} from "@/lib/api/marketing";
import { getListingFieldSchema } from "@/lib/api/catalog";
import { DEFAULT_PUBLIC_PLANS, getPublicPlanFeatures } from "@/lib/api/plans";
import { getPublicAppSettings } from "@/lib/api/settings";
import {
  decodePublicRouteParam,
  listingPublicPath,
  sellerPublicPath,
  shouldRedirectTitledPublicPath,
} from "@/lib/navigation/public-paths";
import {
  getSiteOrigin,
  jsonLdScript,
  listingPageDescription,
  listingPageTitle,
  locationLabel,
} from "@/lib/seo";
import {
  formatListingDisplayPrice,
  formatPricingBlockSnapshot,
} from "@/lib/pricing-blocks";
import { MoneyText } from "@/components/currency";
import {
  parseVimeoId,
  parseYouTubeId,
  schemaFieldLinkUrl,
  vimeoEmbedUrl,
  youTubeEmbedUrl,
} from "@/lib/utils/video-link";

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
  const { listingId: listingKey } = await params;
  const listingId = decodePublicRouteParam(listingKey);
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

  const canonicalPath = listingPublicPath({ id: listing.id, title: listing.title });

  return {
    title,
    description,
    alternates: { canonical: `${origin}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${origin}${canonicalPath}`,
      type: "website",
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { listingId: listingKey } = await params;
  const listingId = decodePublicRouteParam(listingKey);
  const [settings, listing, mediaItems, categories, plans, dashboard] = await Promise.all([
    getPublicAppSettings(),
    getPublicListing(listingId),
    getPublicListingMediaItems(listingId),
    getCatalogCategories(),
    getPublicPlanFeatures(),
    loadAccountDashboard(),
  ]);

  if (!listing) notFound();

  if (shouldRedirectTitledPublicPath(listingKey, { id: listing.id, title: listing.title })) {
    redirect(listingPublicPath({ id: listing.id, title: listing.title }));
  }

  const publicPath = listingPublicPath({ id: listing.id, title: listing.title });
  const fieldSchema = await getListingFieldSchema(listing.categoryId);

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
  const photoUrls = mediaItems.filter((item) => item.type === "photo").map((item) => item.url);
  const videoLinks = mediaItems.filter((item) => item.type === "video_link");
  const cover = photoUrls[0] || seller?.avatarUrl || null;
  const sellerName = seller?.displayName || "Kattegat seller";
  const sellerPath = seller
    ? sellerPublicPath({
        userId: seller.userId,
        customSlug: seller.customSlug,
        displayName: seller.displayName,
      })
    : sellerPublicPath({
        userId: listing.sellerId,
        displayName: sellerName,
      });
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

  const fieldDefByKey = new Map(fieldSchema.fields.map((field) => [field.key, field]));
  const detailEntries = Object.entries(listing.schemaFields)
    .map(([key, value]) => {
      const definition = fieldDefByKey.get(key);
      const label = definition?.label ?? key.replaceAll("_", " ");
      const text =
        typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : Array.isArray(value)
            ? value.map(String).join(", ")
            : value == null
              ? ""
              : String(value);
      const trimmed = text.trim();
      if (!trimmed) return null;
      // Legacy free-text rate notes — superseded by Pricing Blocks (per_gig / residency).
      if (key === "rate_structure") return null;
      const href = schemaFieldLinkUrl({
        key,
        label,
        type: definition?.type,
        value: trimmed,
      });
      return { key, label, value: trimmed, href };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const schemaVideoLinks = detailEntries
    .filter((entry) => entry.href)
    .map((entry) => ({ id: entry.key, url: entry.href!, label: entry.label }));
  const allVideos = [
    ...videoLinks.map((item) => ({ id: item.id, url: item.url, label: "Video" })),
    ...schemaVideoLinks.filter(
      (item) => !videoLinks.some((video) => video.url === item.url),
    ),
  ];

  const sellerTier = seller?.tier ?? "starter";
  const tierFeatures =
    plans.find((plan) => plan.tier === sellerTier) ??
    DEFAULT_PUBLIC_PLANS.find((plan) => plan.tier === sellerTier) ??
    DEFAULT_PUBLIC_PLANS[0]!;
  const canChatDirectly =
    Boolean(settings.features.chatEnabled) &&
    (Boolean(settings.features.freeAccessMode) || Boolean(tierFeatures.canChatDirectly));
  const contactAgentEnabled =
    Boolean(settings.features.contactAgentEnabled) && Boolean(settings.features.chatEnabled);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: listing.title,
    description: listing.description,
    url: `${origin}${publicPath}`,
    areaServed: listing.location || "Dubai, UAE",
    provider: {
      "@type": "Person",
      name: sellerName,
      url: `${origin}${sellerPath}`,
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
        <MoneyText className="mt-4 inline-flex rounded-full bg-brand-mantis/15 px-3.5 py-1.5 text-sm font-extrabold text-brand-forest">
          {formatListingDisplayPrice(listing)}
        </MoneyText>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[1.75rem] bg-[#EEF2F0]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote listing media
              <img src={cloudinaryCrop(cover, "4:3", "auto")} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm font-extrabold text-brand-forest/30">
                Kattegat
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6">
              <Link
                href={sellerPath}
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
                  `${listing.title} is a live ${category?.name?.toLowerCase() || "marketplace"} listing in ${place} on Kattegat. Message ${sellerName} to book directly — with 0% booking commission.`}
              </p>

              {sellerTier === "white_glove" ? (
                <div className="mt-5">
                  <ManagedListingBadge managedBy={seller?.managedBy ?? null} managedAgent={seller?.managedAgent ?? null} />
                </div>
              ) : null}

              {listing.pricingBlocks.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-brand-forest/10 bg-brand-forest/[0.03] p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-forest/55">
                    Service snapshot · Pricing
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {listing.pricingBlocks
                      .slice()
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((block, index) => {
                        const row = formatPricingBlockSnapshot(block);
                        return (
                          <li
                            key={`${block.modelType}-${index}`}
                            className="flex items-start justify-between gap-3 text-sm"
                          >
                            <span className="font-semibold text-brand-forest/70">{row.label}</span>
                            <MoneyText className="text-right font-extrabold text-brand-forest">
                              {row.value}
                            </MoneyText>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <ListingContactPanel
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerId={listing.sellerId}
                  sellerName={sellerName}
                  sellerUserId={seller?.userId ?? listing.sellerId}
                  canChatDirectly={canChatDirectly}
                  contactAgentEnabled={contactAgentEnabled}
                  viewer={{
                    signedIn: Boolean(dashboard),
                    userId: dashboard?.user.id ?? null,
                    hasBuyerId: Boolean(dashboard?.user.bid),
                    hasSellerId: Boolean(dashboard?.user.sid),
                  }}
                  publicPath={publicPath}
                  deepLinkPath={`/listing/${listing.id}`}
                  webOrigin={origin}
                  appStoreUrl={settings.links.appStoreUrl}
                  playStoreUrl={settings.links.playStoreUrl}
                  mobileAppUrl={settings.links.mobileAppUrl}
                />
                <Link
                  href={sellerPath}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold sm:w-auto"
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

        {detailEntries.length > 0 ? (
          <section className="mt-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
              Details
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
              Useful things to know
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {detailEntries.map((entry) => (
                <li
                  key={entry.key}
                  className="rounded-2xl border border-brand-forest/10 bg-white px-4 py-3.5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-forest/45">
                    {entry.label}
                  </p>
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-sm font-extrabold text-brand-mantis underline-offset-2 hover:underline"
                    >
                      Open link
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-brand-forest">{entry.value}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {allVideos.length > 0 ? (
          <section className="mt-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
              Video
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
              Preview the service
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {allVideos.map((item) => {
                const youTubeId = parseYouTubeId(item.url);
                const vimeoId = parseVimeoId(item.url);
                const embedSrc = youTubeId
                  ? `${youTubeEmbedUrl(youTubeId)}?rel=0&modestbranding=1`
                  : vimeoId
                    ? vimeoEmbedUrl(vimeoId)
                    : null;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-brand-forest/10 bg-brand-forest"
                  >
                    {embedSrc ? (
                      <iframe
                        src={embedSrc}
                        title={item.label}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex aspect-video items-center justify-center px-4 text-center text-sm font-extrabold text-white underline-offset-2 hover:underline"
                      >
                        Open {item.label.toLowerCase()}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

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
                    href={listingPublicPath({ id: item.id, title: item.title })}
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
                    href={sellerPublicPath({
                      userId: item.sellerId,
                      customSlug: item.sellerCustomSlug,
                      displayName: item.sellerName,
                    })}
                    className="flex items-center gap-3 rounded-2xl border border-brand-forest/10 bg-white px-4 py-3 transition hover:border-brand-mantis/40"
                  >
                    <div className="size-12 overflow-hidden rounded-xl bg-[#EEF2F0]">
                      {item.sellerAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote avatar
                        <img
                          src={cloudinaryCrop(item.sellerAvatarUrl, "1:1", "face")}
                          alt=""
                          className="size-full object-cover"
                        />
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
