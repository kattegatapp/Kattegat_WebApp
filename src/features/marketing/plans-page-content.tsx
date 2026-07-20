"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Crown,
  HandCoins,
  MessageCircle,
  Rocket,
  Smartphone,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Reveal } from "@/components/motion/reveal";
import { formatFilsAsAed } from "@/lib/admin/money";
import type { PublicPlanFeatures, PublicSellerTier } from "@/lib/api/plans";
import { cn } from "@/lib/utils";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function subscribe() {
  return () => undefined;
}

const TIER_META: Record<
  PublicSellerTier,
  {
    icon: LucideIcon;
    name: string;
    eyebrow: string;
    pitch: string;
    cta: string;
    ctaHref: string;
    featured?: boolean;
    card: string;
    iconBox: string;
    priceNote?: string;
  }
> = {
  starter: {
    icon: Rocket,
    name: "Starter",
    eyebrow: "Free to start",
    pitch: "Build your profile, publish services, and start receiving relevant enquiries through Kattegat.",
    cta: "Get the app",
    ctaHref: "/download",
    card: "border-brand-forest/10 bg-white",
    iconBox: "bg-brand-forest/8 text-brand-forest",
    priceNote: "No booking commission",
  },
  pro: {
    icon: Sparkles,
    name: "Pro",
    eyebrow: "Grow faster",
    pitch: "Stronger discovery, direct chat, reviews, and the tools active sellers use every week.",
    cta: "Get started",
    ctaHref: "/plans/checkout",
    featured: true,
    card: "border-brand-mantis/35 bg-white shadow-[0_22px_60px_rgb(0_57_18/0.12)] lg:-translate-y-2",
    iconBox: "bg-brand-mantis text-brand-forest",
    priceNote: "Billed monthly · cancel anytime",
  },
  white_glove: {
    icon: Crown,
    name: "White Glove",
    eyebrow: "Managed service",
    pitch: "A curated, hands-on path for complex briefs, premium positioning, and high-stakes work.",
    cta: "Talk to our team",
    ctaHref: "/contact",
    card: "border-amber-200/80 bg-[#fffdf8]",
    iconBox: "bg-amber-500 text-white",
    priceNote: "Tailored to your service",
  },
};

const HIGHLIGHTS = [
  {
    icon: CircleDollarSign,
    title: "0% booking commission",
    body: "Kattegat does not take a cut when you agree a deal.",
  },
  {
    icon: HandCoins,
    title: "Keep what you earn",
    body: "Subscriptions and managed services — not middleman fees.",
  },
  {
    icon: MessageCircle,
    title: "Direct relationships",
    body: "Pro and White Glove sellers connect with buyers without an agency layer.",
  },
] as const;

