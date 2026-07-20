"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  HandCoins,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";

const values = [
  {
    icon: MessageCircle,
    title: "Direct by design",
    body: "The people making the decisions speak to the people doing the work — no agency layer in between.",
  },
  {
    icon: BadgeCheck,
    title: "Professional clarity",
    body: "Structured profiles, portfolios, and briefs make it easier to understand fit before the first call.",
  },
  {
    icon: ShieldCheck,
    title: "Trust matters",
    body: "Verification signals, moderation, and clear conversation trails support better hiring decisions.",
  },
] as const;

const proofStats = [
  {
    value: "0%",
    label: "Booking commission",
    detail: "We don't take a cut when you agree a deal.",
    icon: CircleDollarSign,
  },
  {
    value: "100%",
    label: "Kept by sellers",
    detail: "Talent keeps what they earn from the work.",
    icon: HandCoins,
  },
  {
    value: "Dubai",
    label: "Built for this market",
    detail: "Designed around how venues and events actually run here.",
    icon: MapPin,
  },
] as const;

const differentiators = [
  "No commission on bookings — subscriptions and managed services, not middleman fees.",
  "Structured seller profiles with portfolios, services, and trust signals buyers can compare.",
  "Direct messaging so briefs, questions, and scope stay between the right people.",
  "Categories built for hospitality, nightlife, events, and specialist trade — not generic gigs.",
  "White Glove for teams who want a managed path when the brief is complex or high-stakes.",
] as const;

const milestones = [
  {
    year: "Today",
    title: "Launching in Dubai",
    body: "We're opening the marketplace category by category, with verified sellers and real listings.",
  },
  {
    year: "Next",
    title: "Deeper discovery",
    body: "Smarter search, richer profiles, and more ways for buyers to post exactly what they need.",
  },
  {
    year: "Always",
    title: "Fairer economics",
    body: "Sellers keep their earnings. Buyers get transparency. Kattegat earns when the platform delivers value.",
  },
] as const;

