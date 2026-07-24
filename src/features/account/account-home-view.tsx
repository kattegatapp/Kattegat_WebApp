"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  ExternalLink,
  FileCheck2,
  Heart,
  LayoutDashboard,
  Link2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  AccountAvatar,
  IdChip,
  SectionHeading,
  accountDisplayName,
} from "@/features/account/account-shared";
import { CompetitionDashboardBanner } from "@/features/account/competition-dashboard-banner";
import { BUYER_HOME_PROMOS, SELLER_HOME_PROMOS } from "@/features/account/home-promo";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AccountDashboard } from "@/lib/api/account";
import {
  fetchMyApplications,
  fetchReceivedApplications,
  type MyApplication,
  type ReceivedApplication,
} from "@/lib/api/account-applications";
import {
  formatAedRange,
  formatRelativeTime,
  type AccountHomeFeed,
} from "@/lib/api/account-home";
import { MoneyText } from "@/components/currency";
import type { AccountNotification } from "@/lib/api/account-notifications";
import { fetchMyRequirements } from "@/lib/api/account-requirements";
import { fetchIdentityVerificationStatus } from "@/lib/api/account-verification";
import { cloudinaryCrop } from "@/lib/cloudinary";
import type { ListingSearchHit } from "@/lib/api/marketing";
import { getPublicPlanFeatures } from "@/lib/api/plans";
import { readBrowseResume } from "@/lib/auth/browse-resume";
import { sellerPlanAccess } from "@/lib/auth/member-access";
import {
  canAccessFeatureView,
  effectiveCanChatDirectly,
  type AccountFeatureFlags,
} from "@/lib/chat/chat-access";
import { listingPublicPath, requirementPublicPath } from "@/lib/navigation/public-paths";
import { formatListingDisplayPrice } from "@/lib/pricing-blocks";
import { cn } from "@/lib/utils";

type AccountHomeViewProps = {
  dashboard: AccountDashboard;
  homeFeed: AccountHomeFeed;
  identity: AccountIdentity;
  chatUnreadCount?: number;
  notifications?: AccountNotification[];
  features?: AccountFeatureFlags;
  onNavigate: (view: AccountViewId) => void;
  onCreateListing?: () => void;
  onCreateRequirement?: () => void;
  onContinueBrowse?: (input: { q?: string; categoryId?: string }) => void;
};

function tierLabel(tier?: string | null) {
  if (!tier || tier === "starter" || tier === "free") return "Starter";
  if (tier === "white_glove") return "Vetted";
  return tier.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function applicationStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function openApplicationStatuses(status: string) {
  return status === "submitted" || status === "viewed" || status === "shortlisted";
}

function absolutePath(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  accent,
}: {
  icon: typeof Search;
  label: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[5.25rem] flex-col justify-between rounded-2xl border p-4 text-left transition",
        accent
          ? "border-brand-mantis/30 bg-gradient-to-br from-brand-mantis/12 to-brand-emerald/8 hover:border-brand-mantis/45"
          : "border-border bg-white hover:border-brand-forest/15 hover:shadow-sm",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          accent ? "bg-brand-mantis/20 text-brand-forest" : "bg-brand-forest/5 text-brand-forest",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-bold text-brand-forest">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function LinkActions({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(absolutePath(href));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={copyLink}
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-brand-forest/5 hover:text-brand-forest"
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? <Check className="size-3.5 text-brand-emerald" /> : <Copy className="size-3.5" />}
      </button>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-brand-forest/5 hover:text-brand-forest"
        aria-label="Open in new tab"
        title="Open in new tab"
      >
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}

