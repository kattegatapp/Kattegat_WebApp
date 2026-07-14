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
import { ADMIN_LOGIN_PATH, adminPath } from "@/lib/admin/paths";
import {
  fetchAdminOverview,
  fetchAdminMe,
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
  if (severity === "high") return "border-red-200 bg-red-50 text-red-800";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-brand-forest/15 bg-brand-forest/5 text-brand-forest";
}

export function AdminOverview() {
  const router = useRouter();
  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: fetchAdminMe,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
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
        <Loader2 className="h-6 w-6 animate-spin text-brand-forest" />
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    const unauthorized =
      overviewQuery.error instanceof ApiRequestError && overviewQuery.error.status === 401;
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="border-red-200 bg-red-50 text-red-800">
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
          <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
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
  const operatorName =
    meQuery.data?.businessName?.trim() ||
    meQuery.data?.username?.trim() ||
    meQuery.data?.email?.split("@")[0] ||
    "Operator";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#062418] text-white shadow-[0_28px_80px_rgb(0_57_18/0.22)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgb(111_219_66/0.2),transparent_28%),linear-gradient(115deg,transparent_50%,rgb(255_255_255/0.035))]" />
        <div aria-hidden className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-[#9b7cff]/10 blur-3xl" />
        <div className="relative grid gap-7 px-5 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="border-brand-mantis/25 bg-brand-mantis/10 text-brand-mantis">Kattegat Hospitality</Badge>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/45"><CalendarDays className="size-3.5" />{dubaiDate} · Dubai</span>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-mantis/75">Operations overview</p>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              Welcome back, {operatorName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Monitor marketplace performance, partner supply, buyer demand, and operational priorities from one place.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
          <Badge
            className={cn(
              "border",
              queueTotal > 0
                ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                : "border-brand-mantis/25 bg-brand-mantis/10 text-brand-mantis",
            )}
          >
            {queueTotal > 0 ? `${formatCount(queueTotal)} service items need attention` : "All service queues are clear"}
          </Badge>
            <span className="text-[11px] text-white/35">Updated {new Date(generatedAt).toLocaleTimeString("en-AE", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" })} GST</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => void overviewQuery.refetch()} disabled={overviewQuery.isFetching}>
                {overviewQuery.isFetching ? <Loader2 className="animate-spin" /> : null}
                Refresh view
              </Button>
              <QuickLinksDialog />
            </div>
          </div>
        </div>
      </div>

      {gates.maintenanceMode ? (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertTriangle />
          <AlertTitle>Maintenance mode is on</AlertTitle>
          <AlertDescription>
            Product traffic is blocked. Turn it off in{" "}
            <Link href={adminPath("/settings/features")} className="underline underline-offset-2">
              Feature gates
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PRIMARY_KPIS.map((item) => (
          <KpiTile
            key={item.key}
            label={item.label}
            hint={item.hint}
            value={formatCount(kpiValue(kpis, item.key))}
            icon={item.icon}
            href={item.href}
          />
        ))}
      </section>

      <MarketplaceCharts kpis={kpis} />

      <DeviceAnalytics devices={devices} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-brand-forest">Operations queue</CardTitle>
            <CardDescription>Service moments requiring an operational decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!needsAttention ? (
              <div className="rounded-lg border border-brand-forest/10 bg-brand-forest/5 px-4 py-6 text-sm text-brand-forest">
                Everything is in order. There are no outstanding service items.
              </div>
            ) : (
              attention.map((item) => {
                const href = ATTENTION_HREFS[item.key];
                const rowClass = cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                  severityClass(item.severity),
                  href && "transition-colors hover:border-brand-forest/30",
                );
                const body = (
                  <>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AttentionIcon name={item.key} />
                      {item.label}
                    </div>
                    <Badge variant="outline" className="bg-white/70 font-semibold tabular-nums">
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

        <Card className="border-border/80 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-brand-forest">Service controls</CardTitle>
            <CardDescription>Live access and operating modes across the marketplace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {GATE_ROWS.map((gate) => {
              const enabled = gates[gate.key];
              const warn = gate.warnWhen === true && enabled;
              return (
                <div
                  key={gate.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{gate.label}</span>
                  <Badge
                    className={cn(
                      "border",
                      warn
                        ? "border-red-200 bg-red-50 text-red-800"
                        : enabled
                          ? "border-brand-forest/15 bg-brand-forest/5 text-brand-forest"
                          : "border-border bg-white text-muted-foreground",
                    )}
                  >
                    {enabled ? gate.onLabel : gate.offLabel}
                  </Badge>
                </div>
              );
            })}
            <Link
              href={adminPath("/settings/features")}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 w-full")}
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
            className="border border-white/15 bg-white/10 text-white shadow-none hover:bg-white/20 hover:text-white"
          />
        }
      >
        <Zap />
        Quick links
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-border/70 bg-muted/30 px-5 py-5 pr-12">
          <DialogTitle className="text-lg font-bold text-brand-forest">Quick links</DialogTitle>
          <DialogDescription>Jump straight to frequently used configuration areas.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 p-3">
          {QUICK_LINKS.map((item) => (
            <DialogClose
              key={item.href}
              render={
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-brand-mantis/40 hover:bg-brand-mantis/8"
                />
              }
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-forest text-brand-mantis shadow-sm">
                <item.icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-brand-forest">{item.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-forest" />
            </DialogClose>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CHART_COLORS = [
  "#35a853", // green
  "#2878d0", // blue
  "#8b5cf6", // violet
  "#e59b28", // amber
  "#dc5a5a", // red
  "#0891b2", // cyan
  "#db4f9a", // pink
];

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
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue">Marketplace performance</h2>
        <p className="mt-1 text-xs text-muted-foreground">A current view of community composition, portfolio readiness, and buyer demand.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Community composition" description="Registered buyers and hospitality partners">
        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={audience}
                dataKey="value"
                nameKey="name"
                innerRadius={67}
                outerRadius={91}
                paddingAngle={4}
                strokeWidth={0}
                animationDuration={900}
                animationBegin={120}
              >
                {audience.map((item, index) => (
                  <Cell key={item.name} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <ChartTooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCount(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-brand-forest">{formatCount(audienceTotal)}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Profiles</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {audience.map((item, index) => (
            <span key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
              {item.name}
            </span>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Portfolio readiness" description="Hospitality supply by publishing stage">
        <StatusBarChart data={listings} colorOffset={0} />
      </ChartCard>

      <ChartCard title="Buyer requirements" description="Requests through each service stage">
        <StatusBarChart data={requirements} colorOffset={1} />
      </ChartCard>
      <ChartCard title="Member programmes" description="Approved founding, vetted, and premium partners">
        <StatusBarChart data={memberships} colorOffset={2} />
      </ChartCard>
      </div>
    </section>
  );
}

const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e1e7e3",
  boxShadow: "0 12px 30px rgb(0 57 18 / 0.12)",
  fontSize: 12,
};

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-white shadow-[0_10px_35px_rgb(0_57_18/0.05)]">
      <CardHeader className="pb-0">
        <CardTitle className="font-bold text-brand-forest">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatusBarChart({
  data,
  colorOffset = 0,
}: {
  data: Array<{ name: string; value: number }>;
  colorOffset?: number;
}) {
  return (
    <div className="h-[296px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 12, bottom: 2, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={62}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#4f6058", fontSize: 11 }}
          />
          <ChartTooltip
            cursor={{ fill: "rgb(0 57 18 / 0.035)" }}
            contentStyle={chartTooltipStyle}
            formatter={(value) => formatCount(Number(value))}
          />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            barSize={18}
            animationDuration={850}
            activeBar={{ stroke: "#ffffff", strokeWidth: 2, opacity: 0.82 }}
          >
            {data.map((item, index) => (
              <Cell key={item.name} fill={CHART_COLORS[(index + colorOffset) % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeviceAnalytics({ devices }: { devices: DeviceAnalyticsSummary }) {
  const deviceIcons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue">Platform usage</h2>
          <p className="mt-1 text-xs text-muted-foreground">Recognized client profiles from successful web and app sign-ins.</p>
        </div>
        <Badge variant="outline" className="bg-white">
          {formatCount(devices.totalDevices)} recognized profiles · {formatCount(devices.totalAccesses)} sign-ins
        </Badge>
      </div>

      {devices.totalDevices === 0 ? (
        <Card className="border-dashed border-border bg-white/60">
          <CardContent className="flex min-h-32 items-center gap-3 py-6 text-sm text-muted-foreground">
            <Smartphone className="size-5 text-brand-forest" />
            No platform usage has been recorded yet. This section will populate after successful user sign-ins.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title="Device mix" description="Share of sign-ins by client form factor">
            <div className="grid gap-2 pt-4">
              {devices.byDeviceType.map((item, index) => {
                const Icon = deviceIcons[item.name.toLowerCase() as keyof typeof deviceIcons] ?? Monitor;
                const share = devices.totalAccesses > 0 ? Math.round((item.accesses / devices.totalAccesses) * 100) : 0;
                return (
                  <div key={item.name} className="group rounded-xl border border-border/70 p-3 transition-colors hover:border-brand-mantis hover:bg-brand-mantis/5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-brand-forest"><Icon className="size-4" />{item.name}</span>
                      <span className="text-xs font-bold tabular-nums text-brand-blue">{share}%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full origin-left animate-in rounded-full duration-700 zoom-in-x-0" style={{ width: `${share}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
          <DeviceBarCard title="Operating systems" description="Sign-ins across Android, iOS, and desktop platforms" data={devices.byOperatingSystem} colorOffset={2} />
          <DeviceBarCard title="Browsers & app" description="Sign-ins by browser or native application" data={devices.byBrowser} colorOffset={4} />
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
}: {
  title: string;
  description: string;
  data: DeviceAnalyticsSummary["byBrowser"];
  colorOffset?: number;
}) {
  return (
    <ChartCard title={title} description={description}>
      <div className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" tick={{ fill: "#4f6058", fontSize: 10 }} />
            <YAxis hide />
            <ChartTooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatCount(Number(value)), "Sign-ins"]} cursor={{ fill: "rgb(0 57 18 / 0.035)" }} />
            <Bar dataKey="accesses" radius={[8, 8, 2, 2]} animationDuration={950} activeBar={{ stroke: "#ffffff", strokeWidth: 2, opacity: 0.82 }}>
              {data.map((item, index) => (
                <Cell key={item.name} fill={CHART_COLORS[(index + colorOffset) % CHART_COLORS.length]} />
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
}: {
  label: string;
  hint: string;
  value: string;
  emphasize?: boolean;
  href?: string;
  icon: LucideIcon;
}) {
  const content = (
    <CardContent className="relative p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-forest/6 text-brand-forest ring-1 ring-brand-forest/8">
          <Icon className="size-4.5" />
        </span>
        <span className="mt-1 size-1.5 rounded-full bg-brand-mantis shadow-[0_0_0_4px_rgb(111_219_66/0.12)]" />
      </div>
      <p className="text-3xl font-extrabold tabular-nums tracking-tight text-brand-forest">{value}</p>
      <p className="mt-2 text-sm font-bold text-brand-forest">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </CardContent>
  );

  const className = cn(
    "group overflow-hidden rounded-2xl border-border/60 bg-white shadow-[0_10px_35px_rgb(0_57_18/0.045)] transition-all",
    emphasize && "border-amber-200/80 bg-amber-50/40 ring-1 ring-amber-100",
    href && "hover:-translate-y-0.5 hover:border-brand-mantis hover:shadow-[0_14px_35px_rgb(0_57_18/0.09)]",
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={className}>{content}</Card>
      </Link>
    );
  }

  return <Card className={className}>{content}</Card>;
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
