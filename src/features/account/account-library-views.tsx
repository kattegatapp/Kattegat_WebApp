"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Gift,
  Heart,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AccountAvatar,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
  SectionHeading,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { ListingEditorDialog } from "@/features/account/listing-editor-dialog";
import { ReferralSharePanel } from "@/features/account/referral-share-panel";
import { RequirementEditorDialog } from "@/features/account/requirement-editor-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AccountDashboard, AccountListing } from "@/lib/api/account";
import { ApiRequestError } from "@/lib/api/client";
import {
  fetchAccountListings,
  submitListingForReview,
  unpublishAccountListing,
} from "@/lib/api/account-listings";
import { formatAedRange, formatRelativeTime } from "@/lib/api/account-home";
import {
  fetchMyRequirements,
  fetchOpenRequirements,
  requirementEditable,
  type AccountRequirement,
} from "@/lib/api/account-requirements";
import {
  fetchAccountReferralSummary,
  fetchReferredUsers,
  fetchReferralLeaderboard,
} from "@/lib/api/account-referrals";
import { fetchRecommendLeads, submitRecommendLead, type RecommendLead } from "@/lib/api/account-recommend";
import { fetchSavedItems } from "@/lib/api/account-saved";
import { getPublicPlanFeatures } from "@/lib/api/plans";
import { listingPublicPath, requirementPublicPath } from "@/lib/navigation/public-paths";
import { cn } from "@/lib/utils";

function listingStatusClass(status: string) {
  const variant =
    status === "live"
      ? "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald"
      : status === "rejected"
        ? "border-red-400/35 bg-red-50 text-red-600"
        : status === "pending_review"
          ? "border-amber-400/35 bg-amber-50 text-amber-700"
          : "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/65";
  return cn("rounded-md border px-2 py-0.5 text-[11px] font-bold capitalize", variant);
}

function requirementStatusClass(status: string) {
  const variant =
    status === "open"
      ? "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald"
      : status === "rejected"
        ? "border-red-400/35 bg-red-50 text-red-600"
        : status === "pending_review"
          ? "border-amber-400/35 bg-amber-50 text-amber-700"
          : "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/65";
  return cn("rounded-md border px-2 py-0.5 text-[11px] font-bold capitalize", variant);
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Heart;
  title: string;
  body: string;
}) {
  return (
    <AccountGlass className="rounded-[18px] p-10 text-center">
      <Icon className="mx-auto size-7 text-brand-mantis" />
      <p className="mt-4 font-bold text-brand-forest">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-brand-forest/65">{body}</p>
    </AccountGlass>
  );
}

function OpenRequirementCard({ item }: { item: AccountRequirement }) {
  return (
    <Link href={requirementPublicPath({ id: item.id, title: item.title })} className="group block h-full">
    <AccountListCard className="flex h-full min-w-0 flex-col p-4 sm:p-5 transition group-hover:border-brand-mantis/25">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-brand-forest/10 bg-muted px-2 py-0.5 text-[10.5px] font-bold text-brand-forest/65">
          {item.jobType.replaceAll("_", " ")}
        </span>
        <span className="text-[11px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
        {item.viewCount > 0 ? (
          <span className="text-[11px] text-muted-foreground">{item.viewCount} views</span>
        ) : null}
      </div>
      <h3 className="mt-2 text-[15px] font-bold leading-snug text-brand-forest">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-brand-forest/65">{item.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
        <span className="text-sm font-bold text-brand-mantis">{formatAedRange(item.budgetMin, item.budgetMax)}</span>
        <span className="text-[12px] text-brand-forest/65">{item.location}</span>
      </div>
    </AccountListCard>
    </Link>
  );
}

