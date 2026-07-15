"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, Timer } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ADMIN_DASHBOARD_VERSION } from "@/lib/admin/version";
import { fetchAdminSettings } from "@/lib/api/admin";
import { fallbackAppSettings } from "@/lib/api/settings";
import { cn } from "@/lib/utils";

function formatLoadMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)}s`;
}

function loadTone(ms: number | null) {
  if (ms == null) return "pending";
  if (ms < 400) return "fast";
  if (ms < 1200) return "ok";
  return "slow";
}

/** Measures settle time of the current admin view (route change → queries idle). */
function useAdminContentLoadMs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [loadMs, setLoadMs] = useState<number | null>(null);

  useEffect(() => {
    const started = performance.now();
    let settled = false;
    let sawFetching = false;
    let intervalId = 0;
    let safetyId = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(safetyId);
      setLoadMs(Math.max(1, Math.round(performance.now() - started)));
    };

    // Defer reset so effect bodies stay free of synchronous setState.
    const resetId = window.setTimeout(() => setLoadMs(null), 0);

    intervalId = window.setInterval(() => {
      const fetching = queryClient.isFetching();
      if (fetching > 0) {
        sawFetching = true;
        return;
      }
      if (sawFetching || performance.now() - started > 140) {
        finish();
      }
    }, 40);

    safetyId = window.setTimeout(finish, 12_000);

    return () => {
      settled = true;
      window.clearTimeout(resetId);
      window.clearInterval(intervalId);
      window.clearTimeout(safetyId);
    };
  }, [pathname, searchParams, queryClient]);

  return loadMs;
}

/** Ops-console footer with a high-visibility load-time chip. */
export function AdminFooter() {
  const year = new Date().getFullYear();
  const loadMs = useAdminContentLoadMs();
  const tone = loadTone(loadMs);
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const legalName =
    settingsQuery.data?.brand.legalName?.trim() ||
    fallbackAppSettings.brand.legalName;
  const privacyUrl =
    settingsQuery.data?.links.privacyUrl?.trim() ||
    fallbackAppSettings.links.privacyUrl ||
    "/privacy-policy";
  const termsUrl =
    settingsQuery.data?.links.termsUrl?.trim() ||
    fallbackAppSettings.links.termsUrl ||
    "/terms-of-service";

  return (
    <footer className="admin-footer-glass shrink-0 border-t px-4 py-3 sm:px-8">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          © {year} {legalName}. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span
            title="Time for this admin view to finish loading content"
            className={cn(
              "admin-load-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold tabular-nums shadow-sm ring-1 transition-colors",
              tone === "pending" &&
                "bg-brand-forest/5 text-brand-forest/70 ring-brand-forest/10",
              tone === "fast" &&
                "bg-brand-mantis text-brand-forest ring-brand-mantis/40 shadow-[0_8px_24px_rgb(111_219_66/0.35)]",
              tone === "ok" &&
                "bg-brand-forest text-white ring-brand-forest/30 shadow-[0_8px_24px_rgb(0_57_18/0.2)]",
              tone === "slow" &&
                "bg-amber-100 text-amber-950 ring-amber-300/60 shadow-[0_8px_24px_rgb(251_191_36/0.25)]",
            )}
          >
            {tone === "pending" ? (
              <Timer className="size-3.5 animate-pulse" />
            ) : (
              <Gauge className="size-3.5" />
            )}
            <span className="uppercase tracking-[0.12em] opacity-70">Load</span>
            <span className="text-sm tracking-tight">
              {loadMs == null ? "…" : formatLoadMs(loadMs)}
            </span>
          </span>

          <span className="inline-flex items-center rounded-full border border-brand-forest/10 bg-white px-3 py-1.5 text-[11px] font-bold tabular-nums text-brand-forest shadow-sm">
            v{ADMIN_DASHBOARD_VERSION}
          </span>

          <Link
            href={termsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-brand-forest/5 hover:text-brand-forest"
          >
            Terms
          </Link>
          <Link
            href={privacyUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-brand-forest/5 hover:text-brand-forest"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
