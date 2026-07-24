"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Crown,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
  AccountGlass,
  AccountViewWrap,
  SectionHeading,
} from "@/features/account/account-shared";
import type { AccountDashboard } from "@/lib/api/account";
import { fetchIdentityVerificationStatus } from "@/lib/api/account-verification";
import { MoneyText } from "@/components/currency";
import { formatFilsAsAed } from "@/lib/admin/money";
import {
  DEFAULT_PUBLIC_PLANS,
  getPublicPlanFeatures,
  type PublicPlanFeatures,
  type PublicSellerTier,
} from "@/lib/api/plans";
import { normalizeSellerTier, sellerPlanAccess } from "@/lib/auth/member-access";
import type { AccountFeatureFlags } from "@/lib/chat/chat-access";
import { cn } from "@/lib/utils";

type AccountMembershipViewProps = {
  dashboard: AccountDashboard;
  features?: Pick<AccountFeatureFlags, "paymentsEnabled">;
};

const TIER_META: Record<
  PublicSellerTier,
  {
    icon: LucideIcon;
    name: string;
    eyebrow: string;
    pitch: string;
    accent: string;
    iconBox: string;
  }
> = {
  starter: {
    icon: Rocket,
    name: "Starter",
    eyebrow: "Free to start",
    pitch: "Publish services and receive enquiries through Kattegat Vetted.",
    accent: "border-brand-forest/10 bg-white",
    iconBox: "bg-brand-forest/8 text-brand-forest",
  },
  pro: {
    icon: Sparkles,
    name: "Pro",
    eyebrow: "Grow faster",
    pitch: "Direct chat, priority discovery, reviews, and stronger placement.",
    accent: "border-brand-mantis/35 bg-gradient-to-b from-brand-mantis/8 to-white",
    iconBox: "bg-brand-mantis text-brand-forest",
  },
  white_glove: {
    icon: Crown,
    name: "White Glove",
    eyebrow: "Managed service",
    pitch: "Done-for-you listings, conversations, and premium positioning.",
    accent: "border-amber-200/80 bg-gradient-to-b from-amber-50 to-white",
    iconBox: "bg-amber-500 text-white",
  },
};

