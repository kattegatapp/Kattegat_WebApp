"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  Grid2x2,
  Heart,
  LayoutDashboard,
  MapPin,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  AccountAvatar,
  IdChip,
  SectionHeading,
  accountDisplayName,
} from "@/features/account/account-shared";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import type { AccountDashboard } from "@/lib/api/account";
import {
  formatAedRange,
  formatRelativeTime,
  type AccountHomeFeed,
} from "@/lib/api/account-home";
import type { ListingSearchHit } from "@/lib/api/marketing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AccountHomeViewProps = {
  dashboard: AccountDashboard;
  homeFeed: AccountHomeFeed;
  identity: AccountIdentity;
  onNavigate: (view: AccountViewId) => void;
};

function tierLabel(tier?: string | null) {
  if (!tier || tier === "starter" || tier === "free") return "Starter";
  if (tier === "white_glove") return "Vetted";
  return tier.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  accent,
}: {
  icon: typeof Grid2x2;
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
        "group flex min-h-[5.5rem] flex-col justify-between rounded-2xl border p-4 text-left transition",
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

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <Card className="gap-0 border-border bg-white py-0 shadow-none ring-0">
      <CardContent className="flex items-center gap-3 px-4 py-3.5">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            tone === "accent" ? "bg-brand-mantis/15 text-brand-forest" : "bg-brand-forest/5 text-brand-forest",
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="mt-0.5 block text-xl font-extrabold tracking-tight text-brand-forest">{value}</span>
        </span>
      </CardContent>
    </Card>
  );
}

