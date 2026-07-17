import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroCarousel } from "@/features/marketing/hero-carousel";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import type { PublicAppSettings } from "@/lib/api/settings";
import { cn } from "@/lib/utils";

type ProductHomeProps = { settings: PublicAppSettings };

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
    body: "Compare profiles and speak directly with providers.",
  },
  {
    icon: BadgeCheck,
    title: "Work together",
    body: "Agree the details. No booking commission in the middle.",
  },
] as const;

export function ProductHome({ settings }: ProductHomeProps) {
  const brand = settings.brand.siteName || "Kattegat";

  return (
    <main className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      {/* Soft brand atmosphere — not purple, not dark */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[28rem] rounded-full bg-brand-mantis/20 blur-3xl" />
        <div className="absolute right-0 top-40 size-[22rem] rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-brand-emerald/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-brand-forest/5 bg-[#F7F9F8]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <MarketingHeader
            tone="light"
            brandName={brand}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
        </div>
      </header>

      {/* Hero — type first, photography as the stage */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-brand-blue">
            Dubai · Entertainment · Hospitality
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,7vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.055em] text-balance">
            Hire talent.
            <br />
            Keep the relationship.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-brand-forest/60 sm:text-lg sm:leading-8">
            {brand} is the marketplace where venues and providers meet directly —
            without agency commission on the booking.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-2xl bg-brand-forest px-7 text-sm font-extrabold text-white hover:bg-brand-blue",
              )}
            >
              Explore services
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-2xl border-brand-forest/15 bg-white/70 px-6 text-sm font-extrabold hover:bg-white",
              )}
            >
              How it works
            </Link>
          </div>

          <form
            action="/services"
            className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-brand-forest/10 bg-white p-1.5 shadow-[0_16px_50px_rgb(0_57_18/0.08)]"
          >
            <Search className="ml-3 size-4 shrink-0 text-brand-forest/35" aria-hidden />
            <Input
              name="q"
              aria-label="Search services"
              placeholder="Search DJs, hosts, consultants…"
              className="h-10 border-0 bg-transparent text-sm font-semibold shadow-none placeholder:text-brand-forest/35 focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="h-10 shrink-0 rounded-xl bg-brand-mantis px-4 font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="mt-12 sm:mt-14">
          <HeroCarousel className="aspect-[16/10] min-h-[18rem] shadow-[0_28px_80px_rgb(0_57_18/0.16)] sm:min-h-[24rem] lg:min-h-[30rem]" />
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-brand-forest/8 bg-white/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-brand-forest/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["0%", "Booking commission"],
            ["100%", "Kept by providers"],
            ["Dubai", "Built for this market"],
          ].map(([value, label]) => (
            <div key={label} className="px-6 py-8 text-center sm:py-10">
              <p className="text-3xl font-extrabold tracking-[-0.04em] text-brand-forest sm:text-4xl">
                {value}
              </p>
              <p className="mt-2 text-sm font-semibold text-brand-forest/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
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
      </section>

      {/* Audience */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
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
                  "Talk directly to providers",
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
                For talent & providers
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
                Join as a provider
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
            How it works
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
            Three steps. No middleman.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delayMs={i * 60}>
              <div className="rounded-[1.5rem] border border-brand-forest/10 bg-white p-7 shadow-[0_10px_40px_rgb(0_57_18/0.04)]">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-mantis/20">
                  <step.icon className="size-5 text-brand-forest" />
                </div>
                <p className="mt-8 text-xs font-extrabold text-brand-forest/30">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-forest/55">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 overflow-hidden rounded-[2rem] bg-brand-forest px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                Ready when the brief is.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/60 sm:text-base">
                Explore services, learn the flow, or reach out if you want to
                join as a venue or provider.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className={cn(
                  buttonVariants(),
                  "h-12 rounded-2xl bg-brand-mantis px-6 font-extrabold text-brand-forest hover:bg-white",
                )}
              >
                Explore services
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 rounded-2xl border-white/25 bg-transparent px-6 font-extrabold text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Contact us
              </Link>
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
