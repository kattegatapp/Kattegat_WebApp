"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Inbox,
  Loader2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminPath } from "@/lib/admin/paths";
import {
  fetchVettedApplications,
  reviewVettedApplication,
  type AdminVettedApplication,
  type VettedReviewDecision,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value));

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const badgeTone = (status: string) =>
  cn(
    "border",
    status === "accepted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "under_review"
        ? "border-brand-emerald/40 bg-brand-mantis/10 text-brand-forest"
        : status === "waitlisted"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-border bg-muted/40 text-brand-forest",
  );

function formatBudget(fils: number | null) {
  if (fils == null) return null;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(fils / 100);
}

function PageIntro({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {count != null ? (
        <Badge variant="outline" className="bg-white">
          {count} records
        </Badge>
      ) : null}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="ios-glass-pane border-dashed border-white/70 bg-transparent">
      <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-forest/5 text-brand-forest">
          <Inbox className="size-7" />
        </span>
        <p className="font-bold text-brand-forest">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  item,
  mode,
  mutating,
  decisionPending,
  onReview,
  onDeny,
}: {
  item: AdminVettedApplication;
  mode: "queue" | "accepted";
  mutating: boolean;
  decisionPending: (decision: VettedReviewDecision) => boolean;
  onReview: (decision: VettedReviewDecision) => void;
  onDeny: () => void;
}) {
  const budget = formatBudget(item.budget);

  return (
    <Card className="ios-glass-pane border-white/80 bg-transparent shadow-[0_10px_35px_rgb(0_57_18/0.05)]">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <CardTitle>
              <Link
                href={adminPath(`/users/${encodeURIComponent(item.memberId)}`)}
                className="inline-flex items-center gap-1 font-bold text-brand-forest underline-offset-4 hover:underline"
              >
                {item.memberName || "Unnamed seller"}
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </CardTitle>
            <CardDescription>
              {item.categoryName || "Uncategorized"} · {date(item.createdAt)}
            </CardDescription>
            <Link
              href={adminPath(`/users/${encodeURIComponent(item.memberId)}`)}
              className="mt-1 inline-block text-xs font-semibold text-brand-blue hover:underline"
            >
              Open user profile (White Glove management)
            </Link>
          </div>
          <Badge className={cn("w-fit shrink-0", badgeTone(item.status))}>{label(item.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            What they need
          </p>
          <p className="mt-1 text-sm leading-6">{item.need}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {budget ? (
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Budget
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-forest">{budget}</p>
            </div>
          ) : null}
          {item.contactPreference ? (
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact preference
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-forest">
                {item.contactPreference}
              </p>
            </div>
          ) : null}
        </div>

        {mode === "accepted" ? (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <CircleCheck className="mt-0.5 size-5 shrink-0" />
            <div>
              <p>Accepted White Glove seller</p>
              <p className="mt-1 text-xs font-normal text-emerald-800/80">
                Manage their account, listings, and client work from the user profile — not from
                Vetted chats.
              </p>
            </div>
          </div>
        ) : null}

        {mode === "queue" && item.status === "submitted" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-sm font-semibold text-amber-900">New White Glove application</p>
            <p className="mt-1 text-xs text-amber-800/80">
              Waitlist the seller or start an active review.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="bg-white font-bold"
                disabled={mutating}
                onClick={() => onReview("waitlisted")}
              >
                {decisionPending("waitlisted") ? <Loader2 className="animate-spin" /> : <Clock3 />}
                Add to waitlist
              </Button>
              <Button className="font-bold" disabled={mutating} onClick={() => onReview("under_review")}>
                {decisionPending("under_review") ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Start review
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "queue" && item.status === "waitlisted" ? (
          <div className="rounded-xl border border-brand-emerald/40 bg-brand-mantis/10 p-4">
            <p className="text-sm font-semibold text-brand-forest">On the White Glove waitlist</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start reviewing when a managed spot is available.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button className="font-bold" disabled={mutating} onClick={() => onReview("under_review")}>
                {decisionPending("under_review") ? <Loader2 className="animate-spin" /> : <Clock3 />}
                Start review
              </Button>
              <Button variant="destructive" className="font-bold" disabled={mutating} onClick={onDeny}>
                {decisionPending("denied") ? <Loader2 className="animate-spin" /> : <X />}
                Deny & delete
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "queue" && item.status === "under_review" ? (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-brand-forest">Final decision</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Accept to grant White Glove management, or deny to remove this application from the
              queue permanently.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button className="font-bold" disabled={mutating} onClick={() => onReview("accepted")}>
                {decisionPending("accepted") ? <Loader2 className="animate-spin" /> : <Check />}
                Accept application
              </Button>
              <Button variant="destructive" className="font-bold" disabled={mutating} onClick={onDeny}>
                {decisionPending("denied") ? <Loader2 className="animate-spin" /> : <X />}
                Deny & delete
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function WhiteGloveApplicationsPage() {
  const client = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [denying, setDenying] = useState<{ id: string; name: string } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "vetted-applications", "queue"],
    queryFn: () => fetchVettedApplications(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: VettedReviewDecision }) =>
      reviewVettedApplication(id, decision),
    onSuccess: () => {
      setDenying(null);
      void client.invalidateQueries({ queryKey: ["admin", "vetted-applications"] });
      void client.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  if (query.isPending) {
    return <div className="min-h-40" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading</span></div>;
  }

  if (query.error) {
    return (
      <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
        <X />
        <AlertTitle>Could not load White Glove applications</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : "Try again shortly."}
        </AlertDescription>
      </Alert>
    );
  }

  const queue = (query.data ?? []).filter((item) => item.status !== "accepted");
  const visible =
    statusFilter === "all" ? queue : queue.filter((item) => item.status === statusFilter);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageIntro
        title="White Glove applications"
        description="Review sellers who applied for managed White Glove service. Accepted sellers are managed from their user profile. Denied applications are removed from this queue."
        count={queue.length}
      />

      {mutation.isSuccess ? (
        <Alert className="ios-glass-pane rounded-2xl border-emerald-200/60 bg-emerald-50/35 text-emerald-950 backdrop-blur-xl">
          <CircleCheck />
          <AlertTitle>Application updated</AlertTitle>
          <AlertDescription>The White Glove queue reflects your decision.</AlertDescription>
        </Alert>
      ) : null}
      {mutation.isError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <X />
          <AlertTitle>Update failed</AlertTitle>
          <AlertDescription>
            {mutation.error instanceof Error ? mutation.error.message : "Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      {queue.length ? (
        <Card className="ios-glass-pane border-white/80 bg-transparent">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-forest">Application status</p>
              <p className="text-xs text-muted-foreground">
                Pending applications only — accepted sellers live under Accepted Applications.
              </p>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger className="w-full bg-white sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : null}

      {!queue.length ? (
        <EmptyState
          title="No pending White Glove applications"
          description="When a seller applies for White Glove on mobile, their request will appear here for review."
        />
      ) : !visible.length ? (
        <EmptyState
          title={`No ${label(statusFilter).toLowerCase()} applications`}
          description="Choose another status to view matching applications."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((item) => {
            const isUpdating = mutation.isPending && mutation.variables?.id === item.id;
            return (
              <ApplicationCard
                key={item.id}
                item={item}
                mode="queue"
                mutating={mutation.isPending}
                decisionPending={(decision) =>
                  Boolean(isUpdating && mutation.variables?.decision === decision)
                }
                onReview={(decision) => mutation.mutate({ id: item.id, decision })}
                onDeny={() =>
                  setDenying({ id: item.id, name: item.memberName || "this seller" })
                }
              />
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(denying)} onOpenChange={(open) => !open && setDenying(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny {denying?.name}?</DialogTitle>
            <DialogDescription>
              The seller is notified, and this application is permanently deleted from the White
              Glove applications table. Their user account stays intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() => denying && mutation.mutate({ id: denying.id, decision: "denied" })}
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <X />}
              Yes, deny and delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AcceptedWhiteGloveApplicationsPage() {
  const query = useQuery({
    queryKey: ["admin", "vetted-applications", "accepted"],
    queryFn: () => fetchVettedApplications("accepted"),
    retry: false,
  });

  if (query.isPending) {
    return <div className="min-h-40" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading</span></div>;
  }

  if (query.error) {
    return (
      <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
        <X />
        <AlertTitle>Could not load accepted applications</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : "Try again shortly."}
        </AlertDescription>
      </Alert>
    );
  }

  const accepted = query.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageIntro
        title="Accepted Applications"
        description="Sellers approved for White Glove. Open their user profile to manage the account — Vetted chats are only for Contact Agent relays on Starter listings."
        count={accepted.length}
      />

      {!accepted.length ? (
        <EmptyState
          title="No accepted White Glove applications yet"
          description="Once you accept an application, it moves here so the managed roster is easy to scan."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {accepted.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              mode="accepted"
              mutating={false}
              decisionPending={() => false}
              onReview={() => undefined}
              onDeny={() => undefined}
            />
          ))}
        </div>
      )}

      <Card className="border-brand-mantis/25 bg-brand-mantis/7">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-brand-forest">
          <UserRound className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">White Glove vs Vetted chats</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              White Glove sellers are fully managed from their profile. Vetted chats handle buyers
              who tapped Contact Agent on a Starter listing — with the listing quote and{" "}
              <span className="font-semibold">/listing/…</span> deep link so you know which
              service they mean.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
