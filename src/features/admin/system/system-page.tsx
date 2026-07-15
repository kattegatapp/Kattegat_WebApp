"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Cloud,
  Cpu,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAdminSystemInfo } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

function formatUptime(seconds: number | null | undefined) {
  if (seconds == null || seconds < 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Full-page server status — iOS-style frosted glass throughout. */
export function AdminSystemPage() {
  const queryClient = useQueryClient();
  const systemQuery = useQuery({
    queryKey: ["admin", "system"],
    queryFn: fetchAdminSystemInfo,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const info = systemQuery.data;
  const backendOk = info?.backend.reachable === true;
  const latency = info?.backend.latencyMs;

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 pb-2 sm:gap-6">
          <div className="ios-glass-pane flex flex-col gap-4 rounded-[1.5rem] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:rounded-[1.75rem] sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
                <Sparkles className="size-3.5 shrink-0 text-zinc-400" />
                Infrastructure
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Server details
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
                Live view of the Kattegat web app, API runtime, languages, and supporting services.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10 w-full shrink-0 rounded-full border-white/80 bg-white/45 px-4 text-zinc-900 shadow-sm backdrop-blur-xl hover:bg-white/65 sm:w-auto"
              disabled={systemQuery.isFetching}
              onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin", "system"] })}
            >
              <RefreshCw className={cn("size-4", systemQuery.isFetching && "animate-spin")} />
              Refresh probe
            </Button>
          </div>

          <section className="ios-glass-pane relative rounded-[1.5rem] px-4 py-5 sm:rounded-[1.75rem] sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-white/70 bg-white/50 text-zinc-900 shadow-sm backdrop-blur-xl">
                    <Server className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-500">
                      Command center
                    </p>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                      Application health
                    </h2>
                  </div>
                </div>
                <p className="mt-4 break-words text-sm font-semibold leading-7 text-zinc-700">
                  {info
                    ? `${info.web.name} running ${info.web.framework} ${info.web.frameworkVersion} against ${info.backend.framework ?? "Express"} · ${info.backend.database ?? "PostgreSQL"}`
                    : systemQuery.isPending
                      ? "Probing web and API environments…"
                      : "Could not load system information right now."}
                </p>
              </div>

              <div
                className={cn(
                  "inline-flex w-fit shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-extrabold uppercase tracking-wide backdrop-blur-xl",
                  backendOk
                    ? "border-white/80 bg-white/70 text-zinc-900"
                    : "border-amber-200/80 bg-amber-50/80 text-amber-950",
                )}
              >
                {backendOk ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
                <span
                  className={cn(
                    "size-2 rounded-full",
                    backendOk ? "animate-pulse bg-emerald-500" : "bg-amber-700",
                  )}
                />
                {backendOk ? "API live" : "API unreachable"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <HeroMetric
                icon={<Zap className="size-4" />}
                label="API latency"
                value={latency != null ? `${latency}ms` : systemQuery.isPending ? "…" : "—"}
              />
              <HeroMetric
                icon={<Timer className="size-4" />}
                label="API uptime"
                value={formatUptime(info?.backend.uptimeSeconds)}
              />
              <HeroMetric
                icon={<Gauge className="size-4" />}
                label="Probe time"
                value={info ? `${info.serverTookMs}ms` : "—"}
              />
              <HeroMetric
                icon={<ShieldCheck className="size-4" />}
                label="Environment"
                value={info?.web.environment ?? "—"}
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <GlassCard
              icon={<Cloud className="size-5 shrink-0 text-zinc-500" />}
              title="Web application"
              description="Next.js admin + public surfaces"
            >
              <Fact label="Name" value={info?.web.name ?? "Kattegat WebApp"} />
              <Fact label="Version" value={info?.web.version ?? "—"} />
              <Fact label="Language" value={info?.web.language ?? "TypeScript"} />
              <Fact label="Runtime" value={info?.web.runtimeVersion ?? "Node.js"} />
              <Fact
                label="Framework"
                value={info ? `${info.web.framework} ${info.web.frameworkVersion}` : "Next.js"}
              />
              <Fact label="UI" value={info ? `${info.web.ui} ${info.web.uiVersion}` : "React"} />
              <Fact label="Styling" value={info?.web.styling ?? "Tailwind CSS 4"} />
              <Fact label="Components" value={info?.web.components ?? "shadcn/ui"} />
              <Fact
                label="Server state"
                value={info?.web.state ?? "TanStack Query"}
                className="sm:col-span-2"
              />
            </GlassCard>

            <GlassCard
              icon={<HardDrive className="size-5 shrink-0 text-zinc-500" />}
              title="API server"
              description="Express backend and data plane"
            >
              <Fact
                label="Status"
                value={backendOk ? "Reachable" : systemQuery.isPending ? "Checking…" : "Unreachable"}
              />
              <Fact label="Version" value={info?.backend.version ?? "—"} />
              <Fact label="Language" value={info?.backend.language ?? "TypeScript"} />
              <Fact
                label="Runtime"
                value={
                  info?.backend.runtimeVersion
                    ? `${info.backend.runtime} ${info.backend.runtimeVersion}`
                    : info?.backend.runtime ?? "Node.js"
                }
              />
              <Fact label="Framework" value={info?.backend.framework ?? "Express"} />
              <Fact label="Database" value={info?.backend.database ?? "PostgreSQL (Supabase)"} />
              <Fact label="Cache" value={info?.backend.cache ?? "Upstash Redis"} />
              <Fact label="API environment" value={info?.backend.environment ?? "—"} />
              <Fact label="Message" value={info?.backend.message ?? "—"} className="sm:col-span-2" />
            </GlassCard>
          </section>

          <section className="ios-glass-pane rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-6">
            <div className="mb-4 flex items-start gap-2">
              <Cpu className="mt-0.5 size-5 shrink-0 text-zinc-500" />
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-zinc-900">Stack radar</h3>
                <p className="text-sm font-semibold text-zinc-600">
                  Languages and platforms across web, API, and mobile
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(info?.stack ?? []).map((item) => (
                <Badge
                  key={item.label}
                  variant="outline"
                  className="h-auto rounded-full border-white/80 bg-white/50 px-3 py-1.5 text-xs font-bold text-zinc-900 backdrop-blur-xl"
                  title={item.detail}
                >
                  {item.label}
                </Badge>
              ))}
              {!info && systemQuery.isPending ? (
                <p className="text-sm font-semibold text-zinc-700">Loading stack map…</p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(info?.stack ?? []).map((item) => (
                <div
                  key={`${item.label}-row`}
                  className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/70 bg-white/40 px-4 py-3 backdrop-blur-xl"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/60 text-xs font-extrabold text-zinc-800">
                    {item.label.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-zinc-900">{item.label}</p>
                    <p className="mt-0.5 break-words text-sm font-semibold leading-5 text-zinc-700">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {systemQuery.isError ? (
            <div className="ios-glass-pane rounded-[1.5rem] border-amber-200/70 p-5 text-amber-950">
              <div className="flex items-start gap-3">
                <Activity className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold">System probe failed</p>
                  <p className="mt-1 break-words text-sm font-medium">
                    {systemQuery.error instanceof Error
                      ? systemQuery.error.message
                      : "Try refreshing in a moment."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
    </div>
  );
}

function GlassCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ios-glass-pane min-w-0 rounded-[1.5rem] sm:rounded-[1.75rem]">
      <div className="border-b border-white/50 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h3 className="truncate text-lg font-extrabold text-zinc-900">{title}</h3>
        </div>
        <p className="mt-1 text-sm font-semibold text-zinc-600">{description}</p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
    </div>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/45 px-4 py-3 backdrop-blur-xl">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 break-words text-2xl font-extrabold tabular-nums tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function Fact({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-white/70 bg-white/40 px-3.5 py-3 backdrop-blur-xl",
        className,
      )}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold leading-5 text-zinc-900">{value}</p>
    </div>
  );
}