export function AccountMyListingsView({ dashboard }: { dashboard: AccountDashboard }) {
  const client = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const listingsQuery = useQuery({
    queryKey: ["account", "listings"],
    queryFn: fetchAccountListings,
    initialData: dashboard.listings,
    enabled: Boolean(dashboard.user.sid),
  });
  const listings = listingsQuery.data ?? [];

  const planFeatures = useQuery({
    queryKey: ["catalog", "plan-features"],
    queryFn: getPublicPlanFeatures,
    staleTime: 300_000,
    enabled: Boolean(dashboard.user.sid),
  });
  const tierFeatures = planFeatures.data?.find((plan) => plan.tier === dashboard.sellerProfile?.tier);
  const maxListings = tierFeatures?.maxListings;
  const listingQuotaReached = maxListings != null && listings.length >= maxListings;

  const statusMutation = useMutation({
    mutationFn: async ({
      listingId,
      action,
    }: {
      listingId: string;
      action: "submit" | "unpublish";
    }) => {
      if (action === "submit") return submitListingForReview(listingId);
      return unpublishAccountListing(listingId);
    },
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "listings"] });
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not update listing status.",
      );
    },
  });

  const pendingListingId =
    statusMutation.isPending && statusMutation.variables
      ? statusMutation.variables.listingId
      : null;

  function openCreate() {
    setEditorMode("create");
    setActiveListingId(null);
    setEditorOpen(true);
  }

  function openEdit(listingId: string) {
    setEditorMode("edit");
    setActiveListingId(listingId);
    setEditorOpen(true);
  }

  if (!dashboard.user.sid) {
    return (
      <AccountViewWrap>
        <EmptyState
          icon={BriefcaseBusiness}
          title="Seller listings"
          body="Add a seller identity to publish and manage service listings."
        />
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <AccountViewIntro
          className="mb-0"
          title="My listings"
          badge="Your catalog"
          description="Create drafts, edit details, and submit for admin review. Unpublishing removes a listing from discovery; republishing sends it back for review."
        />
        <Button
          type="button"
          className="shrink-0 font-bold"
          disabled={listingQuotaReached}
          onClick={openCreate}
        >
          <Plus className="size-4" />
          New listing
        </Button>
      </div>
      {!listingsQuery.isPending ? (
        <p className="mb-5 text-sm text-muted-foreground">
          {listings.length} posting{listings.length === 1 ? "" : "s"} in your catalog
        </p>
      ) : null}
      {listingQuotaReached ? (
        <p className="mb-3 text-sm text-amber-700">
          You&apos;ve reached your plan limit of {maxListings} listing{maxListings === 1 ? "" : "s"}.
          Unpublish one to create another.
        </p>
      ) : null}
      {actionError ? <p className="mb-3 text-sm text-red-600">{actionError}</p> : null}
      {listingsQuery.isPending ? (
        <AccountCardGridSkeleton count={3} columns={1} />
      ) : listings.length ? (
        <div className="flex flex-col gap-3">
          {listings.map((listing: AccountListing) => {
            const isListingActionPending = pendingListingId === listing.id;
            const pendingAction = isListingActionPending ? statusMutation.variables?.action : null;

            return (
            <AccountListCard key={listing.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={listingStatusClass(listing.status)}>
                      {listing.status.replaceAll("_", " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(listing.updatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[15px] font-bold leading-snug text-brand-forest">{listing.title}</h3>
                  {listing.description ? (
                    <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-brand-forest/65">
                      {listing.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[12px] text-brand-forest/55">{listing.location || "UAE"}</p>
                  {listing.rejectionReason ? (
                    <p className="mt-2 text-[12px] text-red-600">Rejected: {listing.rejectionReason}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-brand-forest/8 pt-3 lg:max-w-[16rem] lg:shrink-0 lg:justify-end lg:border-t-0 lg:pt-0">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(listing.id)}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  {listing.status === "draft" || listing.status === "rejected" || listing.status === "unpublished" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isListingActionPending}
                      onClick={() =>
                        statusMutation.mutate({ listingId: listing.id, action: "submit" })
                      }
                    >
                      {pendingAction === "submit" ? <Spinner className="size-3.5" /> : null}
                      {listing.status === "unpublished" ? "Republish" : "Submit for review"}
                    </Button>
                  ) : null}
                  {listing.status === "live" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isListingActionPending}
                        onClick={() =>
                          statusMutation.mutate({ listingId: listing.id, action: "unpublish" })
                        }
                      >
                        {pendingAction === "unpublish" ? <Spinner className="size-3.5" /> : null}
                        Unpublish
                      </Button>
                      <Link
                        href={listingPublicPath({ id: listing.id, title: listing.title })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
                      >
                        View live
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </AccountListCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No listings yet"
          body="Create a draft listing here, then submit it for review when you’re ready."
        />
      )}

      <ListingEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        listingId={activeListingId}
        sellerTier={dashboard.sellerProfile?.tier}
        listingCount={listings.length}
      />
    </AccountViewWrap>
  );
}

export function AccountSavedView() {
  const savedQuery = useQuery({
    queryKey: ["account", "saved"],
    queryFn: fetchSavedItems,
  });
  const saved = savedQuery.data;

  return (
    <AccountViewWrap>
      <SectionHeading title="Saved" className="!mt-0" />
      <p className="mb-5 text-sm text-muted-foreground">Listings and requirements you saved while browsing.</p>
      {savedQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading saved items…</p>
      ) : saved && (saved.listings.length > 0 || saved.requirements.length > 0) ? (
        <div className="space-y-8">
          {saved.listings.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Saved listings
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.listings.map((listing) => (
                  <Link key={listing.id} href={listingPublicPath({ id: listing.id, title: listing.title })}>
                    <AccountGlass className="h-full rounded-[18px] p-4 transition hover:border-brand-mantis/25">
                      {listing.coverImage ? (
                        <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                          <Image src={listing.coverImage} alt="" fill className="object-cover" sizes="240px" />
                        </div>
                      ) : null}
                      <p className="font-bold text-brand-forest">{listing.title}</p>
                      {listing.sellerName ? (
                        <p className="mt-1 text-[12px] text-brand-forest/60">{listing.sellerName}</p>
                      ) : null}
                      <p className="mt-2 text-[12px] text-brand-forest/55">{listing.location || "UAE"}</p>
                    </AccountGlass>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          {saved.requirements.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Saved requirements
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.requirements.map((item) => (
                  <OpenRequirementCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          body="Tap save on listings or requirements in the app to build your shortlist here."
        />
      )}
    </AccountViewWrap>
  );
}

export function AccountOpenRequirementsView() {
  const requirementsQuery = useQuery({
    queryKey: ["account", "requirements", "open"],
    queryFn: () => fetchOpenRequirements(1, 48),
  });
  const items = requirementsQuery.data?.items ?? [];
  const total = requirementsQuery.data?.total ?? 0;

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Browse requirements"
        badge="Marketplace"
        description="Admin-approved buyer posts open for sellers to discover and apply. This is not your own posting history — use My requirements for that."
      />
      {!requirementsQuery.isPending ? (
        <p className="mb-5 text-sm text-muted-foreground">
          {total.toLocaleString()} open requirement{total === 1 ? "" : "s"} available now
        </p>
      ) : null}
      {requirementsQuery.isPending ? (
        <AccountCardGridSkeleton count={4} />
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <OpenRequirementCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No open requirements"
          body="When buyers post requirements, they appear here after the admin team reviews and approves them."
        />
      )}
    </AccountViewWrap>
  );
}

export function AccountMyRequirementsView({ dashboard }: { dashboard: AccountDashboard }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [activeRequirementId, setActiveRequirementId] = useState<string | null>(null);

  const mineQuery = useQuery({
    queryKey: ["account", "requirements", "mine"],
    queryFn: fetchMyRequirements,
    enabled: Boolean(dashboard.user.bid),
  });
  const items = mineQuery.data ?? [];

  function openCreate() {
    setEditorMode("create");
    setActiveRequirementId(null);
    setEditorOpen(true);
  }

  function openEdit(requirementId: string) {
    setEditorMode("edit");
    setActiveRequirementId(requirementId);
    setEditorOpen(true);
  }

  if (!dashboard.user.bid) {
    return (
      <AccountViewWrap>
        <EmptyState
          icon={Megaphone}
          title="Buyer requirements"
          body="Add a buyer identity to post and manage requirements."
        />
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <AccountViewIntro
          className="mb-0"
          title="My requirements"
          badge="Your posts"
          description="Post what you need and submit for admin review. Edits re-submit for review. Browse requirements is the public marketplace feed for sellers."
        />
        <Button type="button" className="shrink-0 font-bold" onClick={openCreate}>
          <Plus className="size-4" />
          Post requirement
        </Button>
      </div>
      {mineQuery.isPending ? (
        <AccountCardGridSkeleton count={4} />
      ) : items.length ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <AccountListCard key={item.id} className="flex min-w-0 flex-col p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {item.status ? (
                  <span className={requirementStatusClass(item.status)}>
                    {item.status.replaceAll("_", " ")}
                  </span>
                ) : null}
                <span className="rounded-md border border-brand-forest/10 bg-muted px-2 py-0.5 text-[10.5px] font-bold text-brand-forest/65">
                  {item.jobType.replaceAll("_", " ")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
              <h3 className="mt-2 text-[15px] font-bold leading-snug text-brand-forest">{item.title}</h3>
              <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-brand-forest/65">
                {item.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 gap-y-2">
                <p className="text-sm font-bold text-brand-mantis">
                  {formatAedRange(item.budgetMin, item.budgetMax)}
                </p>
                <p className="text-[12px] text-brand-forest/55">{item.location}</p>
              </div>
              {requirementEditable(item.status) ? (
                <div className="mt-4 border-t border-brand-forest/8 pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item.id)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </div>
              ) : null}
            </AccountListCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No requirements posted"
          body="Post what you need — after admin approval, sellers can discover and apply."
        />
      )}

      <RequirementEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        requirementId={activeRequirementId}
      />
    </AccountViewWrap>
  );
}

export function AccountReferralsView({ dashboard }: { dashboard: AccountDashboard }) {
  const summaryQuery = useQuery({
    queryKey: ["account", "referrals", "summary"],
    queryFn: fetchAccountReferralSummary,
    initialData: dashboard.referral ?? undefined,
  });
  const referredQuery = useQuery({
    queryKey: ["account", "referrals", "referred-users"],
    queryFn: fetchReferredUsers,
  });
  const leaderboardQuery = useQuery({
    queryKey: ["account", "referrals", "leaderboard"],
    queryFn: fetchReferralLeaderboard,
  });

  const referral = summaryQuery.data;
  const walletTotal = (referral?.wallet.totalEarned ?? 0) / 100;

  return (
    <AccountViewWrap>
      <SectionHeading title="Referrals" className="!mt-0" />
      <p className="mb-5 text-sm text-muted-foreground">Share Kattegat and earn when people join and subscribe.</p>

      {referral ? (
        <>
          <AccountGlass className="rounded-[20px] p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Referral wallet</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-mantis">
                {walletTotal.toFixed(2)} <span className="text-lg text-brand-forest">AED</span>
              </p>
              <p className="mt-1 text-[12.5px] text-brand-forest/65">
                {referral.activeReferrals} active referral{referral.activeReferrals === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <AccountGlass className="rounded-[16px] px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">This month</p>
                <p className="mt-1 text-xl font-extrabold text-brand-forest">{(referral.wallet.thisMonth / 100).toFixed(2)} AED</p>
              </AccountGlass>
              <AccountGlass className="rounded-[16px] px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pending</p>
                <p className="mt-1 text-xl font-extrabold text-brand-forest">{(referral.wallet.pending / 100).toFixed(2)} AED</p>
              </AccountGlass>
              <AccountGlass className="rounded-[16px] px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Paid out</p>
                <p className="mt-1 text-xl font-extrabold text-brand-forest">{(referral.wallet.paidOut / 100).toFixed(2)} AED</p>
              </AccountGlass>
            </div>
          </AccountGlass>
          <ReferralSharePanel referral={referral} className="mt-4" />
        </>
      ) : (
        <EmptyState icon={Gift} title="Referrals unavailable" body="Referral rewards will appear here when the program is enabled for your account." />
      )}

      <SectionHeading title="People you referred" />
      {referredQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading referred members…</p>
      ) : referredQuery.data?.length ? (
        <div className="flex flex-col gap-2">
          {referredQuery.data.map((user) => (
            <AccountGlass key={user.id} className="flex items-center gap-3 rounded-[16px] p-4">
              <AccountAvatar name={user.name} imageUrl={user.avatarUrl} className="size-10 rounded-full text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brand-forest">{user.name}</p>
                <p className="text-[12px] text-brand-forest/60">
                  {user.role} · joined {formatRelativeTime(user.joinedAt)}
                </p>
              </div>
              {user.isSubscribed ? (
                <span className="rounded-md border border-brand-emerald/35 bg-brand-emerald/10 px-2 py-0.5 text-[10px] font-bold text-brand-emerald">
                  Subscribed
                </span>
              ) : null}
            </AccountGlass>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No referrals yet" body="Share your link — when friends join, they appear here." />
      )}

      <SectionHeading title="Leaderboard" />
      {leaderboardQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
      ) : leaderboardQuery.data?.entries.length ? (
        <div className="flex flex-col gap-2">
          {leaderboardQuery.data.entries.slice(0, 10).map((entry) => (
            <AccountGlass
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 rounded-[16px] p-4",
                entry.isCurrentUser && "border-brand-mantis/35",
              )}
            >
              <span className="grid size-8 place-items-center rounded-full bg-brand-forest/5 text-xs font-extrabold text-brand-forest">
                {entry.rank}
              </span>
              <AccountAvatar name={entry.displayName} imageUrl={entry.avatarUrl} className="size-9 rounded-full text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brand-forest">
                  {entry.displayName}
                  {entry.isCurrentUser ? <span className="text-brand-mantis"> · You</span> : null}
                </p>
                <p className="text-[12px] text-brand-forest/60">{entry.referralCount} referrals</p>
              </div>
              {entry.rank <= 3 ? <Trophy className="size-4 text-brand-mantis" /> : null}
            </AccountGlass>
          ))}
        </div>
      ) : (
        <EmptyState icon={Trophy} title="Leaderboard warming up" body="Be among the first referrers on Kattegat." />
      )}
    </AccountViewWrap>
  );
}

const LEAD_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  in_progress: "In progress",
  confirmed: "Confirmed",
  completed: "Completed",
  not_proceeding: "Not proceeding",
};

function RecommendLeadsTracker({
  isPending,
  leads,
}: {
  isPending: boolean;
  leads: RecommendLead[] | undefined;
}) {
  return (
    <>
      {isPending ? (
        <AccountCardGridSkeleton count={3} columns={1} />
      ) : leads?.length ? (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <AccountListCard key={lead.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-brand-forest">{lead.clientName}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{formatRelativeTime(lead.createdAt)}</p>
                </div>
                <span className="rounded-md border border-brand-forest/10 bg-muted px-2 py-0.5 text-[10px] font-bold text-brand-forest">
                  {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-6 text-brand-forest/70">{lead.inquiry}</p>
              {lead.rewardAmountFils != null ? (
                <p className="mt-2 text-sm font-bold text-brand-mantis">
                  Reward: AED {(lead.rewardAmountFils / 100).toFixed(2)}
                </p>
              ) : null}
            </AccountListCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No recommended leads yet"
          body="Submit a lead from Recommend & earn and its status will appear here."
        />
      )}
    </>
  );
}

export function AccountRecommendView() {
  const queryClient = useQueryClient();
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    inquiry: "",
    clientPhone: "",
    clientEmail: "",
  });

  const leadsQuery = useQuery({
    queryKey: ["account", "recommend", "leads"],
    queryFn: fetchRecommendLeads,
  });

  useEffect(() => {
    if (!trackerOpen) return;
    document.querySelector(".account-main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [trackerOpen]);

  const submit = useMutation({
    mutationFn: () => submitRecommendLead(form),
    onSuccess: async () => {
      setForm({ clientName: "", inquiry: "", clientPhone: "", clientEmail: "" });
      await queryClient.invalidateQueries({ queryKey: ["account", "recommend", "leads"] });
    },
  });

  const canSubmit =
    form.clientName.trim().length > 0 &&
    form.inquiry.trim().length > 0 &&
    (form.clientPhone.trim().length > 0 || form.clientEmail.trim().length > 0) &&
    !submit.isPending;

  if (trackerOpen) {
    return (
      <AccountViewWrap>
        <Button
          type="button"
          variant="ghost"
          className="mb-4 -ml-2 h-9 px-2 text-brand-forest/70 hover:text-brand-forest"
          onClick={() => setTrackerOpen(false)}
        >
          <ArrowLeft className="size-4" />
          Back to Recommend & earn
        </Button>
        <SectionHeading title="Recommended leads" className="!mt-0" />
        <p className="mb-5 text-sm text-muted-foreground">
          Follow each recommendation from review to completion. Earnings are credited to your wallet once our team confirms the amount.
        </p>
        <RecommendLeadsTracker isPending={leadsQuery.isPending} leads={leadsQuery.data} />
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <SectionHeading title="Recommend & earn" className="!mt-0" />
      <p className="mb-5 text-sm text-muted-foreground">
        Know someone who needs a service we offer? Pass it along — we handle it end to end and you earn a share of the management fee.
      </p>

      <button
        type="button"
        className="mb-5 w-full rounded-[20px] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mantis/40"
        onClick={() => setTrackerOpen(true)}
      >
        <AccountGlass className="rounded-[20px] p-5 transition hover:border-brand-mantis/25 hover:bg-brand-forest/[0.02]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-brand-forest">Track recommended leads</h3>
              <p className="mt-1 text-[13px] text-brand-forest/65">
                See each lead&apos;s status and whether it has earned yet.
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </AccountGlass>
      </button>

      <AccountGlass className="rounded-[20px] p-5">
        <h3 className="font-bold text-brand-forest">Submit a lead</h3>
        <p className="mt-1 text-[13px] text-brand-forest/65">Share who needs talent and what they&apos;re looking for.</p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            submit.mutate();
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="recommend-client-name">Client name</Label>
            <Input
              id="recommend-client-name"
              value={form.clientName}
              onChange={(e) => setForm((c) => ({ ...c, clientName: e.target.value }))}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="recommend-inquiry">What&apos;s the job?</Label>
            <Textarea
              id="recommend-inquiry"
              value={form.inquiry}
              onChange={(e) => setForm((c) => ({ ...c, inquiry: e.target.value }))}
              rows={4}
              className="min-h-[96px] rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommend-phone">Client phone</Label>
            <Input
              id="recommend-phone"
              type="tel"
              value={form.clientPhone}
              onChange={(e) => setForm((c) => ({ ...c, clientPhone: e.target.value }))}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommend-email">Client email</Label>
            <Input
              id="recommend-email"
              type="email"
              autoCapitalize="none"
              value={form.clientEmail}
              onChange={(e) => setForm((c) => ({ ...c, clientEmail: e.target.value }))}
              className="h-10 rounded-xl"
            />
          </div>
          <p className="text-[12px] text-muted-foreground sm:col-span-2">Provide at least a phone number or email so our team can follow up.</p>
          {submit.isError ? (
            <p className="text-sm text-red-600 sm:col-span-2">
              {submit.error instanceof Error ? submit.error.message : "Could not submit lead."}
            </p>
          ) : null}
          {submit.isSuccess ? (
            <p className="text-sm font-semibold text-brand-mantis sm:col-span-2">Lead submitted — we&apos;ll be in touch.</p>
          ) : null}
          <Button type="submit" disabled={!canSubmit} className="rounded-xl sm:col-span-2 sm:w-fit">
            {submit.isPending ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
            Submit lead
          </Button>
        </form>
      </AccountGlass>
    </AccountViewWrap>
  );
}