function formatLimit(value: number | null, singular: string, plural: string) {
  if (value == null) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

function planPriceLabel(plan: PublicPlanFeatures) {
  if (plan.tier === "starter") return "Free";
  if (plan.tier === "white_glove") return "Managed";
  if (plan.monthlyPriceFils != null) return formatFilsAsAed(plan.monthlyPriceFils);
  return "Coming soon";
}

function planPriceSuffix(plan: PublicPlanFeatures) {
  if (plan.tier === "pro" && plan.monthlyPriceFils != null) return "/ month";
  if (plan.tier === "white_glove") return "pricing";
  return null;
}

function planFeatures(plan: PublicPlanFeatures) {
  const items = [
    formatLimit(plan.maxListings, "active listing", "active listings"),
    formatLimit(plan.maxPhotosPerListing, "photo per listing", "photos per listing"),
    formatLimit(plan.maxVideoLinksPerListing, "video link", "video links"),
    formatLimit(plan.maxProfileMedia, "profile media item", "profile media items"),
    plan.canChatDirectly ? "Direct buyer chat" : "Enquiries via Kattegat Vetted",
    plan.canReceiveReviews ? "Collect reviews on profile" : "Reviews not included",
    plan.socialLinkOut ? "Social link-out on profile" : "No social link-out",
    plan.prioritySearch ? "Priority in search results" : "Standard search placement",
  ];

  return items;
}

type PlansPageContentProps = {
  plans: PublicPlanFeatures[];
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
};

function StarterAppCta({
  appStoreUrl,
  playStoreUrl,
  className,
}: {
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  className?: string;
}) {
  const platform = useSyncExternalStore(subscribe, detectPlatform, () => "other" as Platform);

  if (platform === "ios" && appStoreUrl) {
    return (
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        Download on the App Store
        <Smartphone className="size-4" />
      </a>
    );
  }

  if (platform === "android" && playStoreUrl) {
    return (
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        Get it on Google Play
        <Smartphone className="size-4" />
      </a>
    );
  }

  return (
    <Link href="/download" className={className}>
      Get the app — it&apos;s free
      <ArrowRight className="size-4" />
    </Link>
  );
}

export function PlansPageContent({
  plans,
  appStoreUrl = null,
  playStoreUrl = null,
}: PlansPageContentProps) {
  return (
    <>
      <section className="relative isolate overflow-x-clip border-b border-brand-forest/8 bg-white">
        <div aria-hidden className="marketing-section-bg">
          <div className="absolute -left-32 top-8 size-[22rem] rounded-full bg-brand-mantis/12 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-[20rem] rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container py-12 sm:py-16">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-brand-forest/8 bg-white p-5 shadow-[0_10px_35px_rgb(0_57_18/0.06)]"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-mantis/20 text-brand-forest">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-base font-extrabold tracking-[-0.02em]">{item.title}</h2>
                    <p className="mt-1.5 text-sm leading-6 text-brand-forest/60">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-x-clip bg-[#F7F9F8] py-14 sm:py-20">
        <div aria-hidden className="marketing-section-bg">
          <div className="category-grid absolute inset-0 opacity-25" />
          <div className="absolute -right-20 top-16 size-72 rounded-full bg-brand-mantis/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Compare plans
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                Start free. Upgrade when you&apos;re ready to scale.
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-forest/60 sm:text-base">
                Every plan is built around the same principle: you keep what you earn from the work.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6">
            {plans.map((plan, index) => {
              const meta = TIER_META[plan.tier];
              const Icon = meta.icon;
              const features = planFeatures(plan);
              const suffix = planPriceSuffix(plan);

              return (
                <Reveal key={plan.tier} delayMs={index * 60} className="h-full">
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-[1.75rem] border p-6 sm:p-7",
                      meta.card,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-2xl",
                          meta.iconBox,
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      {meta.featured ? (
                        <span className="rounded-full bg-brand-mantis px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-forest">
                          Most popular
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                      {meta.eyebrow}
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">{meta.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-brand-forest/65">{meta.pitch}</p>

                    <div className="mt-6 border-t border-brand-forest/8 pt-6">
                      <p className="text-3xl font-extrabold tracking-[-0.04em] text-brand-forest">
                        {planPriceLabel(plan)}
                        {suffix ? (
                          <span className="ml-1 text-sm font-bold text-brand-forest/45">{suffix}</span>
                        ) : null}
                      </p>
                      {meta.priceNote ? (
                        <p className="mt-1 text-xs font-semibold text-brand-forest/50">{meta.priceNote}</p>
                      ) : null}
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((feature) => {
                        const included = !feature.startsWith("No ") && !feature.includes("not included") && !feature.includes("via Kattegat Vetted") && !feature.includes("Standard search");
                        return (
                          <li key={feature} className="flex items-start gap-3 text-sm leading-6">
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                                included
                                  ? "bg-brand-mantis/20 text-brand-forest"
                                  : "bg-brand-forest/6 text-brand-forest/35",
                              )}
                            >
                              {included ? (
                                <Check className="size-3" aria-hidden />
                              ) : (
                                <X className="size-3" aria-hidden />
                              )}
                            </span>
                            <span className={included ? "text-brand-forest/80" : "text-brand-forest/45"}>
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {plan.tier === "starter" ? (
                      <StarterAppCta
                        appStoreUrl={appStoreUrl}
                        playStoreUrl={playStoreUrl}
                        className={cn(
                          "mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-forest/12 bg-white px-5 text-sm font-extrabold text-brand-forest transition hover:border-brand-mantis/50",
                        )}
                      />
                    ) : (
                      <Link
                        href={meta.ctaHref}
                        className={cn(
                          "mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition",
                          meta.featured
                            ? "bg-brand-mantis text-brand-forest hover:bg-brand-forest hover:text-white"
                            : "border border-brand-forest/12 bg-white text-brand-forest hover:border-brand-mantis/50",
                        )}
                      >
                        {meta.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-brand-forest/8 bg-white py-14 sm:py-18">
        <div className="marketing-section-content marketing-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Feature comparison
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                  What changes as you move up?
                </h2>
                <p className="mt-3 text-sm leading-7 text-brand-forest/60 sm:text-base">
                  Starter is designed for getting visible. Pro unlocks direct conversations and stronger
                  discovery. White Glove is for sellers who want Kattegat to operate alongside them.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={80}>
              <div className="overflow-x-auto rounded-[1.75rem] border border-brand-forest/10 bg-[#F7F9F8]">
                <table className="min-w-[34rem] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-forest/10 bg-white">
                      <th className="px-4 py-4 font-extrabold text-brand-forest">Capability</th>
                      {plans.map((plan) => (
                        <th key={plan.tier} className="px-4 py-4 font-extrabold text-brand-forest">
                          {TIER_META[plan.tier].name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ["Direct chat", (p: PublicPlanFeatures) => p.canChatDirectly] as const,
                      ["Reviews", (p: PublicPlanFeatures) => p.canReceiveReviews] as const,
                      ["Social link-out", (p: PublicPlanFeatures) => p.socialLinkOut] as const,
                      ["Priority search", (p: PublicPlanFeatures) => p.prioritySearch] as const,
                    ] satisfies readonly [string, (p: PublicPlanFeatures) => boolean][]).map(([label, getter]) => (
                      <tr key={label} className="border-b border-brand-forest/8">
                        <td className="px-4 py-3 font-semibold text-brand-forest/75">{label}</td>
                        {plans.map((plan) => {
                          const on = getter(plan);
                          return (
                            <td key={plan.tier} className="px-4 py-3">
                              {on ? (
                                <span className="inline-flex items-center gap-1 font-bold text-brand-forest">
                                  <BadgeCheck className="size-4 text-brand-mantis" />
                                  Included
                                </span>
                              ) : (
                                <span className="text-brand-forest/35">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/faq"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-forest/12 bg-white px-5 text-sm font-extrabold transition hover:border-brand-mantis/50 sm:w-auto"
            >
              Read seller FAQs
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-forest px-5 text-sm font-extrabold text-white transition hover:bg-brand-blue sm:w-auto"
            >
              Ask about White Glove
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
