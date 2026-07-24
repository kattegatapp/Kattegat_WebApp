"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  Heart,
  MapPin,
  Megaphone,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import {
  AccountCatalogGrid,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
  SectionHeading,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { ListingEditorDialog } from "@/features/account/listing-editor-dialog";
import { RequirementEditorDialog } from "@/features/account/requirement-editor-dialog";
import { ApplyToRequirementDialog } from "@/features/account/account-applications-view";
import { Button } from "@/components/ui/button";
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
import { MoneyText } from "@/components/currency";
import {
  fetchMyRequirements,
  fetchOpenRequirements,
  requirementEditable,
  type AccountRequirement,
} from "@/lib/api/account-requirements";
import { JOB_TYPE_OPTIONS } from "@/lib/validations/requirement";
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

function OpenRequirementCard({
  item,
  canApply,
  onApply,
}: {
  item: AccountRequirement;
  canApply?: boolean;
  onApply?: (item: AccountRequirement) => void;
}) {
  const jobLabel =
    JOB_TYPE_OPTIONS.find((option) => option.value === item.jobType)?.label ??
    item.jobType.replaceAll("_", " ");

  return (
    <AccountListCard className="flex h-full min-w-0 flex-col overflow-hidden p-0 transition hover:border-brand-mantis/30 hover:shadow-md">
      <Link
        href={requirementPublicPath({ id: item.id, title: item.title })}
        className="group flex min-w-0 flex-1 flex-col p-3.5 sm:p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-brand-forest/10 bg-brand-forest/[0.03] px-2 py-0.5 text-[10px] font-bold text-brand-forest/65">
            {jobLabel}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-[14px] font-extrabold leading-snug tracking-tight text-brand-forest transition group-hover:text-brand-forest/85">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-brand-forest/55">
            {item.description}
          </p>
        ) : (
          <div className="mt-1.5 min-h-[2.5rem]" />
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-brand-forest/8 pt-2.5">
          <MoneyText className="truncate text-[13px] font-extrabold text-brand-mantis">
            {formatAedRange(item.budgetMin, item.budgetMax)}
          </MoneyText>
          <p className="inline-flex max-w-[48%] items-center gap-1 text-[11px] font-medium text-brand-forest/55">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{item.location}</span>
          </p>
        </div>
      </Link>

      {canApply && onApply ? (
        <div className="border-t border-brand-forest/8 px-3.5 py-2.5 sm:px-4">
          <Button
            type="button"
            size="sm"
            className="h-8 w-full text-xs font-bold"
            onClick={() => onApply(item)}
          >
            Apply
          </Button>
        </div>
      ) : null}
    </AccountListCard>
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
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : listings.length ? (
        <AccountCatalogGrid>
          {listings.map((listing: AccountListing) => {
            const isListingActionPending = pendingListingId === listing.id;
            const pendingAction = isListingActionPending ? statusMutation.variables?.action : null;

            return (
              <AccountListCard key={listing.id} className="flex h-full flex-col p-3.5 sm:p-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={listingStatusClass(listing.status)}>
                      {listing.status.replaceAll("_", " ")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(listing.updatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[14px] font-extrabold leading-snug text-brand-forest">
                    {listing.title}
                  </h3>
                  {listing.description ? (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-brand-forest/60">
                      {listing.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-brand-forest/55">{listing.location || "UAE"}</p>
                  {listing.rejectionReason ? (
                    <p className="mt-2 text-[11px] text-red-600">Rejected: {listing.rejectionReason}</p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-forest/8 pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openEdit(listing.id)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  {listing.status === "draft" ||
                  listing.status === "rejected" ||
                  listing.status === "unpublished" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={isListingActionPending}
                      onClick={() =>
                        statusMutation.mutate({ listingId: listing.id, action: "submit" })
                      }
                    >
                      {pendingAction === "submit" ? <Spinner className="size-3.5" /> : null}
                      {listing.status === "unpublished" ? "Republish" : "Submit"}
                    </Button>
                  ) : null}
                  {listing.status === "live" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
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
                        View
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </>
                  ) : null}
                </div>
              </AccountListCard>
            );
          })}
        </AccountCatalogGrid>
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
      <p className="mb-5 text-sm text-muted-foreground">
        Listings and requirements you saved while browsing.
      </p>
      {savedQuery.isPending ? (
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : saved && (saved.listings.length > 0 || saved.requirements.length > 0) ? (
        <div className="space-y-8">
          {saved.listings.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Saved listings
              </h3>
              <AccountCatalogGrid>
                {saved.listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={listingPublicPath({ id: listing.id, title: listing.title })}
                  >
                    <AccountListCard className="h-full p-3.5 transition hover:border-brand-mantis/30 hover:shadow-md sm:p-4">
                      {listing.coverImage ? (
                        <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={listing.coverImage}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        </div>
                      ) : null}
                      <p className="line-clamp-2 text-[14px] font-extrabold leading-snug text-brand-forest">
                        {listing.title}
                      </p>
                      {listing.sellerName ? (
                        <p className="mt-1 truncate text-[12px] text-brand-forest/60">
                          {listing.sellerName}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-brand-forest/55">
                        {listing.location || "UAE"}
                      </p>
                    </AccountListCard>
                  </Link>
                ))}
              </AccountCatalogGrid>
            </section>
          ) : null}
          {saved.requirements.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Saved requirements
              </h3>
              <AccountCatalogGrid>
                {saved.requirements.map((item) => (
                  <OpenRequirementCard key={item.id} item={item} />
                ))}
              </AccountCatalogGrid>
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

export function AccountOpenRequirementsView({
  canApply = false,
}: {
  canApply?: boolean;
}) {
  const [applyTarget, setApplyTarget] = useState<AccountRequirement | null>(null);
  const [jobType, setJobType] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const deferredLocation = useDeferredValue(location.trim());
  const pageSize = 24;

  const requirementsQuery = useInfiniteQuery({
    queryKey: ["account", "requirements", "open", jobType, deferredLocation, pageSize],
    queryFn: ({ pageParam }) =>
      fetchOpenRequirements(pageParam, pageSize, {
        jobType: jobType ?? undefined,
        location: deferredLocation || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
  });

  const items = useMemo(
    () => requirementsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [requirementsQuery.data],
  );
  const total = requirementsQuery.data?.pages[0]?.total ?? 0;
  const hasActiveFilters = Boolean(jobType) || deferredLocation.length > 0;

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Browse requirements"
        badge="Marketplace"
        description="Open buyer posts you can discover and apply to."
      />

      <AccountGlass className="mb-5 rounded-[18px] p-3 sm:p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Search by location"
            className="h-11 border-brand-forest/10 bg-white pl-9"
            aria-label="Filter requirements by location"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setJobType(null)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
              !jobType
                ? "border-brand-forest bg-brand-forest text-white"
                : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
            )}
          >
            All types
          </button>
          {JOB_TYPE_OPTIONS.map((option) => {
            const selected = jobType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setJobType(selected ? null : option.value)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
                  selected
                    ? "border-brand-mantis/50 bg-brand-mantis/15 text-brand-forest"
                    : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
                )}
              >
                {option.label}
              </button>
            );
          })}
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setJobType(null);
                setLocation("");
              }}
              className="shrink-0 rounded-full border border-brand-forest/10 bg-white px-3.5 py-1.5 text-[12px] font-bold text-brand-forest/55 hover:bg-brand-forest/5"
            >
              Clear
            </button>
          ) : null}
        </div>
      </AccountGlass>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {requirementsQuery.isPending
            ? "Loading…"
            : `Showing ${items.length.toLocaleString()} of ${total.toLocaleString()}${
                hasActiveFilters ? " matching filters" : " open"
              }`}
        </p>
      </div>

      {requirementsQuery.isPending ? (
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : items.length ? (
        <>
          <AccountCatalogGrid>
            {items.map((item) => (
              <OpenRequirementCard
                key={item.id}
                item={item}
                canApply={canApply}
                onApply={setApplyTarget}
              />
            ))}
          </AccountCatalogGrid>
          {requirementsQuery.hasNextPage ? (
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="font-bold"
                disabled={requirementsQuery.isFetchingNextPage}
                onClick={() => void requirementsQuery.fetchNextPage()}
              >
                {requirementsQuery.isFetchingNextPage ? <Spinner className="size-4" /> : null}
                Load more
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={Search}
          title={hasActiveFilters ? "No matching requirements" : "No open requirements"}
          body={
            hasActiveFilters
              ? "Try a different location or job type."
              : "When buyers post requirements, they appear here after admin approval."
          }
        />
      )}

      <ApplyToRequirementDialog
        open={Boolean(applyTarget)}
        onOpenChange={(open) => {
          if (!open) setApplyTarget(null);
        }}
        requirementId={applyTarget?.id ?? null}
        requirementTitle={applyTarget?.title ?? ""}
      />
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
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : items.length ? (
        <AccountCatalogGrid>
          {items.map((item) => (
            <AccountListCard key={item.id} className="flex h-full min-w-0 flex-col p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                {item.status ? (
                  <span className={requirementStatusClass(item.status)}>
                    {item.status.replaceAll("_", " ")}
                  </span>
                ) : null}
                <span className="rounded-full border border-brand-forest/10 bg-muted px-2 py-0.5 text-[10px] font-bold text-brand-forest/65">
                  {JOB_TYPE_OPTIONS.find((option) => option.value === item.jobType)?.label ??
                    item.jobType.replaceAll("_", " ")}
                </span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-[14px] font-extrabold leading-snug text-brand-forest">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-brand-forest/60">
                {item.description}
              </p>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-brand-forest/8 pt-2.5">
                <MoneyText className="text-[13px] font-extrabold text-brand-mantis">
                  {formatAedRange(item.budgetMin, item.budgetMax)}
                </MoneyText>
                <p className="truncate text-[11px] text-brand-forest/55">{item.location}</p>
              </div>
              {requirementEditable(item.status) ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 w-full text-xs"
                    onClick={() => openEdit(item.id)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </div>
              ) : null}
            </AccountListCard>
          ))}
        </AccountCatalogGrid>
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
