"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Megaphone,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/api/account-home";
import {
  fetchRecommendLeads,
  submitRecommendLead,
  type RecommendLead,
  type RecommendLeadStatus,
} from "@/lib/api/account-recommend";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: Array<{ value: RecommendLeadStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "in_progress", label: "In progress" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "not_proceeding", label: "Not proceeding" },
];

const STATUS_META: Record<
  RecommendLeadStatus,
  {
    label: string;
    description: string;
    tone: string;
    icon: typeof Send;
  }
> = {
  submitted: {
    label: "Submitted",
    description: "Our team has the lead and will review it.",
    tone: "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/70",
    icon: Send,
  },
  in_progress: {
    label: "In progress",
    description: "We are following up with the client.",
    tone: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue",
    icon: Clock3,
  },
  confirmed: {
    label: "Confirmed",
    description: "The opportunity is confirmed. Earning is not final yet.",
    tone: "border-brand-mantis/40 bg-brand-mantis/12 text-brand-forest",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    description: "This lead completed and your earning was credited to your wallet.",
    tone: "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald",
    icon: CircleDollarSign,
  },
  not_proceeding: {
    label: "Not proceeding",
    description: "This lead did not move forward.",
    tone: "border-red-300/50 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pass a lead",
    body: "Tell us who needs talent and what they’re looking for.",
  },
  {
    step: "2",
    title: "We handle it",
    body: "Kattegat follows up end to end — you don’t manage the job.",
  },
  {
    step: "3",
    title: "You earn",
    body: "When it completes, a share of the management fee hits your wallet.",
  },
] as const;

