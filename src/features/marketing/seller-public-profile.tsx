import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Play,
  Star,
} from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { Badge } from "@/components/ui/badge";
import type { CatalogCategory, PublicSellerDetail } from "@/lib/api/marketing";
import { listingPublicPath } from "@/lib/navigation/public-paths";

type SellerPublicProfileProps = {
  seller: PublicSellerDetail;
  categories: CatalogCategory[];
  origin: string;
  appStoreUrl: string;
  playStoreUrl: string;
  mobileAppUrl: string;
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white/65">
        <span className="grid size-6 place-items-center rounded-full bg-white/10">
          <Icon className="size-3.5 text-brand-mantis" />
        </span>
        {label}
      </div>
      <p className="text-lg font-extrabold tracking-tight text-white">{value}</p>
    </motion>
  );
}

export function SellerPublicProfile({
  seller,
  categories,
  origin,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
}: SellerPublicProfileProps) {
  const name = seller.displayName || "Kattegat seller";
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const skillTags = deriveSkillTags(seller.listings, categoryNameById);
  const memberSince = formatMemberSince(seller.listings);
  const hasRating = seller.reviewCount > 0 && seller.aggregateRating > 0;
  const photos = seller.profileMedia.filter((item) => item.type === "photo");
  const videos = seller.profileMedia.filter((item) => item.type === "video_link");
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
    <div className="pb-10">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-forest via-[#0f4a32] to-brand-blue text-white">
        <motion>
        <motion>
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="size-24 shrink-0 overflow-hidden rounded-[1.25rem] border-2 border-white/25 bg-white/10 p-1 sm:size-28">
                <div className="size-full overflow-hidden rounded-[1rem] bg-[#EEF2F0]">
                  {seller.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote avatar
                    <img src={seller.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xl font-extrabold text-brand-mantis">
                      {sellerInitials(name)}
                    </motion>
                  )}
                </motion>
              </motion>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-white/20 bg-white/10 text-[10px] font-extrabold uppercase tracking-wide text-white hover:bg-white/10">
                    {tierLabel(seller.tier)}
                  </Badge>
                  {seller.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="border-white/15 bg-white/10 text-[10px] font-bold text-white"
                    >
                      <BadgeCheck className="mr-1 size-3" />
                      {badge}
                    </Badge>
                  ))}
                </motion>
                <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  {name}
                </h1>
                {seller.customSlug ? (
                  <p className="mt-1 text-sm font-semibold text-white/70">@{seller.customSlug}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-brand-mantis text-brand-mantis" />
                    {hasRating ? (
                      <>
                        {seller.aggregateRating.toFixed(1)}
                        <span className="text-white/55">· {seller.reviewCount} reviews</span>
                      </>
                    ) : (
                      <span className="text-white/70">New provider</span>
                    )}
                  </span>
                  {seller.sid ? <span className="text-white/45">· {seller.sid}</span> : null}
                </motion>
              </motion>
            </motion>

            <div className="w-full max-w-sm shrink-0">
              <ContinueInApp
                title="Message & book in the app"
                description={`Open Kattegat to view ${name}'s full portfolio, message them, and book directly.`}
                deepLinkPath={`/seller/${seller.userId}`}
                webOrigin={origin}
                appStoreUrl={appStoreUrl}
                playStoreUrl={playStoreUrl}
                mobileAppUrl={mobileAppUrl}
              />
            </motion>
          </motion>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={BriefcaseBusiness} label="Services" value={String(seller.listings.length)} />
            <StatCard
              icon={Star}
              label="Overall"
              value={hasRating ? seller.aggregateRating.toFixed(1) : "—"}
            />
            <StatCard icon={Calendar} label="Member since" value={memberSince ?? "—"} />
            <StatCard icon={MapPin} label="Market" value="Dubai, UAE" />
          </motion>
        </motion>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="-mt-8 rounded-[1.5rem] border border-brand-forest/10 bg-white p-6 shadow-[0_20px_60px_rgb(0_57_18/0.08)] sm:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">About</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-brand-forest">
            Meet {name.split(" ")[0] || name}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-brand-forest/65">
            {seller.bio ||
              `${name} is active on Kattegat in Dubai. Browse their services below or continue in the app to message and book directly.`}
          </p>

          {skillTags.length > 0 ? (
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-forest/45">
                From their active services
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#EEF2F0] px-3 py-1 text-xs font-bold text-brand-forest/70"
                  >
                    {tag}
                  </span>
                ))}
              </motion>
            </motion>
          ) : seller.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {seller.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand-forest/10 bg-white px-3 py-1 text-xs font-bold text-brand-forest/70"
                >
                  {tag}
                </span>
              ))}
            </motion>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-forest/10 bg-[#F7F9F8] px-3 py-1.5 text-xs font-bold text-brand-forest/70 transition hover:border-brand-mantis/30 hover:text-brand-forest"
                >
                  <Globe className="size-3.5" />
                  {socialLabel(key)}
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              ))}
            </motion>
          ) : null}
        </section>

        {photos.length > 0 || videos.length > 0 ? (
          <section className="mt-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
              Portfolio
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">Showcase</h2>
            <motion>
              {photos.map((item) => (
                <motion>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="size-full object-cover" />
                </motion>
              ))}
              {videos.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-brand-forest/10 bg-brand-forest/[0.03] transition hover:border-brand-mantis/35 hover:bg-brand-mantis/5"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest transition group-hover:scale-105">
                    <Play className="size-5 fill-current" />
                  </span>
                  <span className="text-xs font-bold text-brand-forest/60">Watch video</span>
                </a>
              ))}
            </motion>
          </section>
        ) : null}

        <section className="mt-12 pb-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                Services
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
                Book a specific service
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-forest/60">
                Each listing is a distinct service {name.split(" ")[0] || name} offers — pick the one
                that fits your event.
              </p>
            </motion>
            <Link
              href="/search"
              className="hidden text-sm font-extrabold text-brand-blue hover:underline sm:inline"
            >
              Browse marketplace
            </Link>
          </motion>

          {seller.listings.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {seller.listings.map((listing) => {
                const categoryName = categoryNameById.get(listing.categoryId);
                const listingHasRating = listing.reviewCount > 0 && listing.aggregateRating > 0;
                return (
                  <Link
                    key={listing.id}
                    href={listingPublicPath({ id: listing.id, title: listing.title })}
                    className="group flex gap-4 rounded-2xl border border-brand-forest/10 bg-white p-3 transition hover:border-brand-mantis/35 hover:shadow-[0_12px_40px_rgb(0_57_18/0.08)] sm:p-4"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#EEF2F0] sm:size-28">
                      {listing.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.coverImage} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <BriefcaseBusiness className="size-6 text-brand-forest/25" />
                        </motion>
                      )}
                    </motion>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
                      <div>
                        {categoryName ? (
                          <span className="inline-block rounded-full bg-[#EEF2F0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-forest/55">
                            {categoryName}
                          </span>
                        ) : null}
                        <h3 className="mt-1.5 line-clamp-2 text-base font-extrabold leading-snug text-brand-forest group-hover:text-brand-blue">
                          {listing.title}
                        </h3>
                        {listing.location ? (
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brand-forest/45">
                            <MapPin className="size-3" />
                            {listing.location}
                          </p>
                        ) : null}
                      </motion>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-sm font-extrabold text-brand-mantis">
                            {formatListingPrice(listing.pricing)}
                          </p>
                          {listingHasRating ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-brand-forest/50">
                              <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                              {listing.aggregateRating.toFixed(1)} · {listing.reviewCount}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[11px] font-semibold text-brand-forest/45">
                              New service
                            </p>
                          )}
                        </motion>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest transition group-hover:bg-brand-mantis/25">
                          <ArrowRight className="size-4" />
                        </span>
                      </motion>
                    </motion>
                  </Link>
                );
              })}
            </motion>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-forest/15 bg-white px-6 py-12 text-center">
              <BriefcaseBusiness className="mx-auto size-8 text-brand-forest/25" />
              <p className="mt-3 font-bold text-brand-forest">No live services yet</p>
              <p className="mt-1 text-sm text-brand-forest/55">
                Check back soon or open the app to see when {name} publishes listings.
              </p>
            </motion>
          )}
        </section>
      </motion>
    </motion>
  );
}
