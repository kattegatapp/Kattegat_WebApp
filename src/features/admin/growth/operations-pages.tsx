"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Loader2,
  Mail,
  Phone,
  UserRound,
  UserRoundX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPageHeader,
  AdminQueryError,
} from "@/features/admin/shared/query-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminPath } from "@/lib/admin/paths";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import {
  fetchFoundingApplications,
  fetchRecommendLeads,
  reviewFoundingApplication,
  updateRecommendLead,
  type RecommendLeadStatus,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(
    new Date(value),
  );
const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const badgeTone = (status: string) =>
  cn(
    "border",
    status === "accepted" || status === "completed" || status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "rejected" ||
          status === "not_proceeding" ||
          status === "banned"
        ? "border-red-200 bg-red-50 text-red-800"
        : status === "in_progress" || status === "under_review"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-amber-200 bg-amber-50 text-amber-900",
  );

function LeadProgress({ status }: { status: RecommendLeadStatus }) {
  const steps = ["Contact client", "Confirm interest", "Complete referral"];
  const active =
    status === "submitted"
      ? 0
      : status === "in_progress"
        ? 1
        : status === "confirmed"
          ? 2
          : status === "completed"
            ? 3
            : -1;
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Lead progress
      </p>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="space-y-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full",
                active > index
                  ? "bg-emerald-500"
                  : active === index
                    ? "bg-brand-mantis"
                    : "bg-border",
              )}
            />
            <p
              className={cn(
                "text-[11px] font-semibold leading-snug",
                active >= index ? "text-brand-forest" : "text-muted-foreground",
              )}
            >
              {index + 1}. {step}
            </p>
          </div>
        ))}
      </div>
      {status === "not_proceeding" ? (
        <p className="mt-3 text-xs font-semibold text-red-700">
          Closed before completion — the client is not proceeding.
        </p>
      ) : null}
    </div>
  );
}

