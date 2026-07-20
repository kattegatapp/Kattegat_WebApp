"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileWarning,
  Loader2,
  MessageSquare,
  Monitor,
  Settings2,
  Shield,
  Tags,
  Tablet,
  Users,
  UserRound,
  Smartphone,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminPath } from "@/lib/admin/paths";
import { formatFilsAsAed } from "@/lib/admin/money";
import { goToAdminLogin } from "@/lib/admin/session-client";
import { ADMIN_ME_QUERY_OPTIONS } from "@/lib/admin/query";
import {
  fetchAdminOverview,
  type AdminOverviewAttentionItem,
  type AdminOverviewGates,
  type AdminOverviewKpis,
  type DeviceAnalyticsSummary,
} from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type KpiCard = {
  key: keyof AdminOverviewKpis;
  label: string;
  hint: string;
  icon: LucideIcon;
  href?: string;
};

const PRIMARY_KPIS: KpiCard[] = [
  { key: "waitlistTotal", label: "Waitlist", hint: "People awaiting access", icon: Sparkles, href: adminPath("/waitlist") },
  { key: "usersTotal", label: "Member community", hint: "Buyer and seller profiles", icon: Users },
  { key: "listingsLive", label: "Live portfolio", hint: "Experiences ready to discover", icon: Building2 },
  { key: "requirementsOpen", label: "Active enquiries", hint: "Open buyer requirements", icon: BriefcaseBusiness },
];

const ATTENTION_HREFS: Record<string, string> = {
  listings: `${adminPath("/listings")}?view=pending`,
  requirements: `${adminPath("/requirements")}?view=pending`,
  recommended: adminPath("/recommended-leads"),
  founding: adminPath("/founding-members"),
  vetted: adminPath("/white-glove-applications"),
  vetted_chats: adminPath("/agent-requests"),
  identity: adminPath("/identity-verifications"),
  moderation: adminPath("/moderation"),
};

const GATE_ROWS: Array<{
  key: keyof AdminOverviewGates;
  label: string;
  onLabel: string;
  offLabel: string;
  warnWhen?: boolean;
}> = [
  {
    key: "maintenanceMode",
    label: "Maintenance",
    onLabel: "On",
    offLabel: "Off",
    warnWhen: true,
  },
  { key: "waitlistEnabled", label: "Waitlist", onLabel: "Open", offLabel: "Closed" },
  { key: "freeAccessMode", label: "Free access", onLabel: "On", offLabel: "Off" },
  { key: "paymentsEnabled", label: "Payments", onLabel: "On", offLabel: "Off" },
  { key: "reviewsEnabled", label: "Reviews", onLabel: "On", offLabel: "Off" },
  { key: "referralsEnabled", label: "Referrals", onLabel: "On", offLabel: "Off" },
  {
    key: "listingModerationEnabled",
    label: "Listing moderation",
    onLabel: "On",
    offLabel: "Off",
  },
  {
    key: "identityVerificationRequired",
    label: "ID verification",
    onLabel: "Required",
    offLabel: "Optional",
  },
];

function formatCount(value: number | null | undefined) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-AE").format(n);
}