function ListingCard({ listing }: { listing: ListingSearchHit }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <Card className="gap-0 overflow-hidden border-border bg-white py-0 shadow-none ring-0 transition hover:border-brand-forest/15 hover:shadow-md">
        <div className="relative aspect-[16/10] bg-muted">
          {listing.coverImage ? (
            <Image
              src={listing.coverImage}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-forest/5 to-brand-blue/10">
              <BriefcaseBusiness className="size-8 text-brand-forest/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          {listing.categoryName ? (
            <Badge className="absolute left-3 top-3 border-0 bg-white/95 text-[10px] font-bold text-brand-forest shadow-sm">
              {listing.categoryName}
            </Badge>
          ) : null}
          <span className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-white/95 text-brand-forest opacity-0 shadow-sm transition group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <AccountAvatar
              name={listing.sellerName ?? "Seller"}
              imageUrl={listing.sellerAvatarUrl}
              className="size-10 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-brand-forest">{listing.sellerName}</p>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{listing.title}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-brand-forest">
              <Star className="size-3.5 fill-brand-mantis text-brand-mantis" />
              {listing.sellerReviewCount > 0
                ? `${listing.sellerAggregateRating.toFixed(1)} (${listing.sellerReviewCount})`
                : "New seller"}
            </span>
            {listing.location ? (
              <span className="inline-flex max-w-[50%] items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0" />
                {listing.location}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RequirementCard({ item }: { item: AccountHomeFeed["requirements"][number] }) {
  return (
    <Card className="gap-0 border-border bg-white py-0 shadow-none ring-0 transition hover:border-brand-forest/15 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-md bg-brand-forest/5 text-[10px] font-bold text-brand-forest">
                {item.jobType.replaceAll("_", " ")}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
            </div>
            <h3 className="mt-2 font-bold leading-snug text-brand-forest">{item.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted-foreground">{item.description}</p>
          </div>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-extrabold text-brand-forest">
              {formatAedRange(item.budgetMin, item.budgetMax)}
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">{item.location}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPanel({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed border-border bg-white/80 py-0 shadow-none ring-0">
      <CardContent className="px-5 py-8 text-center text-sm leading-6 text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

export function AccountHomeView({ dashboard, homeFeed, identity, onNavigate }: AccountHomeViewProps) {
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
  const liveListings = listings.filter((listing) => listing.status === "live").length;
  const savedCount = buyerProfile?.savedListingIds.length ?? 0;
  const featuredCategories = homeFeed.categories.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-2">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.35rem] border border-border bg-white p-5 sm:p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-mantis/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-brand-blue/5 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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
                  ? "Manage listings, respond to requirements, and grow your business."
                  : "Discover talent, track requirements, and manage your Kattegat workspace."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {isSeller && user.sid ? <IdChip>{user.sid}</IdChip> : null}
                {!isSeller && user.bid ? <IdChip gold>{user.bid}</IdChip> : null}
                {isSeller && user.sid ? (
                  <Badge variant="outline" className="rounded-lg border-border text-[10px] font-bold">
                    {tierLabel(sellerProfile?.tier)}
                  </Badge>
                ) : null}
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

      {/* Quick actions — different per identity */}
      <section>
        <SectionHeading title="Quick actions" className="!mt-0" />
        <div className="grid gap-3 sm:grid-cols-3">
          {isSeller ? (
            <>
              <QuickAction
                icon={ClipboardList}
                label="Browse requirements"
                description="Marketplace buyer posts — not your own requirements"
                onClick={() => onNavigate("requirements")}
                accent
              />
              <QuickAction
                icon={BriefcaseBusiness}
                label="My listings"
                description="Your seller catalog — not public marketplace browse"
                onClick={() => onNavigate("my-listings")}
              />
              <QuickAction
                icon={Grid2x2}
                label="Browse categories"
                description="Explore the full service catalog"
                onClick={() => onNavigate("categories")}
              />
            </>
          ) : (
            <>
              <QuickAction
                icon={Search}
                label="Search marketplace"
                description="Find DJs, chefs, photographers & more"
                onClick={() => {
                  window.location.href = "/search";
                }}
                accent
              />
              <QuickAction
                icon={ClipboardList}
                label="Post a requirement"
                description="Your buyer posts — separate from Browse requirements"
                onClick={() => onNavigate("my-requirements")}
              />
              <QuickAction
                icon={Heart}
                label="Saved"
                description="Listings and requirements you saved"
                onClick={() => onNavigate("saved")}
              />
              <QuickAction
                icon={Grid2x2}
                label="Browse categories"
                description="Explore the full service catalog"
                onClick={() => onNavigate("categories")}
              />
            </>
          )}
        </div>
      </section>

      {/* Metrics — different per identity */}
      <section>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {isSeller ? (
            <>
              <MetricCard icon={TrendingUp} label="Live listings" value={String(liveListings)} tone="accent" />
              <MetricCard icon={ClipboardList} label="Open requirements" value={homeFeed.requirementsTotal.toLocaleString()} />
              <MetricCard icon={Grid2x2} label="Categories" value={String(homeFeed.categories.length)} />
              <MetricCard icon={Sparkles} label="Plan" value={tierLabel(sellerProfile?.tier)} />
            </>
          ) : (
            <>
              <MetricCard icon={TrendingUp} label="Marketplace" value={homeFeed.listingsTotal.toLocaleString()} tone="accent" />
              <MetricCard icon={ClipboardList} label="Requirements" value={homeFeed.requirementsTotal.toLocaleString()} />
              <MetricCard icon={Heart} label="Saved" value={String(savedCount)} />
              <MetricCard icon={Sparkles} label="Member" value="Active" />
            </>
          )}
        </div>
      </section>

      {/* Seller home: requirements first, then service inspiration */}
      {/* Buyer home: categories, then recommended listings, then requirements */}
      {isSeller ? (
        <>
          {/* Requirements for sellers */}
          <section>
            <SectionHeading
              title="Requirements for you"
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
              <div className="grid gap-3">
                {homeFeed.requirements.map((item) => (
                  <RequirementCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyPanel>No open requirements right now. Check back soon for new buyer posts.</EmptyPanel>
            )}
          </section>

          {/* Service inspiration for sellers */}
          {homeFeed.listings.length > 0 ? (
            <section>
              <SectionHeading
                title="Service inspiration"
                action={
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                  >
                    Browse all
                    <ChevronRight className="size-3.5" />
                  </Link>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {homeFeed.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Categories for sellers */}
          {featuredCategories.length > 0 ? (
            <section>
              <SectionHeading
                title="Popular categories"
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 transition hover:border-brand-forest/15 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-brand-forest">{category.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">View sellers</p>
                    </div>
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-forest/5 text-brand-forest transition group-hover:bg-brand-mantis/15">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <>
          {/* Categories for buyers */}
          {featuredCategories.length > 0 ? (
            <section>
              <SectionHeading
                title="Explore categories"
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 transition hover:border-brand-forest/15 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-brand-forest">{category.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">View sellers</p>
                    </div>
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-forest/5 text-brand-forest transition group-hover:bg-brand-mantis/15">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Recommended listings for buyers */}
          <section>
            <SectionHeading
              title="Recommended for you"
              action={
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                >
                  Search all
                  <ChevronRight className="size-3.5" />
                </Link>
              }
            />
            {homeFeed.listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {homeFeed.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <EmptyPanel>No live listings yet. Check back soon or post a requirement to attract sellers.</EmptyPanel>
            )}
          </section>

          {/* Requirements for buyers */}
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
              <div className="grid gap-3">
                {homeFeed.requirements.map((item) => (
                  <RequirementCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyPanel>No open requirements right now. Be the first to post what you need.</EmptyPanel>
            )}
          </section>
        </>
      )}
    </div>
  );
}
