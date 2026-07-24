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

import { ListingContactPanel, type ListingContactViewer } from "@/features/marketing/listing-contact-panel";
import { Reveal } from "@/components/motion/reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CatalogCategory, PublicReview, PublicSellerDetail } from "@/lib/api/marketing";
import { cloudinaryCrop } from "@/lib/cloudinary";
import { listingPublicPath, sellerPublicPath } from "@/lib/navigation/public-paths";
import { formatListingDisplayPrice } from "@/lib/pricing-blocks";
import { MoneyText } from "@/components/currency";

type SellerPublicProfileProps = {
  seller: PublicSellerDetail;
  categories: CatalogCategory[];
  reviews: PublicReview[];
  reviewsEnabled: boolean;
  origin: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
  canChatDirectly: boolean;
  contactAgentEnabled: boolean;
  viewer: ListingContactViewer;
};

function tierLabel(tier: PublicSellerDetail["tier"]) {
  if (!tier || tier === "starter") return "Starter";
  if (tier === "white_glove") return "Vetted";
  return "Pro";
}

function formatListingPrice(listing: {
  displayPrice?: string | null;
  pricing?: { amount?: number; unit?: string } | null;
}) {
  return formatListingDisplayPrice(listing);
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

function ProfileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="shrink-0 px-1 py-3 text-sm font-bold text-foreground/50 transition hover:text-foreground"
    >
      {label}
    </a>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-[7rem] shrink-0 items-center gap-2.5 px-4 py-3.5 sm:min-w-0 sm:flex-1 sm:px-5">
      <Icon className="size-4 shrink-0 text-brand-blue" />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold leading-tight text-brand-forest">{value}</p>
        <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </p>
      </div>
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
  canChatDirectly,
  contactAgentEnabled,
  viewer,
}: SellerPublicProfileProps) {
  const name = seller.displayName || "Kattegat seller";
  const firstName = name.split(" ")[0] || name;
  const publicPath = sellerPublicPath({
    userId: seller.userId,
    customSlug: seller.customSlug,
    displayName: seller.displayName,
  });
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

  const stats = [
    { icon: BriefcaseBusiness, label: "Services", value: String(listings.length) },
    { icon: Star, label: "Overall rating", value: hasOverallRating ? overallRating!.toFixed(1) : "New" },
    { icon: Calendar, label: "Member since", value: memberSince ?? "—" },
    { icon: MessageCircle, label: "Contact", value: canChatDirectly ? "Direct chat" : "Via agent" },
  ];

  return (
    <div className="scroll-smooth pb-24 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <Reveal className="overflow-hidden rounded-3xl bg-card shadow-[0_20px_60px_rgb(0_57_18/0.08)]">
          <div className="h-28 bg-brand-mantis sm:h-40" />

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                <div className="-mt-10 shrink-0 rounded-2xl bg-card p-1.5 shadow-lg sm:-mt-14">
                  <Avatar className="size-20 rounded-xl sm:size-28">
                    <AvatarImage
                      src={seller.avatarUrl ? cloudinaryCrop(seller.avatarUrl, "1:1", "face") : undefined}
                      alt=""
                      className="rounded-xl"
                    />
                    <AvatarFallback className="rounded-xl text-lg font-extrabold text-brand-forest sm:text-2xl">
                      {sellerInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0 pb-0.5">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-brand-mantis/15 text-[10px] font-extrabold uppercase tracking-wide text-brand-forest hover:bg-brand-mantis/15">
                      {tierLabel(seller.tier)}
                    </Badge>
                    {seller.badges.map((badge) => (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className="border-0 bg-muted text-[10px] font-bold text-foreground/80"
                      >
                        <BadgeCheck className="mr-1 size-3 text-brand-mantis" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <h1 className="truncate text-2xl font-extrabold leading-tight tracking-[-0.035em] text-foreground sm:text-4xl">
                      {name}
                    </h1>
                    {reviewsEnabled ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-mantis/15 px-2.5 py-1 text-xs font-extrabold text-brand-forest">
                        <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                        {hasOverallRating ? overallRating!.toFixed(1) : "New"}
                        {hasOverallRating ? (
                          <span className="font-semibold text-brand-forest/50">
                            ({overallReviewCount})
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-brand-blue" /> Dubai, UAE
                    </span>
                    {seller.customSlug ? (
                      <>
                        <span className="text-foreground/25">·</span>
                        <span>@{seller.customSlug}</span>
                      </>
                    ) : null}
                    {seller.sid ? (
                      <>
                        <span className="text-foreground/25">·</span>
                        <span className="text-foreground/35">{seller.sid}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="hidden w-full max-w-[15rem] sm:block sm:w-auto sm:shrink-0">
                <ListingContactPanel
                  sellerId={seller.userId}
                  sellerName={name}
                  sellerUserId={seller.userId}
                  canChatDirectly={canChatDirectly}
                  contactAgentEnabled={contactAgentEnabled}
                  viewer={viewer}
                  publicPath={publicPath}
                  deepLinkPath={`/seller/${seller.userId}`}
                  webOrigin={origin}
                  appStoreUrl={appStoreUrl}
                  playStoreUrl={playStoreUrl}
                  mobileAppUrl={mobileAppUrl}
                  compact
                />
              </div>
            </div>
            <div className="mt-6 flex overflow-x-auto rounded-2xl bg-muted/40 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-7 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              {stats.map((stat) => (
                <StatItem key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Section nav */}
        <Reveal
          as="nav"
          delayMs={60}
          aria-label="Profile sections"
          className="sticky top-[4.5rem] z-30 -mx-4 mt-6 flex items-center gap-5 overflow-x-auto bg-background/90 px-4 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] sm:top-[5.5rem] sm:mx-0 sm:mt-8 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <ProfileNavLink href="#about" label="About" />
          {portfolioCount > 0 ? <ProfileNavLink href="#portfolio" label="Portfolio" /> : null}
          <ProfileNavLink href="#services" label="Services" />
        </Reveal>

        {/* About */}
        <section id="about" className="scroll-mt-32 pt-8 sm:scroll-mt-36 sm:pt-10">
          <Reveal delayMs={80}>
            <SectionHeading
              eyebrow="About"
              title={`Meet ${firstName}`}
              subtitle="A quick look at this provider"
            />
            <p className="mt-4 max-w-4xl text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
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
                      className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground/70"
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
                    className="rounded-full bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground/70"
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground/70 transition hover:bg-brand-mantis/15 hover:text-foreground active:scale-[0.97]"
                  >
                    <Globe className="size-3.5" />
                    {socialLabel(key)}
                    <ExternalLink className="size-3 opacity-50" />
                  </a>
                ))}
              </div>
            ) : null}
          </Reveal>
        </section>

        {/* Portfolio */}
        {portfolioCount > 0 ? (
          <section id="portfolio" className="scroll-mt-32 pt-12 sm:scroll-mt-36 sm:pt-14">
            <Separator className="mb-12 sm:mb-14" />
            <Reveal>
              <SectionHeading
                eyebrow="Portfolio"
                title="Showcase"
                subtitle={`${portfolioCount} showcase item${portfolioCount === 1 ? "" : "s"}`}
              />
            </Reveal>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
              {photos.map((item, index) => (
                <Reveal
                  key={item.id}
                  delayMs={Math.min(index * 50, 300)}
                  className="group aspect-[4/5] w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted shadow-sm sm:w-auto sm:max-w-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryCrop(item.url, "4:5", "auto")}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Reveal>
              ))}
              {videos.map((item, index) => (
                <Reveal
                  key={item.id}
                  as="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  delayMs={Math.min((photos.length + index) * 50, 300)}
                  className="group flex aspect-[4/5] w-[72vw] max-w-[280px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl bg-card shadow-sm transition hover:bg-brand-mantis/5 active:scale-[0.97] sm:w-auto sm:max-w-none"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest transition group-hover:scale-105">
                    <Play className="size-5 fill-current" />
                  </span>
                  <span className="text-xs font-bold text-brand-forest/60">Watch video</span>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {/* Services */}
        <section id="services" className="scroll-mt-32 pb-4 pt-12 sm:scroll-mt-36 sm:pt-14">
          <Separator className="mb-12 sm:mb-14" />
          <Reveal>
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
          </Reveal>

          {listings.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing, index) => {
                const categoryName = categoryNameById.get(listing.categoryId);
                const listingReviews = reviewsByListingId.get(listing.id) ?? [];
                const { rating, reviewCount, hasRating: listingHasRating } = resolveListingRating(
                  listing,
                  listingReviews,
                );

                return (
                  <Reveal key={listing.id} delayMs={Math.min(index * 60, 360)} className="h-full">
                    <Link
                      href={listingPublicPath({ id: listing.id, title: listing.title })}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgb(0_57_18/0.10)] active:scale-[0.98]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {listing.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cloudinaryCrop(listing.coverImage, "4:3", "auto")}
                            alt=""
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <BriefcaseBusiness className="size-8 text-brand-forest/20" />
                          </div>
                        )}
                        {categoryName ? (
                          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground/70 backdrop-blur-sm">
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
                            <MoneyText className="text-sm font-extrabold text-brand-mantis sm:text-base">
                              {formatListingPrice(listing)}
                            </MoneyText>
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
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-muted/40 px-6 py-14 text-center">
              <BriefcaseBusiness className="mx-auto size-9 text-brand-forest/25" />
              <p className="mt-4 font-bold text-brand-forest">No live services yet</p>
              <p className="mt-1 text-sm text-brand-forest/55">
                Check back soon or open the app to see when {name} publishes listings.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgb(0_57_18/0.08)] backdrop-blur-md sm:hidden">
        <ListingContactPanel
          sellerId={seller.userId}
          sellerName={name}
          sellerUserId={seller.userId}
          canChatDirectly={canChatDirectly}
          contactAgentEnabled={contactAgentEnabled}
          viewer={viewer}
          publicPath={publicPath}
          deepLinkPath={`/seller/${seller.userId}`}
          webOrigin={origin}
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          mobileAppUrl={mobileAppUrl}
          compact
        />
      </div>
    </div>
  );
}
