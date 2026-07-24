import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  HandCoins,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { HeroCarousel } from "@/features/marketing/hero-carousel";
import { dubaiHrefForQuery } from "@/features/marketing/local-seo";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { CompetitionDashboardBanner } from "@/features/account/competition-dashboard-banner";
import { SERVICE_CATEGORIES } from "@/features/marketing/service-categories";
import { SiteFooter } from "@/features/marketing/site-footer";
import type { PublicAppSettings } from "@/lib/api/settings";
import type { FeaturedSeller } from "@/lib/api/marketing";
import { cloudinaryCrop } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type ProductHomeProps = {
  settings: PublicAppSettings;
  featuredSellers?: FeaturedSeller[];
};

const categories = SERVICE_CATEGORIES;

const steps = [
  {
    icon: Search,
    title: "Discover",
    body: "Browse talent or post what your venue or event needs.",
  },
  {
    icon: MessageCircle,
    title: "Connect",
    body: "Compare profiles and speak directly with sellers.",
  },
  {
    icon: BadgeCheck,
    title: "Work together",
    body: "Agree the details. No booking commission in the middle.",
  },
] as const;

const marketplaceProof = [
  {
    value: "0%",
    label: "Booking commission",
    detail: "No percentage taken from your booking.",
    icon: CircleDollarSign,
  },
  {
    value: "100%",
    label: "Kept by sellers",
    detail: "Talent keeps the fee they earn.",
    icon: HandCoins,
  },
  {
    value: "Dubai",
    label: "Built for this market",
    detail: "Designed around the way Dubai works.",
    icon: MapPin,
  },
] as const;

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified marketplace",
    body: "Trust signals and moderation help buyers make better-informed decisions.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy by design",
    body: "Clear controls, protected account actions, and accessible account deletion.",
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    body: "Buyers and sellers align directly, with no agency controlling the relationship.",
  },
] as const;

function sellerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "KS";
}

function sellerTierLabel(tier: FeaturedSeller["tier"]) {
  if (tier === "white_glove") return "White Glove";
  if (tier === "pro") return "Pro";
  return "On Kattegat";
}

function shouldShowSellerRating(seller: FeaturedSeller) {
  return seller.reviewCount >= 3 && seller.rating >= 4;
}

const SELLER_FALLBACK_TONES = [
  "bg-[radial-gradient(circle_at_28%_18%,rgb(111_219_66/0.45),transparent_42%),linear-gradient(155deg,#003912_0%,#48DC81_100%)]",
  "bg-[radial-gradient(circle_at_72%_22%,rgb(72_220_129/0.4),transparent_40%),linear-gradient(155deg,#0a2f1c_0%,#003912_55%,#48DC81_100%)]",
  "bg-[radial-gradient(circle_at_40%_80%,rgb(72_220_129/0.55),transparent_45%),linear-gradient(160deg,#48DC81_0%,#003912_100%)]",
  "bg-[radial-gradient(circle_at_18%_70%,rgb(111_219_66/0.28),transparent_40%),linear-gradient(145deg,#003912_10%,#0d3d28_50%,#48DC81_100%)]",
] as const;

function SellerAvatar({
  seller,
  index = 0,
  className,
  initialsClassName,
  style,
}: {
  seller: FeaturedSeller;
  index?: number;
  className?: string;
  initialsClassName?: string;
  style?: CSSProperties;
}) {
  if (seller.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote seller avatars; hosts vary
      <img
        src={cloudinaryCrop(seller.avatarUrl, "1:1", "face")}
        alt=""
        className={cn("object-cover", className)}
        style={style}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center font-extrabold text-brand-mantis",
        SELLER_FALLBACK_TONES[index % SELLER_FALLBACK_TONES.length],
        className,
        initialsClassName,
      )}
      style={style}
    >
      {sellerInitials(seller.name)}
    </div>
  );
}

