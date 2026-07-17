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
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { HeroCarousel } from "@/features/marketing/hero-carousel";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import type { PublicAppSettings } from "@/lib/api/settings";
import type { FeaturedSeller } from "@/lib/api/marketing";
import { cn } from "@/lib/utils";

type ProductHomeProps = {
  settings: PublicAppSettings;
  featuredSellers?: FeaturedSeller[];
};

const categories = [
  {
    title: "Entertainment",
    image: "/assets/service-categories/entertainment-services.png",
  },
  {
    title: "Event management",
    image: "/assets/service-categories/event-management.png",
  },
  {
    title: "Restaurant consultancy",
    image: "/assets/service-categories/restaurant-consultancy.png",
  },
  {
    title: "Marketing",
    image: "/assets/service-categories/marketing-services.png",
  },
  {
    title: "Fit-out",
    image: "/assets/service-categories/fit-out-subcontractor.png",
  },
  {
    title: "Shisha outsourcing",
    image: "/assets/service-categories/shisha-outsourcing.png",
  },
  {
    title: "Tailoring",
    image: "/assets/service-categories/tailor-services.png",
  },
  {
    title: "Lead generation",
    image: "/assets/service-categories/lead-generation.png",
  },
] as const;

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
  if (tier === "pro") return "Pro seller";
  return "Kattegat seller";
}

export function ProductHome({ settings, featuredSellers = [] }: ProductHomeProps) {
  const brand = settings.brand.siteName || "Kattegat";

  return (
    <main className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      {/* Soft brand atmosphere — not purple, not dark */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[28rem] rounded-full bg-brand-mantis/20 blur-3xl" />
        <div className="absolute right-0 top-40 size-[22rem] rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-brand-emerald/15 blur-3xl" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader
            tone="light"
            brandName={brand}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
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
                href="/services"
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
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                Categories that fill a night.
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-forest hover:text-brand-blue"
            >
              All services
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((category, i) => (
            <Reveal key={category.title} delayMs={i * 30}>
              <Link
                href={`/services?q=${encodeURIComponent(category.title)}`}
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
                  href={`/services?q=${encodeURIComponent(category.title)}`}
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

      {/* Featured sellers — real backend discovery data only. */}
      {featuredSellers.length ? (
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">Featured sellers</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">Meet people ready to work.</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-forest/60 sm:text-lg">
                  Real sellers with live services, selected from Kattegat&apos;s marketplace discovery feed.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredSellers.map((seller, index) => (
                <Reveal key={seller.id} delayMs={index * 50}>
                  <article className="group h-full overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white shadow-[0_16px_50px_rgb(0_57_18/0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgb(0_57_18/0.13)]">
                    <div
                      className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-forest to-brand-blue bg-cover bg-center text-3xl font-extrabold text-brand-mantis"
                      style={seller.avatarUrl ? { backgroundImage: `url(${JSON.stringify(seller.avatarUrl)})` } : undefined}
                    >
                      {!seller.avatarUrl ? sellerInitials(seller.name) : null}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-brand-mantis/18 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
                          {sellerTierLabel(seller.tier)}
                        </span>
                        {seller.rating > 0 ? (
                          <span className="flex items-center gap-1 text-xs font-bold">
                            <Star className="size-3.5 fill-brand-mantis text-brand-mantis" /> {seller.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 truncate text-lg font-extrabold">{seller.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-brand-blue">{seller.category || "Dubai services"}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-brand-forest/55">{seller.service}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Audience */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
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

          <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-[1.75rem] bg-brand-forest p-8 text-white sm:p-10">
              <BriefcaseBusiness className="size-7 text-brand-mantis" />
              <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">
                For venues & planners
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Find the right people for private events, nightlife, hotels, and
                brand activations — without the agency maze.
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
          </Reveal>

          <Reveal delayMs={70}>
            <div className="flex h-full flex-col rounded-[1.75rem] bg-brand-mantis p-8 text-brand-forest sm:p-10">
              <Users className="size-7" />
              <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">
                For talent & sellers
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-forest/70">
                Show your craft, get relevant demand, and keep what you earn.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Build a service-led profile",
                  "Access marketplace demand",
                  "Keep 100% of your booking fee",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-bold">
                    <Check className="mt-0.5 size-4 shrink-0" />
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

      {/* App download */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-brand-forest px-8 py-10 text-white sm:px-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
            <div aria-hidden className="absolute -right-24 -top-28 size-80 rounded-full border border-brand-mantis/20" />
            <div aria-hidden className="absolute bottom-0 right-1/4 size-56 rounded-full bg-brand-blue/40 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-mantis">Kattegat in your pocket</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                Find the right connection wherever the work happens.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-lg sm:leading-8">
                Discover services, review sellers, and continue the conversation from the Kattegat app.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {settings.links.appStoreUrl ? (
                  <a href={settings.links.appStoreUrl} target="_blank" rel="noopener noreferrer">
                    <Image src="/brand/stores/app-store-badge.svg" alt="Download on the App Store" width={150} height={50} className="h-12 w-auto" />
                  </a>
                ) : null}
                {settings.links.playStoreUrl ? (
                  <a href={settings.links.playStoreUrl} target="_blank" rel="noopener noreferrer">
                    <Image src="/brand/stores/google-play-badge.png" alt="Get it on Google Play" width={170} height={66} className="h-[3.6rem] w-auto" />
                  </a>
                ) : null}
                {settings.links.mobileAppUrl ? (
                  <a href={settings.links.mobileAppUrl} className="text-sm font-extrabold text-brand-mantis underline underline-offset-4 hover:text-white">Open installed app</a>
                ) : null}
                {!settings.links.appStoreUrl && !settings.links.playStoreUrl ? (
                  <Link href="/contact" className={cn(buttonVariants(), "h-12 rounded-2xl bg-brand-mantis px-6 font-extrabold text-brand-forest hover:bg-white")}>Get launch updates</Link>
                ) : null}
              </div>
            </div>
            <div className="relative mt-10 hidden size-44 items-center justify-center rounded-[2.5rem] border border-white/15 bg-white/8 shadow-[0_24px_70px_rgb(0_0_0/0.2)] backdrop-blur-md lg:flex">
              <Smartphone className="size-20 text-brand-mantis" strokeWidth={1.35} aria-hidden />
              <span className="absolute -right-3 -top-3 flex size-12 items-center justify-center rounded-2xl bg-brand-mantis text-brand-forest shadow-xl">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter
        brandName={brand}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