export function AboutPageContent() {
  return (
    <>
      <section className="relative isolate overflow-x-clip border-b border-brand-forest/8 bg-white">
        <div aria-hidden className="marketing-section-bg">
          <div className="absolute -left-32 top-8 size-[22rem] rounded-full bg-brand-mantis/12 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-[20rem] rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container relative py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <Reveal>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Our mission
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                  Better connections create better work.
                </h2>
                <div className="mt-6 space-y-5 text-sm leading-7 text-brand-forest/65 sm:text-base sm:leading-8">
                  <p>
                    Hospitality moves quickly. Teams change, briefs evolve, and the right specialist
                    can determine whether an experience feels ordinary or exceptional.
                  </p>
                  <p>
                    Kattegat exists so buyers can discover capable people with clarity — while
                    sellers can present their work, access relevant demand, and keep the full value
                    of what they earn.
                  </p>
                  <p>
                    We&apos;re not trying to replace relationships. We&apos;re removing the friction,
                    opacity, and commission layers that get in the way of them.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={120}>
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_28px_70px_rgb(0_57_18/0.14)]">
                  <div className="relative aspect-[4/5] sm:aspect-[5/6]">
                    <Image
                      src="/assets/landing-slides/live-dj.jpg"
                      alt="Live DJ performance at a Dubai venue"
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/85 via-brand-forest/20 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
                      Dubai hospitality
                    </p>
                    <p className="mt-2 max-w-sm text-lg font-extrabold leading-snug tracking-[-0.03em] text-white sm:text-xl">
                      Where exceptional nights start with the right people in the room.
                    </p>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-4 sm:p-5">
                  <p className="text-2xl font-extrabold tracking-[-0.05em] text-brand-forest">
                    Direct
                  </p>
                  <p className="mt-1 text-sm font-bold leading-6 text-brand-forest/55">
                    Buyer ↔ seller — no agency in the middle
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-mantis px-4 py-14 sm:px-6 sm:py-18">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="proof-orbit absolute -right-24 -top-32 size-80 rounded-full border border-brand-forest/15" />
          <div className="proof-orbit-reverse absolute -bottom-40 -left-20 size-96 rounded-full border border-brand-forest/12" />
          <div className="proof-glow absolute left-[12%] top-8 size-56 rounded-full bg-white/35 blur-3xl" />
          <div className="proof-glow-reverse absolute right-[16%] top-20 size-64 rounded-full bg-brand-emerald/45 blur-3xl" />
          <span className="proof-particle absolute left-[8%] top-[42%] size-2 rounded-full bg-brand-forest/40" />
          <span className="proof-particle absolute right-[9%] top-[22%] size-3 rounded-full bg-white/65 [animation-delay:900ms]" />
          <div className="proof-sweep absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl" />
        </div>

        <div className="marketing-section-content marketing-container relative">
          <Reveal>
            <div className="mb-8 max-w-2xl sm:mb-10">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-forest/60">
                What we stand for
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-brand-forest sm:text-4xl">
                A marketplace that works for both sides.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {proofStats.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.label} delayMs={index * 60} className="h-full">
                  <article className="group h-full rounded-[1.5rem] border border-brand-forest/10 bg-white/75 p-6 shadow-[0_16px_45px_rgb(0_57_18/0.1)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-none tracking-[-0.06em] text-brand-forest">
                        {item.value}
                      </p>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-brand-mantis transition group-hover:rotate-3">
                        <Icon className="size-5" aria-hidden />
                      </span>
                    </div>
                    <h3 className="mt-6 text-base font-extrabold tracking-[-0.02em] text-brand-forest sm:text-lg">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-brand-forest/60">{item.detail}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-x-clip bg-[#F7F9F8] py-16 sm:py-24">
        <div aria-hidden className="marketing-section-bg">
          <div className="category-grid absolute inset-0 opacity-35" />
          <div className="absolute -left-24 top-12 size-72 rounded-full bg-brand-mantis/15 blur-3xl" />
          <div className="absolute -right-20 bottom-8 size-80 rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Our values
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                How we build Kattegat
              </h2>
              <p className="mt-4 text-sm leading-7 text-brand-forest/60 sm:text-base">
                Principles that shape every product decision — from profiles to messaging to how we
                earn.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delayMs={index * 80} className="h-full">
                  <article className="group h-full rounded-[1.75rem] border border-brand-forest/8 bg-white p-7 shadow-[0_16px_50px_rgb(0_57_18/0.07)] transition duration-300 hover:-translate-y-1 hover:border-brand-mantis/40 hover:shadow-[0_22px_55px_rgb(0_57_18/0.1)] sm:p-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue transition group-hover:bg-brand-forest group-hover:text-brand-mantis">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-8 text-xl font-extrabold tracking-[-0.03em]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-brand-forest/60">{item.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-x-clip border-y border-brand-forest/8 bg-white py-16 sm:py-24">
        <div aria-hidden className="marketing-section-bg">
          <div className="absolute -inset-x-[15%] top-[40%] h-[50%] -translate-y-1/2 skew-y-[-3deg] bg-[#F7F9F8]" />
          <div className="absolute -left-20 top-16 size-64 rounded-full bg-brand-mantis/12 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container relative">
          <Reveal>
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Who we build for
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                Two sides of the same exceptional night.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <Reveal delayMs={40}>
              <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-forest p-8 text-white shadow-[0_24px_60px_rgb(0_57_18/0.2)] sm:p-10 lg:-skew-y-1 lg:transition lg:duration-500 lg:hover:-skew-y-0.5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 top-0 h-full w-20 skew-x-[-12deg] bg-brand-mantis/10"
                />
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-brand-mantis">
                  <BriefcaseBusiness className="size-6" />
                </span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                  Venues & planners
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                  Hotels, restaurants, nightlife, private events, and brand activations — find
                  specialists who understand your pace and your standards.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Browse by category or search across listings",
                    "Compare portfolios before you reach out",
                    "Message directly — no gatekeeper",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-mantis" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delayMs={100}>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white p-8 shadow-[0_20px_55px_rgb(0_57_18/0.08)] sm:p-10 lg:skew-y-1 lg:transition lg:duration-500 lg:hover:skew-y-0.5">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
                  <Users className="size-6" />
                </span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                  Talent & sellers
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-brand-forest/60">
                  DJs, hosts, consultants, fit-out teams, and specialist trades — present your work
                  professionally and keep what you earn.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Structured profiles with services and portfolio",
                    "Inbound demand from relevant buyers",
                    "No commission taken from your bookings",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-brand-forest/75">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-blue" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="marketing-section-content marketing-container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Why Kattegat
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  Not another directory. A direct marketplace.
                </h2>
                <p className="mt-4 text-sm leading-7 text-brand-forest/60 sm:text-base">
                  We built Kattegat around how hospitality and events teams actually hire — fast,
                  visually, and with confidence in who they&apos;re speaking to.
                </p>
                <ul className="mt-8 space-y-4">
                  {differentiators.map((item) => (
                    <li
                      key={item}
                      className="flex gap-4 rounded-2xl border border-brand-forest/8 bg-white p-4 shadow-[0_8px_28px_rgb(0_57_18/0.05)] transition hover:border-brand-mantis/35"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-mantis/20 text-brand-forest">
                        <Sparkles className="size-4" />
                      </span>
                      <p className="text-sm font-medium leading-6 text-brand-forest/75">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delayMs={100}>
              <div className="relative">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Where we&apos;re headed
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  Early, focused, and building in the open.
                </h2>
                <div className="relative mt-8 space-y-0">
                  <div
                    aria-hidden
                    className="absolute bottom-4 left-[1.125rem] top-4 w-px bg-gradient-to-b from-brand-mantis via-brand-blue/40 to-transparent"
                  />
                  {milestones.map((item, index) => (
                    <div key={item.title} className="relative flex gap-5 pb-8 last:pb-0">
                      <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-mantis bg-white text-[10px] font-extrabold uppercase tracking-wide text-brand-forest">
                        {index + 1}
                      </span>
                      <div className="glass-panel flex-1 rounded-2xl p-5 sm:p-6">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                          {item.year}
                        </p>
                        <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-brand-forest/60">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-forest/8 bg-brand-forest px-4 py-16 sm:px-6 sm:py-20">
        <div className="marketing-section-content marketing-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-forest via-[#0a2f1c] to-brand-blue p-8 sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-mantis/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-brand-emerald/15 blur-3xl" />
              </div>
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-mantis">
                    Join us
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">
                    Ready to see what direct looks like?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
                    Browse live listings, explore how Kattegat works, or get in touch — we&apos;d
                    love to hear from venues, planners, and sellers across Dubai.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[15rem]">
                  <Link
                    href="/search"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest transition hover:bg-brand-emerald"
                  >
                    Browse marketplace
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-forest"
                  >
                    How it works
                    <ArrowUpRight className="size-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 text-center text-sm font-extrabold text-white/80 transition hover:text-white"
                  >
                    Contact the team
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