function ListingCard({ listing }: { listing: ListingSearchHit }) {
  const href = listingPublicPath({ id: listing.id, title: listing.title });
  return (
    <div className="group flex items-center gap-1 rounded-2xl border border-border bg-white p-2.5 pr-2 transition hover:border-brand-forest/15 hover:shadow-sm sm:p-3">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-16">
          {listing.coverImage ? (
            <Image
              src={cloudinaryCrop(listing.coverImage, "1:1", "auto")}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-forest/5 to-brand-blue/10">
              <BriefcaseBusiness className="size-5 text-brand-forest/25" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-brand-forest">{listing.title}</p>
          <p className="mt-0.5 text-[12px] font-extrabold text-brand-forest">
            {formatListingDisplayPrice(listing)}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{listing.sellerName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground">
            {listing.categoryName ? (
              <span className="font-medium text-brand-forest/70">{listing.categoryName}</span>
            ) : null}
            <span className="inline-flex items-center gap-0.5">
              <Star className="size-3 fill-brand-mantis text-brand-mantis" />
              {listing.sellerReviewCount > 0 ? listing.sellerAggregateRating.toFixed(1) : "New"}
            </span>
            {listing.location ? (
              <span className="inline-flex max-w-[8rem] items-center gap-0.5 truncate">
                <MapPin className="size-2.5 shrink-0" />
                {listing.location}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <LinkActions href={href} />
    </div>
  );
}

function RequirementCard({
  item,
}: {
  item: AccountHomeFeed["requirements"][number];
}) {
  const href = requirementPublicPath({ id: item.id, title: item.title });
  return (
    <div className="group flex items-center gap-1 rounded-2xl border border-border bg-white p-2.5 pr-2 transition hover:border-brand-forest/15 hover:shadow-sm sm:p-3">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-forest/5 text-brand-forest">
          <ClipboardList className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="h-5 rounded-md bg-brand-forest/5 px-1.5 text-[9px] font-bold text-brand-forest"
            >
              {item.jobType.replaceAll("_", " ")}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
          </div>
          <h3 className="mt-1 truncate text-[13px] font-bold text-brand-forest">{item.title}</h3>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.location}</p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <MoneyText className="text-[12px] font-extrabold text-brand-mantis">
            {formatAedRange(item.budgetMin, item.budgetMax)}
          </MoneyText>
        </div>
      </Link>
      <LinkActions href={href} />
    </div>
  );
}

function EmptyPanel({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-dashed border-border bg-white/80 py-0 shadow-none ring-0">
      <CardContent className="px-5 py-7 text-center">
        <p className="font-bold text-brand-forest">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
        {actionLabel && onAction ? (
          <Button
            type="button"
            className="mt-4 rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:brightness-95"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InboxItem({
  icon: Icon,
  label,
  detail,
  onClick,
  tone = "default",
}: {
  icon: typeof MessageCircle;
  label: string;
  detail: string;
  onClick: () => void;
  tone?: "default" | "accent" | "warn";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[11.5rem] flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition hover:shadow-sm",
        tone === "accent" && "border-brand-mantis/30 bg-brand-mantis/10",
        tone === "warn" && "border-amber-300/60 bg-amber-50",
        tone === "default" && "border-border bg-white hover:border-brand-forest/15",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          tone === "accent" && "bg-brand-mantis/20 text-brand-forest",
          tone === "warn" && "bg-amber-100 text-amber-800",
          tone === "default" && "bg-brand-forest/5 text-brand-forest",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-brand-forest">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{detail}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function HomePromoCarousel({
  identity,
  features,
  onNavigate,
}: {
  identity: AccountIdentity;
  features?: AccountFeatureFlags;
  onNavigate: (view: AccountViewId) => void;
}) {
  const slides = useMemo(() => {
    const all = identity === "seller" ? SELLER_HOME_PROMOS : BUYER_HOME_PROMOS;
    if (!features) return all;
    return all.filter((slide) => canAccessFeatureView(slide.action, features));
  }, [features, identity]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[index % slides.length] ?? slides[0]!;
  const Icon = slide.icon;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${identity === "seller" ? "Seller" : "Buyer"} dashboard highlights`}
      className="overflow-hidden rounded-[1.35rem] bg-brand-forest p-[1px]"
    >
      <div
        key={slide.id}
        className={cn(
          "relative isolate min-h-[18rem] overflow-hidden rounded-[1.3rem] bg-gradient-to-br p-5 text-white sm:p-6",
          slide.gradient,
        )}
      >
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 34vw"
          className="absolute inset-0 -z-20 size-full object-cover transition-opacity duration-500"
          style={{ objectPosition: slide.imagePosition }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/15"
        />
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/12">
            <Icon className="size-5" />
          </span>
          <div className="flex gap-1.5">
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition",
                  i === index ? "w-5 bg-brand-mantis" : "w-1.5 bg-white/35",
                )}
              />
            ))}
          </div>
        </div>
        <h3 className="mt-4 text-lg font-extrabold tracking-tight">{slide.title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-white/75">{slide.subtitle}</p>
        <Button
          type="button"
          className="mt-5 rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:brightness-95"
          onClick={() => onNavigate(slide.action)}
        >
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

export function AccountHomeView({
  dashboard,
  homeFeed,
  identity,
  chatUnreadCount = 0,
  notifications = [],
  features,
  onNavigate,
  onCreateListing,
  onCreateRequirement,
  onContinueBrowse,
}: AccountHomeViewProps) {
  const { user, sellerProfile, listings, buyerProfile } = dashboard;
  const isSeller = identity === "seller";
  const displayName = accountDisplayName({
    displayName: sellerProfile?.displayName,
    businessName: user.businessName,
    username: user.username,
    email: user.email,
  });
  const firstName = displayName.split(" ")[0] ?? displayName;
  const avatarUrl = user.avatarUrl || sellerProfile?.avatarUrl;
  const liveListings = listings.filter((listing) => listing.status === "live");
  const draftListings = listings.filter((listing) => listing.status === "draft");
  const savedCount =
    (buyerProfile?.savedListingIds.length ?? 0) + (buyerProfile?.savedRequirementIds.length ?? 0);
  const featuredCategories = homeFeed.categories.slice(0, 6);

  const [browseResume, setBrowseResume] = useState<ReturnType<typeof readBrowseResume>>(null);
  useEffect(() => {
    setBrowseResume(readBrowseResume());
  }, [identity]);

  const planFeaturesQuery = useQuery({
    queryKey: ["catalog", "plan-features"],
    queryFn: getPublicPlanFeatures,
    staleTime: 300_000,
    enabled: isSeller && Boolean(user.sid),
  });
  const planAccess = sellerPlanAccess(sellerProfile?.tier, planFeaturesQuery.data);
  const chatLocked =
    isSeller && !effectiveCanChatDirectly(planAccess.canChatDirectly, features);

  const verificationQuery = useQuery({
    queryKey: ["account", "identity-verification"],
    queryFn: fetchIdentityVerificationStatus,
    enabled: isSeller && Boolean(user.sid),
  });

  const myApplicationsQuery = useQuery({
    queryKey: ["account", "applications", "mine"],
    queryFn: fetchMyApplications,
    enabled: isSeller && Boolean(user.sid),
  });

  const receivedApplicationsQuery = useQuery({
    queryKey: ["account", "applications", "received"],
    queryFn: fetchReceivedApplications,
    enabled: !isSeller && Boolean(user.bid),
  });

  const myRequirementsQuery = useQuery({
    queryKey: ["account", "requirements", "mine"],
    queryFn: fetchMyRequirements,
    enabled: !isSeller && Boolean(user.bid),
  });

  const myApplications = myApplicationsQuery.data ?? [];
  const receivedApplications = receivedApplicationsQuery.data ?? [];
  const myRequirements = myRequirementsQuery.data ?? [];
  const openMyRequirements = myRequirements.filter(
    (item) => item.status === "open" || item.status === "shortlisting" || item.status === "pending_review",
  );

  const pendingSellerApps = myApplications.filter((item) => openApplicationStatuses(item.status));
  const pendingBuyerApps = receivedApplications.filter((item) => openApplicationStatuses(item.status));
  const awardedSellerJobs = myApplications.filter((item) => item.status === "awarded");
  const awardedCount = receivedApplications.filter((item) => item.status === "awarded").length;

  const applicantsByRequirement = useMemo(() => {
    const map = new Map<string, number>();
    for (const app of receivedApplications) {
      if (!openApplicationStatuses(app.status)) continue;
      map.set(app.requirementId, (map.get(app.requirementId) ?? 0) + 1);
    }
    return map;
  }, [receivedApplications]);

  const verification = verificationQuery.data;
  const verificationNeedsAttention =
    isSeller &&
    verification &&
    (verification.status === "not_submitted" ||
      verification.status === "pending" ||
      verification.status === "rejected");

  const recentActivity = useMemo(() => {
    const fromNotifications = notifications.slice(0, 5).map((item) => ({
      id: `n-${item.id}`,
      title: item.title,
      detail: item.body || formatRelativeTime(item.createdAt),
      createdAt: item.createdAt,
      onClick: () => onNavigate("notifications"),
    }));

    const fromApps: Array<{
      id: string;
      title: string;
      detail: string;
      createdAt: string;
      onClick: () => void;
    }> = isSeller
      ? myApplications.slice(0, 3).map((item: MyApplication) => ({
          id: `a-${item.id}`,
          title:
            item.status === "awarded"
              ? `Awarded · ${item.requirement.title}`
              : `You applied · ${item.requirement.title}`,
          detail: `${applicationStatusLabel(item.status)} · ${formatRelativeTime(item.updatedAt || item.createdAt)}`,
          createdAt: item.updatedAt || item.createdAt,
          onClick: () =>
            onNavigate(item.status === "awarded" ? "jobs-bookings" : "applications"),
        }))
      : receivedApplications.slice(0, 3).map((item: ReceivedApplication) => ({
          id: `r-${item.id}`,
          title: `${item.seller.displayName ?? "Seller"} applied`,
          detail: `${item.requirement.title} · ${formatRelativeTime(item.createdAt)}`,
          createdAt: item.createdAt,
          onClick: () => onNavigate("applications"),
        }));

    return [...fromNotifications, ...fromApps]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [isSeller, myApplications, notifications, onNavigate, receivedApplications]);

  const inboxItems = [
    {
      key: "awarded-jobs",
      icon: BriefcaseBusiness,
      label:
        (isSeller ? awardedSellerJobs.length : awardedCount) > 0
          ? `${isSeller ? awardedSellerJobs.length : awardedCount} awarded job${(isSeller ? awardedSellerJobs.length : awardedCount) === 1 ? "" : "s"}`
          : "Jobs & Bookings",
      detail:
        (isSeller ? awardedSellerJobs.length : awardedCount) > 0
          ? isSeller ? "Review work awarded to you" : "Review contracts and confirmed work"
          : "Your awarded work hub",
      onClick: () => onNavigate("jobs-bookings"),
      tone:
        (isSeller ? awardedSellerJobs.length : awardedCount) > 0
          ? ("accent" as const)
          : ("default" as const),
      show: true,
    },
    {
      key: "chat",
      icon: MessageCircle,
      label: chatUnreadCount > 0 ? `${chatUnreadCount} unread chat${chatUnreadCount === 1 ? "" : "s"}` : "Messages",
      detail: chatUnreadCount > 0 ? "Open Chat Room" : "No unread threads",
      onClick: () => onNavigate("chat"),
      tone: chatUnreadCount > 0 ? ("accent" as const) : ("default" as const),
      show: features?.chatEnabled !== false,
    },
    {
      key: "apps",
      icon: FileCheck2,
      label: isSeller
        ? pendingSellerApps.length > 0
          ? `${pendingSellerApps.length} open application${pendingSellerApps.length === 1 ? "" : "s"}`
          : "My applications"
        : pendingBuyerApps.length > 0
          ? `${pendingBuyerApps.length} pending applicant${pendingBuyerApps.length === 1 ? "" : "s"}`
          : "Applicants",
      detail: isSeller ? "Track pitches you’ve sent" : "Review sellers who applied",
      onClick: () => onNavigate("applications"),
      tone:
        (isSeller ? pendingSellerApps.length : pendingBuyerApps.length) > 0
          ? ("accent" as const)
          : ("default" as const),
      show: true,
    },
    {
      key: "verify",
      icon: ShieldCheck,
      label:
        verification?.status === "pending"
          ? "Verification in review"
          : verification?.status === "rejected"
            ? "Verification needs update"
            : verification?.status === "verified"
              ? "Identity verified"
              : "Verify identity",
      detail:
        verification?.status === "verified"
          ? "You’re good to go"
          : verification?.status === "pending"
            ? "Usually within one business day"
            : "Unlock stronger trust signals",
      onClick: () => onNavigate("verification"),
      tone: verificationNeedsAttention ? ("warn" as const) : ("default" as const),
      show: isSeller && Boolean(user.sid),
    },
  ].filter((item) => item.show);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-2">
      {/* Hero with metric chips */}
      <section className="relative overflow-hidden rounded-[1.35rem] border border-border bg-white p-5 sm:p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-mantis/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-brand-blue/5 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <AccountAvatar
              name={displayName}
              imageUrl={avatarUrl}
              className="size-14 rounded-2xl text-base shadow-sm ring-2 ring-white sm:size-16"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {isSeller ? "Seller workspace" : "Welcome back"}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-brand-forest sm:text-[1.75rem]">
                {firstName}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {isSeller
                  ? "Your tasks on the left — discovery on the right."
                  : "Your hiring work on the left — marketplace discovery on the right."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {isSeller && user.sid ? <IdChip>{user.sid}</IdChip> : null}
                {!isSeller && user.bid ? <IdChip gold>{user.bid}</IdChip> : null}
                {isSeller ? (
                  <Badge variant="outline" className="rounded-lg border-border text-[10px] font-bold">
                    {tierLabel(sellerProfile?.tier)}
                  </Badge>
                ) : null}
                {isSeller ? (
                  <Badge className="rounded-lg bg-brand-forest/5 text-[10px] font-bold text-brand-forest hover:bg-brand-forest/5">
                    {liveListings.length} live
                  </Badge>
                ) : (
                  <Badge className="rounded-lg bg-brand-forest/5 text-[10px] font-bold text-brand-forest hover:bg-brand-forest/5">
                    {savedCount} saved
                  </Badge>
                )}
                <Badge className="rounded-lg bg-brand-mantis/15 text-[10px] font-bold text-brand-forest hover:bg-brand-mantis/15">
                  {homeFeed.requirementsTotal.toLocaleString()} open reqs
                </Badge>
                {!isSeller ? (
                  <Badge className="rounded-lg bg-brand-forest/5 text-[10px] font-bold text-brand-forest hover:bg-brand-forest/5">
                    {homeFeed.listingsTotal.toLocaleString()} listings
                  </Badge>
                ) : (
                  <Badge className="rounded-lg bg-brand-forest/5 text-[10px] font-bold text-brand-forest hover:bg-brand-forest/5">
                    {draftListings.length} draft{draftListings.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 self-start rounded-xl border-border font-bold"
            onClick={() => onNavigate("dashboard")}
          >
            <LayoutDashboard className="size-4" />
            My account
          </Button>
        </div>
      </section>

      <CompetitionDashboardBanner
        activeReferrals={dashboard.referral?.activeReferrals}
        ctaLabel="View competition"
        compact
      />

      {/* Action inbox */}
      <section>
        <SectionHeading title="Action inbox" className="!mt-0" />
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {inboxItems.map((item) => (
            <InboxItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              detail={item.detail}
              onClick={item.onClick}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      {/* 3 primary actions */}
      <section>
        <SectionHeading title="Quick actions" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isSeller ? (
            <>
              <QuickAction
                icon={BriefcaseBusiness}
                label="Jobs & Bookings"
                description={
                  awardedSellerJobs.length > 0
                    ? `${awardedSellerJobs.length} awarded job${awardedSellerJobs.length === 1 ? "" : "s"}`
                    : "See awarded jobs and bookings"
                }
                onClick={() => onNavigate("jobs-bookings")}
                accent={awardedSellerJobs.length > 0}
              />
              <QuickAction
                icon={ClipboardList}
                label="Browse requirements"
                description="Find buyer posts you can apply to"
                onClick={() => onNavigate("requirements")}
                accent={awardedSellerJobs.length === 0}
              />
              <QuickAction
                icon={BriefcaseBusiness}
                label="My listings"
                description={
                  draftListings.length > 0
                    ? `${draftListings.length} draft${draftListings.length === 1 ? "" : "s"} waiting`
                    : "Manage your seller catalog"
                }
                onClick={() => onNavigate("my-listings")}
              />
              <QuickAction
                icon={MessageCircle}
                label="Chat Room"
                description={chatUnreadCount > 0 ? `${chatUnreadCount} unread` : "Buyer conversations"}
                onClick={() => onNavigate("chat")}
              />
            </>
          ) : (
            <>
              <QuickAction
                icon={BriefcaseBusiness}
                label="Jobs & Bookings"
                description={
                  awardedCount > 0
                    ? `${awardedCount} awarded job${awardedCount === 1 ? "" : "s"}`
                    : "Contracts and confirmed work"
                }
                onClick={() => onNavigate("jobs-bookings")}
                accent={awardedCount > 0}
              />
              <QuickAction
                icon={Search}
                label="Browse listings"
                description="Find DJs, chefs, photographers & more"
                onClick={() => onNavigate("browse")}
                accent={awardedCount === 0}
              />
              <QuickAction
                icon={ClipboardList}
                label="Post a requirement"
                description="Tell sellers exactly what you need"
                onClick={() => onCreateRequirement?.() ?? onNavigate("my-requirements")}
              />
              <QuickAction
                icon={Heart}
                label="Saved"
                description={savedCount > 0 ? `${savedCount} saved items` : "Your shortlist"}
                onClick={() => onNavigate("saved")}
              />
            </>
          )}
        </div>
      </section>

      {/* Split: tasks | discovery */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* LEFT — your work */}
        <div className="space-y-6">
          <section>
            <SectionHeading
              title={isSeller ? "Your work" : "Your hiring"}
              action={
                <button
                  type="button"
                  onClick={() => onNavigate(isSeller ? "applications" : "my-requirements")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                >
                  View all
                  <ChevronRight className="size-3.5" />
                </button>
              }
            />

            {isSeller ? (
              <div className="space-y-2">
                {liveListings.length === 0 ? (
                  <EmptyPanel
                    title={
                      draftListings.length > 0
                        ? "Finish your draft listing"
                        : "Publish your first listing"
                    }
                    body={
                      draftListings.length > 0
                        ? "You have a draft ready — open My listings to finish and submit for review."
                        : "Live listings help buyers find you. Start a draft and submit it for review."
                    }
                    actionLabel={
                      draftListings.length > 0
                        ? "Continue draft"
                        : onCreateListing
                          ? "Create listing"
                          : "Open my listings"
                    }
                    onAction={() =>
                      draftListings.length > 0 || !onCreateListing
                        ? onNavigate("my-listings")
                        : onCreateListing()
                    }
                  />
                ) : null}

                {draftListings.length > 0 && liveListings.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => onNavigate("my-listings")}
                    className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:border-amber-300"
                  >
                    <span>
                      <span className="block text-sm font-bold text-brand-forest">
                        Continue {draftListings.length} draft
                        {draftListings.length === 1 ? "" : "s"}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">
                        {draftListings[0]?.title || "Untitled listing"}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ) : null}

                <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Your applications
                </p>
                {pendingSellerApps.length > 0 ? (
                  pendingSellerApps.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate("applications")}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-3.5 py-3 text-left transition hover:border-brand-forest/15"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-forest/5">
                        <FileCheck2 className="size-4 text-brand-forest" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-brand-forest">
                          {item.requirement.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] capitalize text-muted-foreground">
                          {applicationStatusLabel(item.status)} ·{" "}
                          {formatRelativeTime(item.updatedAt || item.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <EmptyPanel
                    title="No open applications"
                    body="Browse live buyer requirements and send a pitch."
                    actionLabel="Browse requirements"
                    onAction={() => onNavigate("requirements")}
                  />
                )}
              </div>
            ) : openMyRequirements.length === 0 ? (
              <EmptyPanel
                title="Post what you need"
                body="Create a requirement and let sellers apply with pitches — no agency middleman."
                actionLabel={onCreateRequirement ? "Post a requirement" : "Open my requirements"}
                onAction={() =>
                  onCreateRequirement ? onCreateRequirement() : onNavigate("my-requirements")
                }
              />
            ) : (
              <div className="space-y-2">
                {openMyRequirements.slice(0, 5).map((item) => {
                  const count = applicantsByRequirement.get(item.id) ?? 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate("applications")}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-3.5 py-3 text-left transition hover:border-brand-forest/15"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-forest/5">
                        <ClipboardList className="size-4 text-brand-forest" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-brand-forest">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {count > 0
                            ? `${count} pending applicant${count === 1 ? "" : "s"}`
                            : "Waiting for applicants"}{" "}
                          · {item.status?.replaceAll("_", " ")}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {isSeller ? (
            <section>
              <SectionHeading
                title="Requirements matching you"
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("requirements")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                  >
                    View all
                    <ChevronRight className="size-3.5" />
                  </button>
                }
              />
              {homeFeed.requirements.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {homeFeed.requirements.slice(0, 4).map((item) => (
                    <RequirementCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  title="No open requirements right now"
                  body="New buyer posts will show up here as hospitality teams publish them."
                />
              )}
            </section>
          ) : null}

          {/* Continue browsing / drafts */}
          {!isSeller && browseResume && onContinueBrowse ? (
            <button
              type="button"
              onClick={() =>
                onContinueBrowse({
                  q: browseResume.q,
                  categoryId: browseResume.categoryId,
                })
              }
              className="flex w-full items-center justify-between rounded-2xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3.5 text-left transition hover:border-brand-blue/35"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-blue">
                  <Link2 className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-brand-forest">Continue browsing</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">
                    {browseResume.q
                      ? `“${browseResume.q}”`
                      : browseResume.categoryId
                        ? "Last category you opened"
                        : "Resume your search"}
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ) : null}

          {isSeller && draftListings.length > 0 && liveListings.length > 0 ? (
            <button
              type="button"
              onClick={() => onNavigate("my-listings")}
              className="flex w-full items-center justify-between rounded-2xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3.5 text-left transition hover:border-brand-blue/35"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-blue">
                  <BriefcaseBusiness className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-brand-forest">Continue draft listings</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">
                    {draftListings.length} unfinished listing{draftListings.length === 1 ? "" : "s"}
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ) : null}

          {/* Plan nudge */}
          {isSeller && (chatLocked || verificationNeedsAttention) ? (
            <section className="overflow-hidden rounded-[1.25rem] border border-brand-forest/10 bg-gradient-to-br from-brand-forest via-[#0a2e1a] to-brand-blue p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12">
                  <Sparkles className="size-4 text-brand-mantis" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">
                    {chatLocked ? "Unlock direct buyer chat" : "Complete identity verification"}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-white/70">
                    {chatLocked
                      ? "Starter sellers route inquiries through Kattegat Vetted. Pro adds direct messaging and stronger discovery."
                      : "Verified sellers earn more trust on public profiles and premium flows."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chatLocked ? (
                      <Button
                        type="button"
                        className="rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:brightness-95"
                        onClick={() => onNavigate("membership")}
                      >
                        View plans
                      </Button>
                    ) : null}
                    {verificationNeedsAttention ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-white/25 bg-white/10 font-bold text-white hover:bg-white/15"
                        onClick={() => onNavigate("verification")}
                      >
                        {verification?.status === "pending" ? "Check status" : "Verify identity"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* Recent activity */}
          <section>
            <SectionHeading
              title="Recent activity"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("notifications")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                >
                  Inbox
                  <ChevronRight className="size-3.5" />
                </button>
              }
            />
            {recentActivity.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                {recentActivity.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-brand-forest/[0.03]",
                      index > 0 && "border-t border-border",
                    )}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-forest/5 text-brand-forest">
                      <Sparkles className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-brand-forest">{item.title}</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{item.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyPanel
                title="Nothing new yet"
                body="Chats, applications, and marketplace updates will show up here."
              />
            )}
          </section>
        </div>

        {/* RIGHT — discovery */}
        <div className="space-y-6">
          <HomePromoCarousel identity={identity} features={features} onNavigate={onNavigate} />

          {isSeller ? (
            <>
              {homeFeed.listings.length > 0 ? (
                <section>
                  <SectionHeading
                    title="Service inspiration"
                    action={
                      <button
                        type="button"
                        onClick={() => onNavigate("browse")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                      >
                        Browse all
                        <ChevronRight className="size-3.5" />
                      </button>
                    }
                  />
                  <div className="flex flex-col gap-2">
                    {homeFeed.listings.slice(0, 5).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <>
              <section>
                <SectionHeading
                  title="Recommended for you"
                  action={
                    <button
                      type="button"
                      onClick={() => onNavigate("browse")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                    >
                      Browse all
                      <ChevronRight className="size-3.5" />
                    </button>
                  }
                />
                {homeFeed.listings.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {homeFeed.listings.slice(0, 5).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    title="No live listings yet"
                    body="Check back soon, or post a requirement to attract sellers."
                    actionLabel="Post a requirement"
                    onAction={() =>
                      onCreateRequirement ? onCreateRequirement() : onNavigate("my-requirements")
                    }
                  />
                )}
              </section>

              <section>
                <SectionHeading
                  title="Latest requirements"
                  action={
                    <button
                      type="button"
                      onClick={() => onNavigate("requirements")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                    >
                      View all
                      <ChevronRight className="size-3.5" />
                    </button>
                  }
                />
                {homeFeed.requirements.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {homeFeed.requirements.slice(0, 4).map((item) => (
                      <RequirementCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    title="No open requirements"
                    body="Be the first to post what you need."
                  />
                )}
              </section>
            </>
          )}

          {featuredCategories.length > 0 ? (
            <section>
              <SectionHeading
                title={isSeller ? "Popular categories" : "Explore categories"}
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("categories")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                  >
                    View all
                    <ChevronRight className="size-3.5" />
                  </button>
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {featuredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onContinueBrowse?.({ categoryId: category.id }) ?? onNavigate("categories")}
                    className="group flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 text-left transition hover:border-brand-forest/15 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-brand-forest">{category.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {isSeller ? "View sellers" : "Browse listings"}
                      </p>
                    </div>
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-forest/5 text-brand-forest transition group-hover:bg-brand-mantis/15">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