function formatReward(fils: number | null) {
  if (fils == null) return null;
  return `AED ${(fils / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function earningLabel(lead: RecommendLead) {
  if (lead.status === "completed" && lead.rewardAmountFils != null) {
    return formatReward(lead.rewardAmountFils);
  }
  if (lead.status === "not_proceeding") return "No earning";
  return "Not earned yet";
}

function EmptyBlock({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <AccountGlass className="rounded-[18px] p-10 text-center">
      <Megaphone className="mx-auto size-7 text-brand-mantis" />
      <p className="mt-4 font-bold text-brand-forest">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-brand-forest/65">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </AccountGlass>
  );
}

function RecommendLeadCard({ lead }: { lead: RecommendLead }) {
  const meta = STATUS_META[lead.status];
  const Icon = meta.icon;
  const earning = earningLabel(lead);
  const earnedAmount = lead.status === "completed" && lead.rewardAmountFils != null;

  return (
    <AccountListCard className="flex h-full flex-col p-4">
      <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl border",
                meta.tone,
              )}
            >
              <Icon className="size-5" />
            </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[14px] font-extrabold text-brand-forest">
              {lead.clientName}
            </h3>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", meta.tone)}>
              {meta.label}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-brand-forest/65">
            {lead.inquiry}
          </p>
        </div>
      </div>

      <div className="mt-auto rounded-[12px] border border-brand-forest/8 bg-[#F7F9F8] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
          <span
            className={cn(
              "font-extrabold",
              earnedAmount ? "text-brand-mantis" : "text-brand-forest/55",
            )}
          >
            {earning}
          </span>
          <span className="text-brand-forest/35">·</span>
          <span className="text-muted-foreground">{formatRelativeTime(lead.updatedAt)}</span>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-brand-forest/55">{meta.description}</p>
      </div>
    </AccountListCard>
  );
}

export function AccountRecommendView() {
  const queryClient = useQueryClient();
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [leadStatus, setLeadStatus] = useState<RecommendLeadStatus | "all">("all");
  const [leadSearch, setLeadSearch] = useState("");
  const deferredLeadSearch = useDeferredValue(leadSearch.trim());
  const [form, setForm] = useState({
    clientName: "",
    inquiry: "",
    clientPhone: "",
    clientEmail: "",
  });

  const summaryLeadsQuery = useQuery({
    queryKey: ["account", "recommend", "leads", "summary"],
    queryFn: () => fetchRecommendLeads(),
    enabled: !trackerOpen,
  });

  const leadsQuery = useQuery({
    queryKey: ["account", "recommend", "leads", leadStatus, deferredLeadSearch],
    queryFn: () =>
      fetchRecommendLeads({
        status: leadStatus === "all" ? undefined : leadStatus,
        q: deferredLeadSearch || undefined,
      }),
    enabled: trackerOpen,
  });

  useEffect(() => {
    if (!trackerOpen) return;
    document.querySelector(".account-main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [trackerOpen]);

  const submit = useMutation({
    mutationFn: () =>
      submitRecommendLead({
        clientName: form.clientName.trim(),
        inquiry: form.inquiry.trim(),
        clientPhone: form.clientPhone.trim(),
        clientEmail: form.clientEmail.trim(),
      }),
    onSuccess: async () => {
      setForm({ clientName: "", inquiry: "", clientPhone: "", clientEmail: "" });
      await queryClient.invalidateQueries({ queryKey: ["account", "recommend", "leads"] });
      setTrackerOpen(true);
    },
  });

  const canSubmit =
    form.clientName.trim().length > 0 &&
    form.inquiry.trim().length > 0 &&
    (form.clientPhone.trim().length > 0 || form.clientEmail.trim().length > 0) &&
    !submit.isPending;

  const summaryStats = useMemo(() => {
    const leads = summaryLeadsQuery.data ?? [];
    const completed = leads.filter((lead) => lead.status === "completed");
    const earned = completed.reduce((sum, lead) => sum + (lead.rewardAmountFils ?? 0), 0);
    const active = leads.filter(
      (lead) =>
        lead.status === "submitted" ||
        lead.status === "in_progress" ||
        lead.status === "confirmed",
    ).length;
    return { total: leads.length, active, earned };
  }, [summaryLeadsQuery.data]);

  const hasTrackerFilters = leadStatus !== "all" || Boolean(deferredLeadSearch);
  const trackerLeads = leadsQuery.data ?? [];

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

        <AccountViewIntro
          className="mb-5"
          title="Recommended leads"
          description="Follow each recommendation from review to completion. Earnings hit your wallet once our team confirms the amount."
        />

        <AccountGlass className="mb-5 rounded-[18px] p-3 sm:p-4">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              value={leadSearch}
              onChange={(event) => setLeadSearch(event.target.value)}
              placeholder="Search by client name"
              aria-label="Filter recommended leads by client name"
              className="h-10 rounded-xl border-brand-forest/10 bg-white pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_FILTERS.map((option) => {
              const selected = leadStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLeadStatus(option.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
                    selected
                      ? "border-brand-forest bg-brand-forest text-white"
                      : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
            {hasTrackerFilters ? (
              <button
                type="button"
                onClick={() => {
                  setLeadStatus("all");
                  setLeadSearch("");
                }}
                className="shrink-0 rounded-full border border-brand-forest/10 bg-white px-3.5 py-1.5 text-[12px] font-bold text-brand-forest/55 hover:bg-brand-forest/5"
              >
                Clear
              </button>
            ) : null}
          </div>
        </AccountGlass>

        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {leadsQuery.isPending
              ? "Loading…"
              : `${trackerLeads.length} lead${trackerLeads.length === 1 ? "" : "s"}`}
          </span>
          {leadsQuery.isFetching && !leadsQuery.isPending ? <span>Updating…</span> : null}
        </div>

        {leadsQuery.isPending ? (
          <AccountCardGridSkeleton count={6} columns={3} />
        ) : trackerLeads.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {trackerLeads.map((lead) => (
              <RecommendLeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <EmptyBlock
            title={hasTrackerFilters ? "No matching leads" : "No recommended leads yet"}
            body={
              hasTrackerFilters
                ? "Try another client name or status."
                : "Submit a lead from Recommend & earn and its status will appear here."
            }
            action={
              hasTrackerFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLeadStatus("all");
                    setLeadSearch("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={() => setTrackerOpen(false)}>
                  Submit a lead
                </Button>
              )
            }
          />
        )}
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Recommend & earn"
        description="Know someone who needs a service we offer? Pass it along — we handle it end to end and you earn a share of the management fee."
      />

      <AccountGlass className="mb-5 rounded-[20px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-forest text-white">
            <Megaphone className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-mantis">
              Managed introductions
            </p>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-brand-forest">
              Pass a lead, we do the rest
            </h3>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-brand-forest/65">
              No quotes, invoices, or client chasing on your side. Kattegat runs the opportunity and
              credits you when it completes.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-[16px] border border-brand-forest/8 bg-white/70 px-3.5 py-3.5"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-mantis/15 text-[12px] font-extrabold text-brand-forest">
                {item.step}
              </span>
              <p className="mt-2.5 text-[13px] font-extrabold text-brand-forest">{item.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-brand-forest/60">{item.body}</p>
            </div>
          ))}
        </div>
      </AccountGlass>

      <button
        type="button"
        onClick={() => setTrackerOpen(true)}
        className="mb-5 w-full rounded-[18px] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mantis/40"
      >
        <AccountListCard className="flex items-center gap-4 p-4 transition hover:border-brand-mantis/30 hover:shadow-md sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-mantis/15 text-brand-forest">
            <Clock3 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-brand-forest">Track recommended leads</h3>
              {!summaryLeadsQuery.isPending ? (
                <span className="rounded-full border border-brand-forest/10 bg-brand-forest/[0.03] px-2 py-0.5 text-[10px] font-bold text-brand-forest/65">
                  {summaryStats.total} total
                  {summaryStats.active > 0 ? ` · ${summaryStats.active} active` : ""}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] text-brand-forest/60">
              {summaryStats.earned > 0
                ? `${formatReward(summaryStats.earned)} earned so far · see status and payouts`
                : "See each lead’s status and whether it has earned yet."}
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </AccountListCard>
      </button>

      <AccountListCard className="p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-[15px] font-extrabold text-brand-forest">Submit a lead</h3>
          <p className="mt-1 text-[13px] text-brand-forest/60">
            Share who needs talent and what they’re looking for. Provide at least a phone or email.
          </p>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2"
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
              onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
              className="h-10 rounded-xl"
              placeholder="e.g. Amira Hassan"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="recommend-inquiry">What’s the job?</Label>
            <Textarea
              id="recommend-inquiry"
              value={form.inquiry}
              onChange={(event) => setForm((current) => ({ ...current, inquiry: event.target.value }))}
              rows={4}
              className="min-h-[96px] rounded-xl"
              placeholder="Event type, dates, location, and what talent they need"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommend-phone">Client phone</Label>
            <Input
              id="recommend-phone"
              type="tel"
              value={form.clientPhone}
              onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))}
              className="h-10 rounded-xl"
              placeholder="+971 …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommend-email">Client email</Label>
            <Input
              id="recommend-email"
              type="email"
              autoCapitalize="none"
              value={form.clientEmail}
              onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))}
              className="h-10 rounded-xl"
              placeholder="name@company.com"
            />
          </div>

          {submit.isError ? (
            <p className="text-sm text-red-600 sm:col-span-2">
              {submit.error instanceof Error ? submit.error.message : "Could not submit lead."}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-11 w-full rounded-xl font-extrabold sm:w-auto sm:min-w-[12rem]"
            >
              {submit.isPending ? <Spinner className="size-4" /> : <Send className="size-4" />}
              Submit lead
            </Button>
          </div>
        </form>
      </AccountListCard>
    </AccountViewWrap>
  );
}
