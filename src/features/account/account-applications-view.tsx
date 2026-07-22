"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  ExternalLink,
  Inbox,
  Loader2,
  MapPin,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AccountAvatar,
  AccountCatalogGrid,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import type { AccountIdentity } from "@/features/account/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  awardApplication,
  declineApplication,
  fetchMyApplications,
  fetchReceivedApplications,
  shortlistApplication,
  type ApplicationStatus,
  type MyApplication,
  type ReceivedApplication,
} from "@/lib/api/account-applications";
import { formatAedRange, formatRelativeTime } from "@/lib/api/account-home";
import { ApiRequestError } from "@/lib/api/client";
import { requirementPublicPath } from "@/lib/navigation/public-paths";
import { JOB_TYPE_OPTIONS } from "@/lib/validations/requirement";
import { cn } from "@/lib/utils";

const APPLICATION_STATUS_FILTERS: Array<{ value: ApplicationStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "awarded", label: "Awarded" },
  { value: "declined", label: "Declined" },
];

function formatAedFils(fils: number | null | undefined) {
  if (fils == null) return null;
  return `AED ${(fils / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function jobTypeLabel(jobType: string) {
  return (
    JOB_TYPE_OPTIONS.find((option) => option.value === jobType)?.label ??
    jobType.replaceAll("_", " ")
  );
}

function statusClass(status: string) {
  const tone =
    status === "awarded"
      ? "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald"
      : status === "shortlisted"
        ? "border-brand-mantis/40 bg-brand-mantis/12 text-brand-forest"
        : status === "viewed"
          ? "border-brand-blue/30 bg-brand-blue/10 text-brand-blue"
          : status === "declined" || status === "withdrawn"
            ? "border-red-300/50 bg-red-50 text-red-700"
            : "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/70";
  return cn("rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize", tone);
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <AccountGlass className="rounded-[18px] p-10 text-center">
      <Icon className="mx-auto size-7 text-brand-mantis" />
      <p className="mt-4 font-bold text-brand-forest">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-brand-forest/65">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </AccountGlass>
  );
}

export function AccountApplicationsView({ identity }: { identity: AccountIdentity }) {
  return identity === "seller" ? <SellerApplicationsPanel /> : <BuyerApplicantsPanel />;
}

function SellerApplicationsPanel() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const applicationsQuery = useQuery({
    queryKey: ["account", "applications", "mine"],
    queryFn: fetchMyApplications,
  });
  const items = applicationsQuery.data ?? [];

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: items.length };
    for (const item of items) {
      next[item.status] = (next[item.status] ?? 0) + 1;
    }
    return next;
  }, [items]);

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="My applications"
        badge="Marketplace"
        description="Pitches you’ve sent to open buyer requirements."
      />

      <AccountGlass className="mb-5 rounded-[18px] p-3 sm:p-4">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {APPLICATION_STATUS_FILTERS.map((option) => {
            const selected = statusFilter === option.value;
            const count = counts[option.value] ?? 0;
            if (option.value !== "all" && count === 0) return null;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
                  selected
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    selected ? "bg-white/15 text-white" : "bg-brand-forest/5 text-brand-forest/55",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </AccountGlass>

      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {applicationsQuery.isPending
            ? "Loading…"
            : `${filtered.length} application${filtered.length === 1 ? "" : "s"}${
                statusFilter !== "all" ? ` · ${statusFilter}` : ""
              }`}
        </p>
      </div>

      {applicationsQuery.isPending ? (
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : filtered.length ? (
        <AccountCatalogGrid>
          {filtered.map((item) => (
            <SellerApplicationCard key={item.id} item={item} />
          ))}
        </AccountCatalogGrid>
      ) : items.length ? (
        <EmptyState
          icon={Inbox}
          title="Nothing in this status"
          body="Try another filter to see the rest of your applications."
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
              Show all
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Send}
          title="No applications yet"
          body="Browse open requirements and send a pitch when you find a fit."
          action={
            <Link
              href="/account?view=requirements"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-forest px-3 text-sm font-bold text-white"
            >
              Browse requirements
            </Link>
          }
        />
      )}
    </AccountViewWrap>
  );
}

function SellerApplicationCard({ item }: { item: MyApplication }) {
  const quote = formatAedFils(item.quote);
  const requirementHref = requirementPublicPath({
    id: item.requirement.id,
    title: item.requirement.title,
  });

  return (
    <AccountListCard className="flex h-full flex-col overflow-hidden p-0 transition hover:border-brand-mantis/25 hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={statusClass(item.status)}>{item.status.replaceAll("_", " ")}</span>
          <span className="rounded-full border border-brand-forest/10 bg-brand-forest/[0.03] px-2 py-0.5 text-[10px] font-bold text-brand-forest/65">
            {jobTypeLabel(item.requirement.jobType)}
          </span>
        </div>

        <div className="min-w-0">
          <Link href={requirementHref} className="group inline-flex max-w-full items-start gap-1.5">
            <h3 className="line-clamp-2 text-[14px] font-extrabold leading-snug tracking-tight text-brand-forest transition group-hover:text-brand-forest/80">
              {item.requirement.title}
            </h3>
            <ExternalLink
              className="mt-0.5 size-3.5 shrink-0 text-brand-forest/30 transition group-hover:text-brand-mantis"
              aria-hidden
            />
          </Link>
          <p className="mt-1.5 inline-flex max-w-full items-center gap-1 text-[11px] font-medium text-brand-forest/60">
            <MapPin className="size-3 shrink-0 text-brand-forest/35" aria-hidden />
            <span className="truncate">{item.requirement.location}</span>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Applied {formatRelativeTime(item.createdAt)}
          </p>
        </div>

        <div className="rounded-[12px] border border-brand-forest/8 bg-[#F7F9F8] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Your pitch
          </p>
          <p className="mt-1 line-clamp-3 text-[12px] leading-5 text-brand-forest/75">{item.pitch}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-brand-forest/8 pt-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Your quote
            </p>
            <p className="mt-0.5 text-[13px] font-extrabold text-brand-mantis">{quote ?? "No quote"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Budget
            </p>
            <p className="mt-0.5 text-[12px] font-bold text-brand-forest/70">
              {formatAedRange(item.requirement.budgetMin, item.requirement.budgetMax)}
            </p>
          </div>
        </div>
      </div>
    </AccountListCard>
  );
}

function BuyerApplicantsPanel() {
  const client = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const receivedQuery = useQuery({
    queryKey: ["account", "applications", "received"],
    queryFn: fetchReceivedApplications,
  });

  const grouped = useMemo(() => {
    const items = receivedQuery.data ?? [];
    const map = new Map<string, { title: string; status: string; applications: ReceivedApplication[] }>();
    for (const item of items) {
      const existing = map.get(item.requirementId);
      if (existing) {
        existing.applications.push(item);
      } else {
        map.set(item.requirementId, {
          title: item.requirement.title,
          status: item.requirement.status,
          applications: [item],
        });
      }
    }
    return [...map.entries()];
  }, [receivedQuery.data]);

  const shortlist = useMutation({
    mutationFn: shortlistApplication,
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "applications"] });
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : "Could not shortlist.");
    },
  });
  const decline = useMutation({
    mutationFn: declineApplication,
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "applications"] });
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : "Could not decline.");
    },
  });
  const award = useMutation({
    mutationFn: awardApplication,
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "applications"] });
      await client.invalidateQueries({ queryKey: ["account", "requirements"] });
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : "Could not award.");
    },
  });

  const busy = shortlist.isPending || decline.isPending || award.isPending;

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Applicants"
        badge="Marketplace"
        description="Review pitches on your requirements, shortlist favourites, and award a partner."
      />

      {actionError ? <p className="mb-4 text-sm text-red-600">{actionError}</p> : null}

      {receivedQuery.isPending ? (
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : grouped.length ? (
        <div className="flex flex-col gap-8">
          {grouped.map(([requirementId, group]) => (
            <section key={requirementId} className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-brand-forest">
                  {group.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {group.applications.length} applicant
                  {group.applications.length === 1 ? "" : "s"} · requirement{" "}
                  {group.status.replaceAll("_", " ")}
                </p>
              </div>
              <AccountCatalogGrid>
                {group.applications.map((item) => (
                  <AccountListCard
                    key={item.id}
                    className="flex h-full flex-col p-3.5 sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AccountAvatar
                        name={item.seller.displayName ?? "Seller"}
                        imageUrl={item.seller.avatarUrl}
                        className="size-10 shrink-0 rounded-full text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-extrabold text-brand-forest">
                            {item.seller.displayName ?? "Seller"}
                          </p>
                          <span className={statusClass(item.status)}>
                            {item.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {item.seller.tier.replaceAll("_", " ")}
                          {item.seller.reviewCount > 0
                            ? ` · ${item.seller.aggregateRating.toFixed(1)}★ (${item.seller.reviewCount})`
                            : ""}
                          {" · "}
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex-1 rounded-[12px] border border-brand-forest/8 bg-[#F7F9F8] px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Pitch
                      </p>
                      <p className="mt-1 line-clamp-4 text-[12px] leading-5 text-brand-forest/75">
                        {item.pitch}
                      </p>
                    </div>
                    {item.quote != null ? (
                      <p className="mt-2 text-[13px] font-extrabold text-brand-mantis">
                        Quote {formatAedFils(item.quote)}
                      </p>
                    ) : null}
                    {item.status !== "awarded" && item.status !== "declined" ? (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-brand-forest/8 pt-3">
                        {item.status !== "shortlisted" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={busy}
                            onClick={() => shortlist.mutate(item.id)}
                          >
                            Shortlist
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 bg-brand-mantis text-xs font-bold text-brand-forest hover:bg-brand-mantis/90"
                          disabled={busy}
                          onClick={() => award.mutate(item.id)}
                        >
                          {award.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                          Award
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          disabled={busy}
                          onClick={() => decline.mutate(item.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    ) : null}
                  </AccountListCard>
                ))}
              </AccountCatalogGrid>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No applicants yet"
          body="When sellers apply to your requirements, they will show up here for review."
        />
      )}
    </AccountViewWrap>
  );
}

export function ApplyToRequirementDialog({
  open,
  onOpenChange,
  requirementId,
  requirementTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: string | null;
  requirementTitle: string;
}) {
  const client = useQueryClient();
  const [pitch, setPitch] = useState("");
  const [quoteAed, setQuoteAed] = useState("");
  const [error, setError] = useState<string | null>(null);

  const apply = useMutation({
    mutationFn: async () => {
      if (!requirementId) throw new Error("Missing requirement.");
      const trimmed = pitch.trim();
      if (trimmed.length < 1) throw new Error("Write a short pitch first.");
      const quoteValue = quoteAed.trim() ? Number(quoteAed) : undefined;
      if (quoteValue != null && (!Number.isFinite(quoteValue) || quoteValue < 0)) {
        throw new Error("Quote must be a valid AED amount.");
      }
      const { applyToRequirement } = await import("@/lib/api/account-applications");
      return applyToRequirement(requirementId, {
        pitch: trimmed,
        quote: quoteValue != null ? Math.round(quoteValue * 100) : undefined,
      });
    },
    onSuccess: async () => {
      setPitch("");
      setQuoteAed("");
      setError(null);
      onOpenChange(false);
      await client.invalidateQueries({ queryKey: ["account", "applications"] });
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Could not apply.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPitch("");
          setQuoteAed("");
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to requirement</DialogTitle>
          <DialogDescription>
            Send a pitch for “{requirementTitle}”. The buyer will see this in their applicants list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="apply-pitch">Your pitch</Label>
            <Textarea
              id="apply-pitch"
              value={pitch}
              onChange={(event) => setPitch(event.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Explain fit, experience, and availability"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apply-quote">Optional quote (AED)</Label>
            <input
              id="apply-quote"
              type="number"
              min={0}
              step={1}
              value={quoteAed}
              onChange={(event) => setQuoteAed(event.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              placeholder="e.g. 2500"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" disabled={apply.isPending} onClick={() => apply.mutate()}>
            {apply.isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
            Send application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