function kpiValue(kpis: AdminOverviewKpis, key: keyof AdminOverviewKpis) {
  const value = kpis[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function severityClass(severity: AdminOverviewAttentionItem["severity"]) {
  if (severity === "high") return "border-red-200/70 bg-red-50/75 text-red-900 backdrop-blur-md";
  if (severity === "medium") return "border-amber-200/70 bg-amber-50/75 text-amber-950 backdrop-blur-md";
  return "border-white/70 bg-white/45 text-zinc-800 backdrop-blur-md";
}

const GLASS_CARD =
  "ios-glass-pane overflow-hidden rounded-[1.35rem] border-white/80 bg-transparent py-0 shadow-none ring-0 sm:rounded-[1.5rem]";

const GLASS_PILL =
  "ios-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-zinc-700";

export function AdminOverview() {
  const router = useRouter();
  const meQuery = useQuery({
    ...ADMIN_ME_QUERY_OPTIONS,
  });
  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (overviewQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    const unauthorized =
      overviewQuery.error instanceof ApiRequestError && overviewQuery.error.status === 401;
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <Shield />
          <AlertTitle>
            {unauthorized ? "Please sign in again" : "Could not load operations data"}
          </AlertTitle>
          <AlertDescription>
            {overviewQuery.error instanceof Error
              ? overviewQuery.error.message
              : "Sign in again to continue."}
          </AlertDescription>
        </Alert>
        {unauthorized ? (
          <Button onClick={() => void goToAdminLogin((path) => router.replace(path))}>Back to login</Button>
        ) : (
          <Button variant="outline" onClick={() => void overviewQuery.refetch()}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  const { kpis, gates, attention, devices, generatedAt } = overviewQuery.data;
  const needsAttention = attention.length > 0;
  const queueTotal =
    kpiValue(kpis, "pendingListings") +
    kpiValue(kpis, "pendingRequirements") +
    kpiValue(kpis, "pendingIdentityVerifications") +
    kpiValue(kpis, "pendingModerationReports") +
    kpiValue(kpis, "foundingQueue") +
    kpiValue(kpis, "vettedQueue") +
    kpiValue(kpis, "recommendedLeadsQueue");
  const dubaiDate = new Intl.DateTimeFormat("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Dubai",
  }).format(new Date(generatedAt));
  const updatedAt = new Date(generatedAt).toLocaleTimeString("en-AE", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
  });
  const operatorName =
    meQuery.data?.businessName?.trim() ||
    meQuery.data?.username?.trim() ||
    meQuery.data?.email?.split("@")[0] ||
    "Operator";

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 pb-2 sm:gap-6">
          <section className="ios-glass-pane relative rounded-[1.5rem] px-4 py-5 sm:rounded-[1.75rem] sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className={GLASS_PILL}>
                    <Sparkles className="size-3.5 text-zinc-500" />
                    Kattegat Hospitality
                  </span>
                  <span className={GLASS_PILL}>
                    <CalendarDays className="size-3.5 text-zinc-500" />
                    {dubaiDate} · Dubai
                  </span>
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
                  Operations overview
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                  Welcome back, {operatorName}.
                </h1>
                <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-600">
                  Monitor marketplace performance, partner supply, buyer demand, and operational
                  priorities from one place.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <span
                  className={cn(
                    GLASS_PILL,
                    "px-4 py-2 text-xs font-extrabold uppercase tracking-wide",
                    queueTotal > 0 ? "text-amber-950" : "text-zinc-900",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      queueTotal > 0 ? "bg-amber-500" : "animate-pulse bg-emerald-500",
                    )}
                  />
                  {queueTotal > 0
                    ? `${formatCount(queueTotal)} need attention`
                    : "Queues clear"}
                </span>
                <span className="text-[11px] font-medium text-zinc-500">Updated {updatedAt} GST</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full border-white/80 bg-white/45 px-4 text-zinc-900 shadow-sm backdrop-blur-xl hover:bg-white/70"
                    onClick={() => void overviewQuery.refetch()}
                    disabled={overviewQuery.isFetching}
                  >
                    {overviewQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : null}
                    Refresh
                  </Button>
                  <QuickLinksDialog />
                </div>
              </div>
            </div>
          </section>

          {gates.maintenanceMode ? (
            <Alert className="ios-glass-pane border-red-200/70 bg-red-50/70 text-red-900 backdrop-blur-xl">
              <AlertTriangle />
              <AlertTitle>Maintenance mode is on</AlertTitle>
              <AlertDescription>
                Product traffic is blocked. Turn it off in{" "}
                <Link href={adminPath("/settings/features")} className="font-semibold underline underline-offset-2">
                  Feature gates
                </Link>
                .
              </AlertDescription>
            </Alert>
          ) : null}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PRIMARY_KPIS.map((item, index) => (
              <KpiTile
                key={item.key}
                label={item.label}
                hint={item.hint}
                value={formatCount(kpiValue(kpis, item.key))}
                icon={item.icon}
                href={item.href}
                index={index}
              />
            ))}
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              label="Payments today"
              hint="Stripe receipts logged today"
              value={formatCount(kpiValue(kpis, "paymentsToday"))}
              icon={CreditCard}
              href={adminPath("/payments")}
              index={0}
            />
            <KpiTile
              label="Active subscriptions"
              hint="Pro sellers with active billing"
              value={formatCount(kpiValue(kpis, "activeSubscriptionsTotal"))}
              icon={BadgeCheck}
              href={adminPath("/payments")}
              index={1}
            />
            <KpiTile
              label="Lifetime revenue"
              hint="Succeeded payments total"
              value={formatFilsAsAed(kpiValue(kpis, "revenueTotalFils"))}
              icon={CreditCard}
              href={adminPath("/payments")}
              index={2}
            />
            <KpiTile
              label="Pro sellers"
              hint="Premium tier profiles"
              value={formatCount(kpiValue(kpis, "premiumSellersTotal"))}
              icon={Sparkles}
              index={3}
            />
          </section>

          <MarketplaceCharts kpis={kpis} />

          <DeviceAnalytics devices={devices} />

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card className={cn(GLASS_CARD, "text-zinc-900")}>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-zinc-900">Operations queue</CardTitle>
                <CardDescription className="text-zinc-600">
                  Service moments requiring an operational decision.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-5">
                {!needsAttention ? (
                  <div className="ios-glass-chip rounded-2xl px-4 py-6 text-sm font-medium text-zinc-700">
                    Everything is in order. There are no outstanding service items.
                  </div>
                ) : (
                  attention.map((item) => {
                    const href = ATTENTION_HREFS[item.key];
                    const rowClass = cn(
                      "flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3",
                      severityClass(item.severity),
                      href && "transition-colors hover:border-white",
                    );
                    const body = (
                      <>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <AttentionIcon name={item.key} />
                          {item.label}
                        </div>
                        <Badge
                          variant="outline"
                          className="ios-glass-chip rounded-full border-0 font-extrabold tabular-nums text-zinc-900"
                        >
                          {formatCount(item.count)}
                        </Badge>
                      </>
                    );
                    return href ? (
                      <Link key={item.key} href={href} className={rowClass}>
                        {body}
                      </Link>
                    ) : (
                      <div key={item.key} className={rowClass}>
                        {body}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className={cn(GLASS_CARD, "text-zinc-900")}>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-zinc-900">Service controls</CardTitle>
                <CardDescription className="text-zinc-600">
                  Live access and operating modes across the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-5">
                {GATE_ROWS.map((gate) => {
                  const enabled = gates[gate.key];
                  const warn = gate.warnWhen === true && enabled;
                  return (
                    <div
                      key={gate.key}
                      className="ios-glass-chip flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5"
                    >
                      <span className="text-sm font-semibold text-zinc-800">{gate.label}</span>
                      <Badge
                        className={cn(
                          "rounded-full border font-bold backdrop-blur-xl",
                          warn
                            ? "border-red-200/80 bg-red-50/80 text-red-800"
                            : enabled
                              ? "border-white/80 bg-white/70 text-zinc-900"
                              : "border-white/60 bg-white/35 text-zinc-500",
                        )}
                      >
                        {enabled ? gate.onLabel : gate.offLabel}
                      </Badge>
                    </div>
                  );
                })}
                <Link
                  href={adminPath("/settings/features")}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-2 h-10 w-full rounded-full border-white/80 bg-white/45 text-zinc-900 backdrop-blur-xl hover:bg-white/70",
                  )}
                >
                  Manage feature gates
                </Link>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}

const QUICK_LINKS = [
  {
    label: "Seller plans",
    description: "Pricing, quotas, and seller capabilities",
    href: adminPath("/pricing"),
    icon: Tags,
  },
  {
    label: "Operations defaults",
    description: "Limits, commercial values, and platform rules",
    href: adminPath("/settings/operations"),
    icon: Settings2,
  },
  {
    label: "Brand settings",
    description: "Names, contact details, and public identity",
    href: adminPath("/settings/brand"),
    icon: Building2,
  },
] as const;

function QuickLinksDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="h-9 rounded-full border border-white/80 bg-white/45 px-4 text-zinc-900 shadow-sm backdrop-blur-xl hover:bg-white/70 hover:text-zinc-900"
          />
        }
      >
        <Zap className="size-4" />
        Quick links
      </DialogTrigger>
      <DialogContent className="ios-glass-pane gap-0 overflow-hidden rounded-[1.5rem] border-white/80 bg-transparent p-0 shadow-2xl ring-0 sm:max-w-md">
        <DialogHeader className="border-b border-white/55 bg-white/30 px-5 py-5 pr-12 backdrop-blur-xl">
          <DialogTitle className="text-lg font-bold text-zinc-900">Quick links</DialogTitle>
          <DialogDescription className="text-zinc-600">
            Jump straight to frequently used configuration areas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 p-3">
          {QUICK_LINKS.map((item) => (
            <DialogClose
              key={item.href}
              render={
                <Link
                  href={item.href}
                  className="ios-glass-chip group flex items-center gap-3 rounded-2xl border-transparent p-3 text-left transition-all hover:border-white/80 hover:bg-white/55"
                />
              }
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/80 bg-white/60 text-zinc-900 shadow-sm backdrop-blur-xl">
                <item.icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-zinc-900">{item.label}</span>
                <span className="block truncate text-xs text-zinc-600">{item.description}</span>
              </span>
              <ArrowUpRight className="size-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-800" />
            </DialogClose>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CHART_COLORS = [
  "#6FDB42",
  "#1C4759",
  "#48DC81",
  "#5B9FD4",
  "#F0B429",
  "#E86A6A",
  "#2DD4BF",
];

const chartTooltipStyle = {
  borderRadius: 16,
  border: "1px solid rgb(255 255 255 / 0.8)",
  background: "rgb(255 255 255 / 0.9)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 16px 40px rgb(0 57 18 / 0.12)",
  fontSize: 12,
  fontWeight: 600,
  color: "#18181b",
  padding: "10px 12px",
};

function MarketplaceCharts({ kpis }: { kpis: AdminOverviewKpis }) {
  const audience = [
    { name: "Buyers", value: kpiValue(kpis, "buyersTotal") },
    { name: "Partners", value: kpiValue(kpis, "sellersTotal") },
  ];
  const listings = [
    { name: "Live", value: kpiValue(kpis, "listingsLive") },
    { name: "Draft", value: kpiValue(kpis, "listingsDraft") },
    { name: "Review", value: kpiValue(kpis, "pendingListings") },
    { name: "Rejected", value: kpiValue(kpis, "listingsRejected") },
  ];
  const requirements = [
    { name: "Open", value: kpiValue(kpis, "requirementsOpen") },
    { name: "Review", value: kpiValue(kpis, "pendingRequirements") },
    { name: "Shortlist", value: kpiValue(kpis, "requirementsShortlisting") },
    { name: "Awarded", value: kpiValue(kpis, "requirementsAwarded") },
    { name: "Closed", value: kpiValue(kpis, "requirementsClosed") },
  ];
  const memberships = [
    { name: "Founding", value: kpiValue(kpis, "foundingMembersTotal") },
    { name: "Vetted", value: kpiValue(kpis, "vettedMembersTotal") },
    { name: "Premium", value: kpiValue(kpis, "premiumSellersTotal") },
  ];
  const audienceTotal = audience.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="space-y-3">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">
          Marketplace performance
        </h2>
        <p className="mt-1 text-xs font-medium text-zinc-600">
          Community composition, portfolio readiness, and buyer demand.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Community composition"
          description="Registered buyers and hospitality partners"
          delayMs={40}
        >
          <AudienceDonut data={audience} total={audienceTotal} />
        </ChartCard>

        <ChartCard
          title="Portfolio readiness"
          description="Hospitality supply by publishing stage"
          delayMs={100}
        >
          <ModernMeterRows data={listings} colorOffset={0} />
        </ChartCard>

        <ChartCard
          title="Buyer requirements"
          description="Requests through each service stage"
          delayMs={160}
        >
          <ModernMeterRows data={requirements} colorOffset={1} />
        </ChartCard>

        <ChartCard
          title="Member programmes"
          description="Approved founding, vetted, and premium partners"
          delayMs={220}
        >
          <ModernMeterRows data={memberships} colorOffset={2} />
        </ChartCard>
      </div>
    </section>
  );
}

function AudienceDonut({
  data,
  total,
}: {
  data: Array<{ name: string; value: number }>;
  total: number;
}) {
  return (
    <div>
      <div className="overview-donut relative mx-auto h-60 w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((item, index) => (
                <linearGradient
                  key={item.name}
                  id={`audience-grad-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={CHART_COLORS[index]} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHART_COLORS[index]} stopOpacity={0.65} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={96}
              paddingAngle={5}
              cornerRadius={10}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={2}
              animationBegin={80}
              animationDuration={1100}
              animationEasing="ease-out"
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={`url(#audience-grad-${index})`} />
              ))}
            </Pie>
            <ChartTooltip
              contentStyle={chartTooltipStyle}
              formatter={(value) => formatCount(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="animate-in fade-in zoom-in-95 text-3xl font-extrabold tracking-tight text-zinc-900 duration-700 fill-mode-both">
            {formatCount(total)}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Profiles
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {data.map((item, index) => {
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <span
              key={item.name}
              className="ios-glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-700"
            >
              <span
                className="size-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: CHART_COLORS[index] }}
              />
              {item.name}
              <span className="tabular-nums text-zinc-900">{share}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ModernMeterRows({
  data,
  colorOffset = 0,
}: {
  data: Array<{ name: string; value: number }>;
  colorOffset?: number;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3.5 pt-3">
      {data.map((item, index) => {
        const pct = Math.max((item.value / max) * 100, item.value > 0 ? 6 : 0);
        const color = CHART_COLORS[(index + colorOffset) % CHART_COLORS.length];
        return (
          <div
            key={item.name}
            className="animate-in fade-in slide-in-from-left-2 fill-mode-both"
            style={{
              animationDelay: `${90 + index * 75}ms`,
              animationDuration: "520ms",
            }}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-800">{item.name}</span>
              <span className="text-sm font-extrabold tabular-nums text-zinc-900">
                {formatCount(item.value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/40 ring-1 ring-white/50">
              <div
                className="overview-bar-fill h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}b3)`,
                  boxShadow: `0 0 16px ${color}55`,
                  animationDelay: `${140 + index * 90}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  delayMs = 0,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  delayMs?: number;
}) {
  return (
    <Card
      className={cn(
        GLASS_CARD,
        "group/chart relative text-zinc-900 transition-transform duration-300 hover:-translate-y-0.5",
        "animate-in fade-in slide-in-from-bottom-3 fill-mode-both",
      )}
      style={{ animationDelay: `${delayMs}ms`, animationDuration: "650ms" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
      />
      <CardHeader className="pb-0 pt-5">
        <CardTitle className="font-extrabold tracking-tight text-zinc-900">{title}</CardTitle>
        <CardDescription className="text-zinc-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-5">{children}</CardContent>
    </Card>
  );
}

function DeviceAnalytics({ devices }: { devices: DeviceAnalyticsSummary }) {
  const deviceIcons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">
            Platform usage
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-600">
            Recognized client profiles from successful web and app sign-ins.
          </p>
        </div>
        <Badge
          variant="outline"
          className="ios-glass-chip rounded-full border-0 px-3 py-1.5 text-zinc-800"
        >
          {formatCount(devices.totalDevices)} recognized profiles · {formatCount(devices.totalAccesses)}{" "}
          sign-ins
        </Badge>
      </div>

      {devices.totalDevices === 0 ? (
        <Card className={cn(GLASS_CARD, "border-dashed")}>
          <CardContent className="flex min-h-32 items-center gap-3 py-6 text-sm font-medium text-zinc-600">
            <Smartphone className="size-5 text-zinc-800" />
            No platform usage has been recorded yet. This section will populate after successful user
            sign-ins.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title="Device mix" description="Share of sign-ins by client form factor" delayMs={40}>
            <div className="grid gap-2.5 pt-4">
              {devices.byDeviceType.map((item, index) => {
                const Icon =
                  deviceIcons[item.name.toLowerCase() as keyof typeof deviceIcons] ?? Monitor;
                const share =
                  devices.totalAccesses > 0
                    ? Math.round((item.accesses / devices.totalAccesses) * 100)
                    : 0;
                const color = CHART_COLORS[index % CHART_COLORS.length];
                return (
                  <div
                    key={item.name}
                    className="ios-glass-chip group rounded-2xl p-3.5 transition-all hover:-translate-y-0.5 hover:bg-white/65"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <Icon className="size-4" />
                        {item.name}
                      </span>
                      <span className="text-xs font-extrabold tabular-nums text-zinc-700">{share}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/45 ring-1 ring-white/50">
                      <div
                        className="overview-bar-fill h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}b3)`,
                          boxShadow: `0 0 14px ${color}44`,
                          animationDelay: `${160 + index * 90}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
          <DeviceBarCard
            title="Operating systems"
            description="Sign-ins across Android, iOS, and desktop platforms"
            data={devices.byOperatingSystem}
            colorOffset={2}
            delayMs={100}
          />
          <DeviceBarCard
            title="Browsers & app"
            description="Sign-ins by browser or native application"
            data={devices.byBrowser}
            colorOffset={4}
            delayMs={160}
          />
        </div>
      )}
    </section>
  );
}

function DeviceBarCard({
  title,
  description,
  data,
  colorOffset = 0,
  delayMs = 0,
}: {
  title: string;
  description: string;
  data: DeviceAnalyticsSummary["byBrowser"];
  colorOffset?: number;
  delayMs?: number;
}) {
  const gradientId = `device-bar-${colorOffset}`;

  return (
    <ChartCard title={title} description={description} delayMs={delayMs}>
      <div className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 18, left: 0 }}>
            <defs>
              {data.map((item, index) => {
                const color = CHART_COLORS[(index + colorOffset) % CHART_COLORS.length];
                return (
                  <linearGradient
                    key={item.name}
                    id={`${gradientId}-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.55} />
                  </linearGradient>
                );
              })}
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-16}
              textAnchor="end"
              tick={{ fill: "#52525b", fontSize: 10, fontWeight: 600 }}
            />
            <YAxis hide />
            <ChartTooltip
              contentStyle={chartTooltipStyle}
              formatter={(value) => [formatCount(Number(value)), "Sign-ins"]}
              cursor={{ fill: "rgb(255 255 255 / 0.28)", radius: 12 }}
            />
            <Bar
              dataKey="accesses"
              radius={[12, 12, 6, 6]}
              animationBegin={120}
              animationDuration={1100}
              animationEasing="ease-out"
              activeBar={{ stroke: "#ffffff", strokeWidth: 2, opacity: 0.92 }}
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={`url(#${gradientId}-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function KpiTile({
  label,
  hint,
  value,
  emphasize = false,
  href,
  icon: Icon,
  index = 0,
}: {
  label: string;
  hint: string;
  value: string;
  emphasize?: boolean;
  href?: string;
  icon: LucideIcon;
  index?: number;
}) {
  const content = (
    <CardContent className="relative p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
      />
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-[1.1rem] border border-white/80 bg-white/55 text-zinc-800 shadow-sm backdrop-blur-xl transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-4.5" />
        </span>
        <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129/0.18)]" />
      </div>
      <p className="text-3xl font-extrabold tabular-nums tracking-tight text-zinc-900">{value}</p>
      <p className="mt-2 text-sm font-extrabold text-zinc-900">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-600">{hint}</p>
    </CardContent>
  );

  const className = cn(
    GLASS_CARD,
    "group text-zinc-900 transition-all duration-300",
    "animate-in fade-in slide-in-from-bottom-3 fill-mode-both",
    emphasize && "border-amber-200/80 ring-1 ring-amber-100/80",
    href && "hover:-translate-y-1 hover:bg-white/35 hover:shadow-[0_20px_50px_rgb(0_57_18/0.12)]",
  );

  const style = { animationDelay: `${60 + index * 70}ms`, animationDuration: "600ms" };

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={className} style={style}>
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={className} style={style}>
      {content}
    </Card>
  );
}

function AttentionIcon({ name }: { name: string }) {
  const className = "size-4 shrink-0 opacity-80";
  if (name === "listings") return <ClipboardList className={className} />;
  if (name === "requirements") return <FileWarning className={className} />;
  if (name === "identity") return <BadgeCheck className={className} />;
  if (name === "moderation") return <Shield className={className} />;
  if (name === "founding") return <Users className={className} />;
  if (name === "vetted") return <UserRound className={className} />;
  if (name === "vetted_chats") return <MessageSquare className={className} />;
  if (name === "recommended") return <Users className={className} />;
  return <AlertTriangle className={className} />;
}