export function ProductHome({ settings, featuredSellers = [] }: ProductHomeProps) {
  const brand = settings.brand.siteName || "Kattegat";

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      {/* Soft brand atmosphere — not purple, not dark */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[28rem] rounded-full bg-brand-mantis/20 blur-3xl" />
        <div className="absolute right-0 top-40 size-[22rem] rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-brand-emerald/15 blur-3xl" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={brand} />
        </div>
      </header>

      {/* Full-screen landing slideshow. */}
      <section className="relative h-[100dvh] min-h-screen w-full overflow-hidden bg-brand-forest text-white">
        <div className="absolute inset-0 h-[100dvh] min-h-screen w-full">
          <HeroCarousel className="h-[100dvh] min-h-screen w-full rounded-none sm:rounded-none" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-forest/85 via-transparent to-black/40" />

        <div className="production-hero-content pointer-events-none relative z-20 mx-auto flex h-[100dvh] min-h-screen max-w-7xl items-end px-5 pb-20 pt-24 sm:px-8 sm:pb-24 sm:pt-28 lg:items-center lg:px-24 lg:pb-12 lg:pt-32">
          <div className="production-hero-copy w-full max-w-[44rem] [text-shadow:0_2px_18px_rgb(0_0_0/0.8)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md">
              <BadgeCheck className="size-4 text-brand-mantis" aria-hidden />
              Dubai&apos;s direct talent marketplace
            </div>
            <h1 className="production-hero-title mt-4 max-w-[11ch] text-[clamp(2.25rem,10.5vw,3.5rem)] font-extrabold leading-[0.96] tracking-[-0.05em] text-balance sm:mt-6 sm:text-6xl sm:leading-[0.92] md:text-7xl lg:max-w-[10ch] lg:text-8xl lg:leading-[0.9] xl:text-[7rem] 2xl:text-[7.5rem]">
              Find the talent that makes the night.
            </h1>
            <p className="production-hero-description mt-4 max-w-[36rem] text-sm font-semibold leading-6 text-white/90 sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9 xl:text-2xl xl:leading-10">
              Discover verified entertainment and hospitality professionals, connect directly,
              and book without agency commission.
            </p>
            <div className="pointer-events-auto mt-6 grid w-full max-w-[27rem] grid-cols-2 items-stretch gap-2.5 sm:mt-8 sm:gap-3 lg:flex lg:max-w-none lg:items-center">
              <Link
                href="/search"
                className={cn(buttonVariants({ size: "lg" }), "h-12 w-full justify-center whitespace-nowrap rounded-2xl bg-brand-mantis px-3 text-xs font-extrabold text-brand-forest hover:bg-white sm:h-13 sm:px-5 sm:text-sm lg:w-auto lg:px-6")}
              >
                Find talent <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 w-full justify-center whitespace-nowrap rounded-2xl border-white/35 bg-white/10 px-3 text-xs font-extrabold text-white backdrop-blur-md hover:bg-white hover:text-brand-forest sm:h-13 sm:px-5 sm:text-sm lg:w-auto lg:px-6")}
              >
                How it works
              </Link>
            </div>
            <div className="mt-5 hidden flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/65 sm:flex lg:mt-8">
              <span>0% booking commission</span>
              <span>Verified marketplace</span>
              <span>Built in Dubai</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-forest/10 bg-white px-4 py-5 sm:px-6 sm:py-7">
        <div className="mx-auto max-w-6xl">
          <CompetitionDashboardBanner
            authAware
          />
        </div>
      </section>

      {/* Marketplace proof */}
      <section className="relative overflow-hidden bg-brand-mantis px-4 py-14 sm:px-6 sm:py-18">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="proof-orbit absolute -right-24 -top-32 size-80 rounded-full border border-brand-forest/15" />
          <div className="proof-orbit-reverse absolute -bottom-40 -left-20 size-96 rounded-full border border-brand-forest/12" />
          <div className="proof-glow absolute left-[12%] top-8 size-56 rounded-full bg-white/35 blur-3xl" />
          <div className="proof-glow-reverse absolute right-[16%] top-20 size-64 rounded-full bg-brand-emerald/45 blur-3xl" />
          <span className="proof-particle absolute left-[8%] top-[42%] size-2 rounded-full bg-brand-forest/40" />
          <span className="proof-particle absolute right-[9%] top-[22%] size-3 rounded-full bg-white/65 [animation-delay:900ms]" />
          <span className="proof-particle absolute bottom-[13%] left-[48%] size-2.5 rounded-full bg-brand-blue/35 [animation-delay:1600ms]" />
          <div className="proof-sweep absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-forest/60">
              A fairer marketplace
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-brand-forest sm:text-4xl">
              Direct connections. Better outcomes.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {marketplaceProof.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.label}
                  className="group rounded-[1.5rem] border border-brand-forest/10 bg-white/75 p-6 shadow-[0_16px_45px_rgb(0_57_18/0.1)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.06em] text-brand-forest">
                      {item.value}
                    </p>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-brand-mantis transition group-hover:rotate-3">
                      <Icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="mt-6 text-base font-extrabold tracking-[-0.02em] text-brand-forest sm:text-lg">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-forest/60">
                    {item.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="category-grid absolute inset-0 opacity-45" />
          <div className="category-aura absolute -left-32 top-12 size-[28rem] rounded-full bg-brand-mantis/22 blur-3xl" />
          <div className="category-aura-reverse absolute -right-28 bottom-8 size-[30rem] rounded-full bg-brand-blue/14 blur-3xl" />
          <div className="category-ring absolute right-[10%] top-16 size-44 rounded-full border border-brand-forest/10" />
          <div className="category-ring-reverse absolute bottom-10 left-[7%] size-28 rounded-full border border-brand-mantis/30" />
          <span className="category-dot absolute left-[18%] top-[18%] size-2 rounded-full bg-brand-blue/35" />
          <span className="category-dot absolute bottom-[16%] right-[20%] size-2.5 rounded-full bg-brand-mantis/70 [animation-delay:1.2s]" />
        </div>

        <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Browse
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl lg:text-4xl">
                Categories that fill a night.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-forest hover:text-brand-blue"
              >
                Search all
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/dubai"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-forest hover:text-brand-blue"
              >
                Dubai
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((category, i) => (
            <Reveal key={category.title} delayMs={i * 30}>
              <Link
                href={
                  dubaiHrefForQuery(category.query) ??
                  `/search?category=${encodeURIComponent(category.query)}`
                }
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-brand-forest shadow-[0_12px_40px_rgb(0_57_18/0.1)]"
              >
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/85 via-brand-forest/15 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-extrabold tracking-[-0.02em] text-white sm:p-5 sm:text-base">
                  {category.title}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="border-y border-brand-forest/8 bg-white/70 px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Popular in Dubai
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  Services people are looking for.
                </h2>
              </div>
              <Link href="/services" className="inline-flex items-center gap-2 text-sm font-extrabold hover:text-brand-blue">
                Explore everything <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Reveal key={category.title} delayMs={index * 45}>
                <Link
                  href={
                    dubaiHrefForQuery(category.query) ??
                    `/search?category=${encodeURIComponent(category.query)}`
                  }
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-brand-forest/8 bg-white p-3 shadow-[0_10px_35px_rgb(0_57_18/0.06)] transition hover:-translate-y-0.5 hover:border-brand-mantis/60"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-brand-forest">
                    <Image src={category.image} alt="" fill sizes="64px" className="object-cover transition group-hover:scale-105" />
                  </span>
                  <span className="text-sm font-extrabold leading-5">{category.title}</span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-brand-forest/30 transition group-hover:text-brand-blue" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured sellers — editorial spotlight + roster. */}
      {featuredSellers.length ? (
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Featured sellers
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                  Meet people ready to work.
                </h2>
                <p className="mt-4 text-sm leading-7 text-brand-forest/60 sm:text-base">
                  A live look at talent already on Kattegat — profiles and services from the
                  marketplace feed.
                </p>
              </div>
            </Reveal>

            {(() => {
              const [lead, ...rest] = featuredSellers;
              const leadRating = shouldShowSellerRating(lead);

              return (
                <div
                  className="mt-10"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "stretch",
                    gap: "2rem",
                  }}
                >
                  {/* Portrait spotlight — capped width so it can never go full-bleed. */}
                  <div style={{ flex: "0 1 26rem", width: "100%", maxWidth: "26rem" }}>
                    <article
                      style={{
                        position: "relative",
                        isolation: "isolate",
                        display: "flex",
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "2rem",
                        background: "#003912",
                        color: "#fff",
                        aspectRatio: "3 / 4",
                        maxHeight: "36rem",
                        boxShadow:
                          "0 24px 60px rgb(0 57 18 / 0.22), 0 8px 24px rgb(0 57 18 / 0.12)",
                      }}
                    >
                      <SellerAvatar
                        seller={lead}
                        index={0}
                        className="featured-sellers-media"
                        initialsClassName="featured-sellers-media featured-sellers-media-fallback text-5xl"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, #003912 0%, rgb(0 57 18 / 0.55) 45%, transparent 100%)",
                        }}
                      />

                      <div
                        style={{
                          position: "relative",
                          marginTop: "auto",
                          display: "flex",
                          width: "100%",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          padding: "1.5rem",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                            {sellerTierLabel(lead.tier)}
                          </span>
                          {leadRating ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-white/85">
                              <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
                              {lead.rating.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                          {lead.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-brand-emerald">
                          {lead.category || "Dubai services"}
                        </p>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                          {lead.service}
                        </p>
                      </div>
                    </article>
                  </div>

                  {/* Roster / early note — fills remaining space beside the portrait. */}
                  <div
                    style={{
                      flex: "1 1 18rem",
                      minWidth: "min(100%, 18rem)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    {rest.length ? (
                      <>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-forest/40">
                          Also on the marketplace
                        </p>
                        <ul className="mt-4 divide-y divide-brand-forest/10 border-y border-brand-forest/10">
                          {rest.map((seller, index) => {
                            const showRating = shouldShowSellerRating(seller);
                            return (
                              <li key={seller.id} className="flex items-center gap-4 py-4">
                                <SellerAvatar
                                  seller={seller}
                                  index={index + 1}
                                  className="size-14 shrink-0 rounded-2xl"
                                  initialsClassName="text-sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h3 className="truncate text-base font-extrabold tracking-[-0.02em]">
                                      {seller.name}
                                    </h3>
                                    {showRating ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest/55">
                                        <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                                        {seller.rating.toFixed(1)}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-0.5 text-xs font-semibold text-brand-blue">
                                    {seller.category || "Dubai services"}
                                  </p>
                                  <p className="mt-1 line-clamp-1 text-sm text-brand-forest/55">
                                    {seller.service}
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <div className="rounded-[1.75rem] border border-brand-forest/10 bg-[#EEF2F0]/70 p-6 sm:p-7">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                          Early marketplace
                        </p>
                        <p className="mt-3 text-lg font-extrabold tracking-[-0.03em] sm:text-xl">
                          More sellers are going live as Kattegat opens.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-brand-forest/60">
                          This is a live profile from the feed — not a placeholder. Browse services
                          or join the waitlist to get launch updates.
                        </p>
                      </div>
                    )}

                    <Link
                      href="/search"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand-forest transition hover:text-brand-blue"
                    >
                      Browse all services
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      ) : null}

      {/* Audience — opposing skew panels */}
      <section className="relative isolate overflow-hidden bg-[#F7F9F8] py-16 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -inset-x-[15%] top-[38%] h-[55%] -translate-y-1/2 skew-y-[-4deg] bg-white shadow-[0_24px_80px_rgb(0_57_18/0.06)]" />
          <div className="absolute -inset-x-[10%] top-[62%] h-[42%] -translate-y-1/2 skew-y-[3deg] bg-brand-forest/[0.04]" />
          <div className="absolute -left-24 top-16 size-64 rounded-full bg-brand-mantis/15 blur-3xl" />
          <div className="absolute -right-20 bottom-8 size-72 rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                One marketplace, both sides
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-brand-forest sm:text-5xl">
                Built for the people booking the work—and the people doing it.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-brand-forest/60 sm:text-lg sm:leading-8">
                Whether you&apos;re planning the next unforgettable night or bringing the talent
                that makes it happen, Kattegat keeps the connection direct and transparent.
              </p>
            </div>
          </Reveal>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center">
            <Reveal>
              <div className="relative lg:translate-x-2 lg:translate-y-3">
                <div className="skew-y-0 transition duration-500 lg:-skew-y-2 lg:hover:-skew-y-1">
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-forest p-8 text-white shadow-[0_28px_70px_rgb(0_57_18/0.22)] sm:p-10 lg:skew-y-2">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 top-0 h-full w-24 skew-x-[-14deg] bg-brand-mantis/10"
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-brand-mantis backdrop-blur-sm">
                        <BriefcaseBusiness className="size-6" />
                      </span>
                      <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">
                        For venues & planners
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                        Find the right people for private events, nightlife, hotels, and brand
                        activations — without the agency maze.
                      </p>
                      <ul className="mt-7 space-y-3">
                        {[
                          "Post a clear brief",
                          "Review profiles and portfolios",
                          "Talk directly to sellers",
                        ].map((item) => (
                          <li key={item} className="flex gap-3 text-sm font-bold">
                            <Check className="mt-0.5 size-4 shrink-0 text-brand-mantis" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/how-it-works"
                        className={cn(
                          buttonVariants(),
                          "mt-9 h-12 w-fit rounded-2xl bg-brand-mantis px-6 font-extrabold text-brand-forest hover:bg-white",
                        )}
                      >
                        Find talent
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={70}>
              <div className="relative lg:-translate-x-2 lg:-translate-y-2">
                <div className="skew-y-0 transition duration-500 lg:skew-y-2 lg:hover:skew-y-1">
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-brand-mantis p-8 text-brand-forest shadow-[0_28px_70px_rgb(111_219_66/0.25)] sm:p-10 lg:-skew-y-2">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -left-6 bottom-0 h-full w-20 skew-x-[12deg] bg-brand-forest/5"
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-forest text-white">
                        <Users className="size-6" />
                      </span>
                      <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">
                        For talent & sellers
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-7 text-brand-forest/70">
                        Show your craft, get relevant demand, and keep what you earn.
                      </p>
                      <ul className="mt-7 space-y-3">
                        {[
                          "Build a service-led profile",
                          "Access marketplace demand",
                          "Keep 100% of your booking fee",
                        ].map((item) => (
                          <li key={item} className="flex gap-3 text-sm font-bold">
                            <Check className="mt-0.5 size-4 shrink-0 text-brand-forest" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/contact"
                        className={cn(
                          buttonVariants(),
                          "mt-9 h-12 w-fit rounded-2xl bg-brand-forest px-6 font-extrabold text-white hover:bg-brand-blue",
                        )}
                      >
                        Join as a seller
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust and safety */}
      <section className="border-y border-brand-forest/8 bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">Trust & safety</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">Confidence at every connection.</h2>
              </div>
              <p className="max-w-2xl text-sm font-medium leading-7 text-brand-forest/60 sm:text-lg sm:leading-8 lg:justify-self-end">
                Kattegat is designed to make discovery transparent, communication direct, and account controls easy to understand.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {trustPoints.map((point, index) => (
              <Reveal key={point.title} delayMs={index * 60}>
                <article className="h-full rounded-[1.75rem] border border-brand-forest/8 bg-[#F7F9F8] p-7 transition hover:border-brand-mantis/60 sm:p-8">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-forest text-brand-mantis">
                    <point.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-8 text-xl font-extrabold tracking-[-0.03em]">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-forest/60">{point.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden px-4 py-16 text-brand-forest sm:px-6 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-28 -top-36 size-96 rounded-full border border-brand-forest/5" />
          <div className="absolute -bottom-52 -left-28 size-[30rem] rounded-full border border-brand-mantis/15" />
          <div className="absolute left-1/2 top-1/3 size-80 -translate-x-1/2 rounded-full bg-brand-mantis/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                Three steps. No middleman.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-brand-forest/60 sm:text-lg sm:leading-8">
                Go from discovery to a direct working relationship without an agency controlling
                the conversation or taking a cut.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-12 sm:mt-16">
            <div aria-hidden className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-gradient-to-r from-brand-forest/5 via-brand-mantis to-brand-forest/5 md:block" />

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <Reveal key={step.title} delayMs={i * 80}>
                  <article className="group relative flex h-full min-h-72 flex-col overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white/85 p-7 shadow-[0_18px_55px_rgb(0_57_18/0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-brand-mantis/60 hover:shadow-[0_24px_65px_rgb(0_57_18/0.13)] sm:p-8">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-6 top-5 text-[5.5rem] font-extrabold leading-none tracking-[-0.08em] text-brand-forest/75 [text-shadow:10px_12px_0_rgb(111_219_66/0.28)] transition duration-300 group-hover:text-brand-blue group-hover:[text-shadow:10px_12px_0_rgb(111_219_66/0.48)]"
                    >
                      0{i + 1}
                    </span>

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-mantis text-brand-forest shadow-[0_10px_30px_rgb(111_219_66/0.18)]">
                        <step.icon className="size-6" aria-hidden />
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-12">
                      <h3 className="text-2xl font-extrabold tracking-[-0.035em]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-brand-forest/60 sm:text-base">
                        {step.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>


      <SiteFooter
        brandName={brand}
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