function formatLimit(value: number | null, singular: string, plural: string) {
  if (value == null) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

function planPrice(plan: PublicPlanFeatures) {
  if (plan.tier === "starter") return { label: "Free", suffix: null as string | null };
  if (plan.tier === "white_glove") return { label: "Managed", suffix: "custom pricing" };
  if (plan.monthlyPriceFils != null) {
    return { label: formatFilsAsAed(plan.monthlyPriceFils), suffix: "/ month" };
  }
  return { label: "Coming soon", suffix: null };
}

function planFeatureRows(plan: PublicPlanFeatures) {
  return [
    { label: formatLimit(plan.maxListings, "active listing", "active listings"), included: true },
    {
      label: formatLimit(plan.maxPhotosPerListing, "photo per listing", "photos per listing"),
      included: true,
    },
    {
      label: plan.canChatDirectly ? "Direct buyer chat" : "Enquiries via Kattegat Vetted",
      included: plan.canChatDirectly,
    },
    {
      label: plan.prioritySearch ? "Priority in search" : "Standard search placement",
      included: plan.prioritySearch,
    },
    {
      label: plan.canReceiveReviews ? "Collect reviews" : "Reviews not included",
      included: plan.canReceiveReviews,
    },
    {
      label: plan.socialLinkOut ? "Social links on profile" : "No social link-out",
      included: plan.socialLinkOut,
    },
  ];
}

function currentPlanSummary(tier: PublicSellerTier, access: PublicPlanFeatures) {
  const unlocked: string[] = [];
  if (access.canChatDirectly) unlocked.push("Direct chat");
  else unlocked.push("Vetted inquiry routing");
  if (access.prioritySearch) unlocked.push("Priority search");
  if (access.canReceiveReviews) unlocked.push("Reviews");
  unlocked.push(formatLimit(access.maxListings, "listing", "listings"));
  return unlocked;
}

export function AccountMembershipView({ dashboard, features }: AccountMembershipViewProps) {
  const currentTier = normalizeSellerTier(dashboard.sellerProfile?.tier);
  const plansQuery = useQuery({
    queryKey: ["catalog", "plan-features"],
    queryFn: getPublicPlanFeatures,
    staleTime: 300_000,
  });
  const plans = plansQuery.data?.length ? plansQuery.data : DEFAULT_PUBLIC_PLANS;
  const access = sellerPlanAccess(currentTier, plans);
  const meta = TIER_META[currentTier];
  const CurrentIcon = meta.icon;
  const price = planPrice(access);
  const summary = currentPlanSummary(currentTier, access);
  const paymentsEnabled = features?.paymentsEnabled !== false;

  const verificationQuery = useQuery({
    queryKey: ["account", "identity-verification"],
    queryFn: fetchIdentityVerificationStatus,
    enabled: Boolean(dashboard.user.sid),
  });
  const verification = verificationQuery.data;
  const showVerifyNudge =
    currentTier !== "starter" &&
    verification &&
    verification.status !== "verified";

  return (
    <AccountViewWrap>
      <SectionHeading title="Membership" />
      <p className="mb-5 max-w-2xl text-[14px] leading-7 text-brand-forest/65">
        Your seller plan controls chat, discovery, and listing limits. Upgrade on web — the mobile
        app stays focused on booking, not billing.
      </p>
      {!paymentsEnabled ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Plan purchases are temporarily unavailable. You can still review what each plan includes.
        </p>
      ) : null}

      {/* Current plan hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-brand-forest/10 bg-gradient-to-br from-brand-forest via-[#0a2e1a] to-brand-blue p-5 text-white sm:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand-mantis/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-mantis">
              Current plan
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/12">
                <CurrentIcon className="size-5 text-brand-mantis" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                  {meta.name}
                </h2>
                <p className="mt-0.5 text-sm text-white/70">
                  <MoneyText>{price.label}</MoneyText>
                  {price.suffix ? ` ${price.suffix}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75">{meta.pitch}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-white/90"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentTier === "starter" && paymentsEnabled ? (
              <Link
                href="/plans/checkout"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
              >
                Upgrade to Pro
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
            {currentTier === "pro" ? (
              <>
                <Link
                  href="/billing"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
                >
                  <CreditCard className="size-4" />
                  Manage subscription
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Talk about White Glove
                </Link>
              </>
            ) : null}
            {paymentsEnabled && currentTier !== "pro" ? (
              <Link
                href="/billing"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-5 text-sm font-bold text-white/90 transition hover:bg-white/10"
              >
                <CreditCard className="size-4" />
                Billing
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {showVerifyNudge ? (
        <AccountGlass className="mt-4 rounded-[1.25rem] border-amber-200/70 bg-amber-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-forest">
                  {verification?.status === "pending"
                    ? "Identity verification in review"
                    : verification?.status === "rejected"
                      ? "Identity verification needs an update"
                      : "Complete identity verification"}
                </p>
                <p className="mt-0.5 text-[13px] text-brand-forest/65">
                  Verified sellers earn more trust on public profiles and premium flows.
                </p>
              </div>
            </div>
            <Link
              href="/account?view=verification"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-brand-forest px-4 text-sm font-bold text-white"
            >
              {verification?.status === "pending" ? "Check status" : "Verify identity"}
            </Link>
          </div>
        </AccountGlass>
      ) : null}

      {/* Plan cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const planMeta = TIER_META[plan.tier];
          const Icon = planMeta.icon;
          const isCurrent = plan.tier === currentTier;
          const planCost = planPrice(plan);
          const features = planFeatureRows(plan);
          const isFeatured = plan.tier === "pro";

          return (
            <article
              key={plan.tier}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-[1.35rem] border p-5 shadow-sm",
                planMeta.accent,
                isCurrent && "ring-2 ring-brand-mantis/40",
                isFeatured && !isCurrent && "lg:-translate-y-1",
              )}
            >
              {isFeatured ? (
                <span className="absolute right-4 top-4 rounded-full bg-brand-mantis/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-forest">
                  Popular
                </span>
              ) : null}

              <div className="flex items-start gap-3">
                <span className={cn("grid size-11 place-items-center rounded-2xl", planMeta.iconBox)}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {planMeta.eyebrow}
                  </p>
                  <h3 className="mt-0.5 text-xl font-extrabold text-brand-forest">{planMeta.name}</h3>
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-brand-forest">
                  <MoneyText>{planCost.label}</MoneyText>
                </span>
                {planCost.suffix ? (
                  <span className="text-sm text-muted-foreground">{planCost.suffix}</span>
                ) : null}
              </div>
              <p className="mt-2 text-[13px] leading-5 text-brand-forest/65">{planMeta.pitch}</p>

              {isCurrent ? (
                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-mantis/35 bg-brand-mantis/15 px-3 py-1 text-[11px] font-bold text-brand-forest">
                  <BadgeCheck className="size-3.5" />
                  Your plan
                </span>
              ) : null}

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2 text-[13px]">
                    {feature.included ? (
                      <Check className="mt-0.5 size-3.5 shrink-0 text-brand-emerald" />
                    ) : (
                      <X className="mt-0.5 size-3.5 shrink-0 text-brand-forest/25" />
                    )}
                    <span
                      className={cn(
                        feature.included ? "text-brand-forest/75" : "text-brand-forest/40",
                      )}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <span className="inline-flex w-full items-center justify-center rounded-xl border border-brand-forest/10 py-2.5 text-sm font-bold text-brand-forest/55">
                    Current plan
                  </span>
                ) : plan.tier === "pro" && paymentsEnabled ? (
                  <Link
                    href="/plans/checkout"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-mantis py-2.5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
                  >
                    Upgrade to Pro
                    <ArrowRight className="size-4" />
                  </Link>
                ) : plan.tier === "pro" ? (
                  <span className="inline-flex w-full items-center justify-center rounded-xl border border-brand-forest/10 py-2.5 text-sm font-bold text-brand-forest/55">
                    Checkout unavailable
                  </span>
                ) : plan.tier === "white_glove" ? (
                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                  >
                    <Crown className="size-3.5" />
                    Request White Glove
                  </Link>
                ) : (
                  <span className="inline-flex w-full items-center justify-center rounded-xl border border-brand-forest/10 py-2.5 text-sm font-bold text-brand-forest/55">
                    Included free
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Why upgrade */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: MessageCircle,
            title: "Direct relationships",
            body: "Pro unlocks buyer chat without routing every enquiry through Vetted.",
          },
          {
            icon: Star,
            title: "Stronger discovery",
            body: "Priority search and reviews help serious buyers find you faster.",
          },
          {
            icon: Crown,
            title: "White Glove when needed",
            body: "For high-stakes work, Kattegat can manage listings and conversations for you.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <AccountGlass key={item.title} className="rounded-[1.2rem] p-4">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-forest/5 text-brand-forest">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-bold text-brand-forest">{item.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{item.body}</p>
            </AccountGlass>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-brand-forest/10 bg-white px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-bold text-brand-forest">Compare full plan details</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Public pricing page with feature matrix and checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/plans"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-brand-forest/15 bg-white px-4 text-sm font-bold text-brand-forest transition hover:bg-brand-forest/5"
          >
            View plans
          </Link>
          <Link
            href="/billing"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand-forest px-4 text-sm font-bold text-white transition hover:brightness-110"
          >
            <CreditCard className="size-4" />
            Manage billing
          </Link>
        </div>
      </div>
    </AccountViewWrap>
  );
}