export function RecommendedLeadsPage() {
  const client = useQueryClient();
  const [closingId, setClosingId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["admin", "recommend-leads"],
    queryFn: fetchRecommendLeads,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecommendLeadStatus }) =>
      updateRecommendLead(id, status),
    onSuccess: () => {
      setClosingId(null);
      client.invalidateQueries({ queryKey: ["admin", "recommend-leads"] });
    },
  });
  if (query.isPending) return <AdminLoadingState label="Loading recommended leads" />;
  if (query.isError) {
    return <AdminQueryError error={query.error} onRetry={() => void query.refetch()} />;
  }
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Recommended leads"
        description="Every referral is a request for the Kattegat team to contact the client, understand what they need, and handle the opportunity."
        count={query.data?.length}
      />
      {mutation.isError ? (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <X />
          <AlertTitle>The lead was not updated</AlertTitle>
          <AlertDescription>
            {formatAdminAccessError(mutation.error, "Please try again.")}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {query.data?.map((lead) => {
          const next =
            lead.status === "submitted"
              ? {
                  status: "in_progress" as const,
                  title: "Start handling this lead",
                  help: "This referral needs action. Select this when a team member starts contacting the client.",
                }
              : lead.status === "in_progress"
                ? {
                    status: "confirmed" as const,
                    title: "Client wants to proceed",
                    help: "Use this after the client confirms they want Kattegat's help.",
                  }
                : lead.status === "confirmed"
                  ? {
                      status: "completed" as const,
                      title: "Mark this referral completed",
                      help: "Use this when the referred work has been successfully completed.",
                    }
                  : null;
          const closed =
            lead.status === "completed" || lead.status === "not_proceeding";
          return (
            <Card
              key={lead.id}
              className="border-border/70 bg-white shadow-[0_10px_35px_rgb(0_57_18/0.05)]"
            >
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Referred client
                    </p>
                    <CardTitle className="text-lg font-bold text-brand-forest">
                      {lead.clientName}
                    </CardTitle>
                    <CardDescription>
                      Submitted {date(lead.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn("w-fit shrink-0", badgeTone(lead.status))}
                  >
                    {lead.status === "submitted"
                      ? "New — ready to contact"
                      : lead.status === "in_progress"
                        ? "Contact in progress"
                        : lead.status === "confirmed"
                          ? "Client confirmed"
                          : lead.status === "completed"
                            ? "Completed"
                            : "Closed — not proceeding"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-1">
                <LeadProgress status={lead.status} />
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <a
                    href={`mailto:${lead.clientEmail}`}
                    className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border/70 p-3 hover:bg-muted/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-forest/5 text-brand-forest">
                      <Mail className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Client email
                      </span>
                      <span className="block break-all text-sm font-semibold leading-5 text-brand-forest">
                        {lead.clientEmail}
                      </span>
                    </span>
                  </a>
                  <a
                    href={`tel:${lead.clientPhone}`}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-3 hover:bg-muted/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-forest/5 text-brand-forest">
                      <Phone className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Client phone
                      </span>
                      <span className="block break-words text-sm font-semibold text-brand-forest">
                        {lead.clientPhone}
                      </span>
                    </span>
                  </a>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-bold text-brand-forest">
                    What the client needs
                  </p>
                  <p className="rounded-xl bg-muted/50 p-3 text-sm leading-6 text-foreground">
                    {lead.inquiry}
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-brand-mantis/25 bg-brand-mantis/7 p-3">
                  <UserRound className="mt-0.5 size-4 text-brand-forest" />
                  <div>
                    <p className="text-xs font-bold text-brand-forest">
                      Referred by {lead.recommenderName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Their contact: {lead.recommenderContact}
                    </p>
                  </div>
                </div>
                {closed ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-4 text-sm font-semibold",
                      lead.status === "completed"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CircleCheck className="size-5" />
                    {lead.status === "completed"
                      ? "This referral has been completed. No further action is required."
                      : "This lead was closed because the client is not proceeding."}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-brand-forest/10 bg-brand-forest/[0.025] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">
                      Next step
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {next?.help}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="h-11 flex-1 text-sm font-bold"
                        disabled={mutation.isPending}
                        onClick={() =>
                          next &&
                          mutation.mutate({ id: lead.id, status: next.status })
                        }
                      >
                        {mutation.isPending &&
                        mutation.variables?.id === lead.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ArrowRight />
                        )}
                        {next?.title}
                      </Button>
                      <Button
                        className="h-11"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => setClosingId(lead.id)}
                      >
                        Close lead
                      </Button>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Choose “Close lead” only when the client does not want to
                      continue.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {!query.data?.length ? (
        <AdminEmptyState
          title="No recommended leads yet"
          description="When a member recommends someone for Kattegat to handle, the referral and contact details will appear here."
        />
      ) : null}
      <Dialog
        open={Boolean(closingId)}
        onOpenChange={(open) => !open && setClosingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close this lead?</DialogTitle>
            <DialogDescription>
              Only close the lead if the client has declined or the referral
              cannot proceed. This will mark it as “Not proceeding.”
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() =>
                closingId &&
                mutation.mutate({ id: closingId, status: "not_proceeding" })
              }
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <X />
              )}
              Yes, close this lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function FoundingMembersPage() {
  const client = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [removingApplication, setRemovingApplication] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const query = useQuery({
    queryKey: ["admin", "founding-members"],
    queryFn: fetchFoundingApplications,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string;
      decision: "under_review" | "accepted" | "rejected" | "waitlisted";
    }) => reviewFoundingApplication(id, decision),
    onSuccess: () => {
      setRemovingApplication(null);
      client.invalidateQueries({ queryKey: ["admin", "founding-members"] });
    },
  });
  if (query.isPending) return <AdminLoadingState label="Loading founding members" />;
  if (query.isError) {
    return <AdminQueryError error={query.error} onRetry={() => void query.refetch()} />;
  }
  const applications = query.data ?? [];
  const visibleApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((item) => item.status === statusFilter);
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Founding members"
        description="Move each application through the required process: submitted, waitlisted, under review, then accepted or rejected."
        count={applications.length}
      />
      {mutation.isError ? (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <X />
          <AlertTitle>The founding member was not updated</AlertTitle>
          <AlertDescription>
            {formatAdminAccessError(mutation.error, "Please try again.")}
          </AlertDescription>
        </Alert>
      ) : null}
      {applications.length ? (
        <Card className="border-border/70 bg-white">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-forest">
                Application status
              </p>
              <p className="text-xs text-muted-foreground">
                Filter applications by their current step in the review process.
              </p>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full bg-white sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applications</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : null}
      {!applications.length ? (
        <AdminEmptyState
          title="No founding member applications yet"
          description="New founding member applications will appear here when they are submitted."
        />
      ) : !visibleApplications.length ? (
        <AdminEmptyState
          title={`No ${label(statusFilter).toLowerCase()} applications`}
          description="Choose another status to view matching applications."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleApplications.map((item) => {
            const isUpdating =
              mutation.isPending && mutation.variables?.id === item.id;
            const isActionPending = (
              decision: "under_review" | "accepted" | "rejected" | "waitlisted",
            ) => isUpdating && mutation.variables?.decision === decision;
            const completed =
              item.status === "accepted" || item.status === "rejected";
            return (
              <Card key={item.id} className="border-border/70 bg-white">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <CardTitle>
                        <Link
                          href={adminPath(
                            `/users/${encodeURIComponent(item.applicantId)}`,
                          )}
                          className="inline-flex items-center gap-1 font-bold text-brand-forest underline-offset-4 hover:underline"
                        >
                          {item.applicantName || "Unnamed applicant"}
                          <ArrowRight className="size-4" />
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {item.categoryName || "Uncategorized"} ·{" "}
                        {date(item.createdAt)}
                      </CardDescription>
                      <Link
                        href={adminPath(
                          `/users/${encodeURIComponent(item.applicantId)}`,
                        )}
                        className="mt-1 inline-block text-xs font-semibold text-brand-blue hover:underline"
                      >
                        View full user account
                      </Link>
                    </div>
                    <Badge
                      className={cn("w-fit shrink-0", badgeTone(item.status))}
                    >
                      {label(item.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Why this applicant
                    </p>
                    <p className="mt-1 text-sm leading-6">{item.whyYou}</p>
                  </div>
                  {item.audienceReach ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Audience reach
                      </p>
                      <p className="mt-1 text-sm">{item.audienceReach}</p>
                    </div>
                  ) : null}
                  {item.status === "submitted" ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        New application submitted
                      </p>
                      <p className="mt-1 text-xs text-amber-800/80">
                        Add this application to the waitlist so it can enter the
                        review queue.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 bg-white font-bold"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            decision: "waitlisted",
                          })
                        }
                      >
                        {isActionPending("waitlisted") ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Clock3 />
                        )}
                        Add to waitlist
                      </Button>
                    </div>
                  ) : null}
                  {item.status === "waitlisted" ? (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                      <p className="text-sm font-semibold text-brand-forest">
                        Application is waiting for review
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Start reviewing this application before making the final
                        decision.
                      </p>
                      <Button
                        className="mt-3 font-bold"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            decision: "under_review",
                          })
                        }
                      >
                        {isActionPending("under_review") ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Clock3 />
                        )}
                        Start review
                      </Button>
                    </div>
                  ) : null}
                  {item.status === "under_review" ? (
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-sm font-semibold text-brand-forest">
                        Make the final decision
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The application has been reviewed. Accept or reject it
                        to complete the process.
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Button
                          className="font-bold"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: item.id,
                              decision: "accepted",
                            })
                          }
                        >
                          {isActionPending("accepted") ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Check />
                          )}
                          Accept application
                        </Button>
                        <Button
                          variant="destructive"
                          className="font-bold"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              id: item.id,
                              decision: "rejected",
                            })
                          }
                        >
                          {isActionPending("rejected") ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <X />
                          )}
                          Reject application
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {completed ? (
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl p-4 text-sm font-semibold",
                          item.status === "accepted"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <CircleCheck className="size-5 shrink-0" />
                        {item.status === "accepted"
                          ? "This user is an approved founding member."
                          : "This application was rejected."}
                      </div>
                      {item.status === "accepted" ? (
                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                          <p className="text-sm font-bold text-red-900">
                            Remove founding-member access
                          </p>
                          <p className="mt-1 text-xs leading-5 text-red-800/80">
                            Use this only when membership must be withdrawn. The
                            user account will remain available, but the founding
                            badge and public founding-member placement will be
                            removed.
                          </p>
                          <Button
                            variant="destructive"
                            className="mt-3 font-bold"
                            disabled={mutation.isPending}
                            onClick={() =>
                              setRemovingApplication({
                                id: item.id,
                                name: item.applicantName || "this user",
                              })
                            }
                          >
                            <UserRoundX />
                            Remove from founding members
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(removingApplication)}
        onOpenChange={(open) => !open && setRemovingApplication(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removingApplication?.name}?</DialogTitle>
            <DialogDescription>
              This withdraws their founding-member status, removes their
              founding badge, and hides them from the public founding-member
              list. Their main user account will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() =>
                removingApplication &&
                mutation.mutate({
                  id: removingApplication.id,
                  decision: "rejected",
                })
              }
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserRoundX />
              )}
              Yes, remove founding status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
