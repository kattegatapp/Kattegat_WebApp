import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  MessageCircle,
  Play,
  Star,
} from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { Badge } from "@/components/ui/badge";
import type { CatalogCategory, PublicReview, PublicSellerDetail } from "@/lib/api/marketing";
import { listingPublicPath } from "@/lib/navigation/public-paths";

type SellerPublicProfileProps = {
  seller: PublicSellerDetail;
  categories: CatalogCategory[];
  reviews: PublicReview[];
  reviewsEnabled: boolean;
  origin: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
};

function tierLabel(tier: PublicSellerDetail["tier"]) {
  if (!tier || tier === "starter") return "Starter";
  if (tier === "white_glove") return "Vetted";
  return "Pro";
}

function formatListingPrice(pricing: { amount?: number; unit?: string }) {
  const amount = pricing?.amount;
  if (amount == null || !Number.isFinite(amount)) return "Ask for quote";
  const aed = (amount / 100).toLocaleString("en-AE", { maximumFractionDigits: 0 });
  return pricing.unit ? `From AED ${aed} / ${pricing.unit}` : `From AED ${aed}`;
}

function formatMemberSince(listings: PublicSellerDetail["listings"]) {
  if (!listings.length) return null;
  const earliest = listings.reduce(
    (min, listing) => (listing.createdAt < min ? listing.createdAt : min),
    listings[0]!.createdAt,
  );
  const date = new Date(earliest);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function deriveSkillTags(
  listings: PublicSellerDetail["listings"],
  categoryNameById: Map<string, string>,
) {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const listing of listings) {
    const name = categoryNameById.get(listing.categoryId)?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(name);
  }
  return tags;
}

function sellerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function socialLabel(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function averageReviewRating(reviews: Pick<PublicReview, "rating">[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  if (!Number.isFinite(total)) return null;
  return Math.round((total / reviews.length) * 10) / 10;
}

function resolveListingRating(
  listing: PublicSellerDetail["listings"][number],
  listingReviews: PublicReview[],
) {
  const ratingFromReviews = averageReviewRating(listingReviews);
  const cachedRating = Number.isFinite(listing.aggregateRating) ? listing.aggregateRating : null;
  const cachedCount = Number.isFinite(listing.reviewCount) ? listing.reviewCount : 0;
  const rating = ratingFromReviews ?? cachedRating;
  const reviewCount = listingReviews.length > 0 ? listingReviews.length : cachedCount;
  const hasRating = reviewCount > 0 && rating != null && rating > 0;
  return { rating, reviewCount, hasRating };
}

function sortListingsNewestFirst(listings: PublicSellerDetail["listings"]) {
  return [...listings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-3xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-forest/60">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[8.5rem] shrink-0 rounded-xl border border-brand-forest/8 bg-[#F7F9F8] px-3.5 py-3 sm:min-w-0 sm:flex-1">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-forest/45">
        <span className="grid size-5 place-items-center rounded-full bg-brand-mantis/15">
          <Icon className="size-3 text-brand-forest" />
        </span>
        {label}
      </div>
      <p className="text-base font-extrabold tracking-tight text-brand-forest sm:text-lg">{value}</p>
    </div>
  );
}

export function SellerPublicProfile({
  seller,
  categories,
  reviews,
  reviewsEnabled,
  origin,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
}: SellerPublicProfileProps) {
  const name = seller.displayName || "Kattegat seller";
  const firstName = name.split(" ")[0] || name;
  const listings = sortListingsNewestFirst(seller.listings);
  const reviewsByListingId = reviews.reduce<Map<string, PublicReview[]>>((map, review) => {
    if (!review.listingId) return map;
    const existing = map.get(review.listingId) ?? [];
    existing.push(review);
    map.set(review.listingId, existing);
    return map;
  }, new Map());
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const skillTags = deriveSkillTags(listings, categoryNameById);
  const memberSince = formatMemberSince(listings);
  const overallFromReviews = averageReviewRating(reviews);
  const overallRating =
    overallFromReviews ??
    (Number.isFinite(seller.aggregateRating) ? seller.aggregateRating : null);
  const overallReviewCount =
    reviews.length > 0
      ? reviews.length
      : Number.isFinite(seller.reviewCount)
        ? seller.reviewCount
        : 0;
  const hasOverallRating =
    reviewsEnabled && overallReviewCount > 0 && overallRating != null && overallRating > 0;
  const photos = seller.profileMedia.filter((item) => item.type === "photo");
  const videos = seller.profileMedia.filter((item) => item.type === "video_link");
  const portfolioCount = photos.length + videos.length;
  const socialLinks = Object.entries(seller.socialLinks).filter(([, url]) => {
    if (!url?.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  });

  return (
    <div className="pb-12 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white shadow-[0_18px_50px_rgb(0_57_18/0.07)]">
          <div className="h-1 bg-brand-mantis" aria-hidden />
          <div className="space-y-6 p-5 sm:p-8">
            <div className="flex gap-4 sm:gap-5">
              <div className="shrink-0 rounded-2xl border border-brand-forest/10 bg-[#F7F9F8] p-1">
                <div className="size-[4.5rem] overflow-hidden rounded-[0.85rem] bg-[#EEF2F0] sm:size-24">
                  {seller.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote avatar
                    <img src={seller.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-lg font-extrabold text-brand-mantis sm:text-xl">
                      {sellerInitials(name)}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                  Provider profile
                </p>
                <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-brand-forest sm:text-4xl">
                  {name}
                </h1>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Badge className="border-brand-mantis/30 bg-brand-mantis/15 text-[10px] font-extrabold uppercase tracking-wide text-brand-forest hover:bg-brand-mantis/15">
                    {tierLabel(seller.tier)}
                  </Badge>
                  {seller.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="border-brand-forest/10 bg-[#F7F9F8] text-[10px] font-bold text-brand-forest/80"
                    >
                      <BadgeCheck className="mr-1 size-3 text-brand-mantis" />
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2.5 flex flex-col gap-1 text-sm font-semibold text-brand-forest/60">
                  {reviewsEnabled ? (
                    hasOverallRating ? (
                      <span className="inline-flex items-center gap-1.5 text-brand-forest">
                        <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                        {overallRating!.toFixed(1)}
                        <span className="text-brand-forest/50">· {overallReviewCount} reviews</span>
                      </span>
                    ) : (
                      <span>New provider · no reviews yet</span>
                    )
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-brand-blue" />
                    Dubai, UAE
                  </span>
                  {seller.customSlug ? <span>@{seller.customSlug}</span> : null}
                  {seller.sid ? <span className="text-xs text-brand-forest/40">{seller.sid}</span> : null}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
              {[
                { icon: BriefcaseBusiness, label: "Services", value: String(listings.length) },
                {
                  icon: Star,
                  label: "Overall",
                  value: hasOverallRating ? overallRating!.toFixed(1) : "—",
                },
                { icon: Calendar, label: "Member since", value: memberSince ?? "—" },
                { icon: MessageCircle, label: "Contact", value: "Via listing" },
              ].map((stat) => (
                <StatPill key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
              ))}
            </div>

            <div className="border-t border-brand-forest/8 pt-6">
              <SectionHeading
                eyebrow="About"
                title={`Meet ${firstName}`}
                subtitle="A quick look at this provider"
              />
              <p className="mt-4 text-[15px] leading-7 text-brand-forest/70 sm:text-base sm:leading-8">
                {seller.bio ||
                  `${name} is active on Kattegat in Dubai. Browse their services below or continue in the app to message and book directly.`}
              </p>

              {skillTags.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-brand-forest/45">
                    From their active services
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skillTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#EEF2F0] px-3 py-1.5 text-xs font-bold text-brand-forest/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : seller.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {seller.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-brand-forest/10 bg-[#F7F9F8] px-3 py-1.5 text-xs font-bold text-brand-forest/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {socialLinks.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socialLinks.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-forest/10 bg-[#F7F9F8] px-3 py-1.5 text-xs font-bold text-brand-forest/70 transition hover:border-brand-mantis/35 hover:text-brand-forest"
                    >
                      <Globe className="size-3.5" />
                      {socialLabel(key)}
                      <ExternalLink className="size-3 opacity-50" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </article>

        {/* App CTA */}
        <section className="mt-6">
          <ContinueInApp
            title="Message & book in the app"
            description={`Open Kattegat to view ${name}'s full portfolio, message them, and book directly.`}
            deepLinkPath={`/seller/${seller.userId}`}
            webOrigin={origin}
            appStoreUrl={appStoreUrl}
            playStoreUrl={playStoreUrl}
            mobileAppUrl={mobileAppUrl}
            className="rounded-[1.5rem] border border-brand-forest/10 bg-white p-5 shadow-[0_12px_40px_rgb(0_57_18/0.06)] sm:p-6"
          />
        </section>

        {/* Portfolio */}
        {portfolioCount > 0 ? (
          <section className="mt-12 sm:mt-14">
            <SectionHeading
              eyebrow="Portfolio"
              title="Showcase"
              subtitle={`${portfolioCount} showcase item${portfolioCount === 1 ? "" : "s"}`}
            />
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="group aspect-[4/5] w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[1.25rem] bg-[#EEF2F0] sm:w-auto sm:max-w-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
              {videos.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex aspect-[4/5] w-[72vw] max-w-[280px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-brand-forest/10 bg-brand-forest/[0.03] transition hover:border-brand-mantis/35 hover:bg-brand-mantis/5 sm:w-[240px]"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest transition group-hover:scale-105">
                    <Play className="size-5 fill-current" />
                  </span>
                  <span className="text-xs font-bold text-brand-forest/60">Watch video</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {/* Services */}
        <section className="mt-12 pb-4 sm:mt-14">
          <SectionHeading
            eyebrow="Services"
            title="Book a specific service"
            subtitle={
              reviewsEnabled
                ? `${listings.length} active listing${listings.length === 1 ? "" : "s"} — newest first, each with its own rating`
                : `${listings.length} active listing${listings.length === 1 ? "" : "s"} — pick the one that fits your event`
            }
            action={
              <Link
                href="/search"
                className="hidden text-sm font-extrabold text-brand-blue hover:underline sm:inline"
              >
                Browse marketplace
              </Link>
            }
          />

          {listings.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => {
                const categoryName = categoryNameById.get(listing.categoryId);
                const listingReviews = reviewsByListingId.get(listing.id) ?? [];
                const { rating, reviewCount, hasRating: listingHasRating } = resolveListingRating(
                  listing,
                  listingReviews,
                );

                return (
                  <Link
                    key={listing.id}
                    href={listingPublicPath({ id: listing.id, title: listing.title })}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-brand-forest/10 bg-white shadow-[0_16px_45px_rgb(0_57_18/0.08)] transition duration-300 hover:-translate-y-1 hover:border-brand-mantis/40 hover:shadow-[0_24px_60px_rgb(0_57_18/0.12)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF2F0]">
                      {listing.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.coverImage}
                          alt=""
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <BriefcaseBusiness className="size-8 text-brand-forest/20" />
                        </div>
                      )}
                      {categoryName ? (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-forest/70 backdrop-blur-sm">
                          {categoryName}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-brand-forest transition group-hover:text-brand-blue sm:text-lg">
                        {listing.title}
                      </h3>
                      {listing.location ? (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand-forest/45">
                          <MapPin className="size-3" />
                          {listing.location}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                        <div>
                          <p className="text-sm font-extrabold text-brand-mantis sm:text-base">
                            {formatListingPrice(listing.pricing)}
                          </p>
                          {reviewsEnabled ? (
                            listingHasRating ? (
                              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-brand-forest/50">
                                <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                                {rating!.toFixed(1)} · {reviewCount}
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] font-semibold text-brand-forest/45">New service</p>
                            )
                          ) : null}
                        </div>
                        <span className="grid size-9 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest transition group-hover:bg-brand-mantis/25">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-brand-forest/15 bg-white px-6 py-14 text-center">
              <BriefcaseBusiness className="mx-auto size-9 text-brand-forest/25" />
              <p className="mt-4 font-bold text-brand-forest">No live services yet</p>
              <p className="mt-1 text-sm text-brand-forest/55">
                Check back soon or open the app to see when {name} publishes listings.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
