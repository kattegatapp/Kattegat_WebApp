"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ADMIN_DASHBOARD_VERSION } from "@/lib/admin/version";
import { fetchAdminSettings } from "@/lib/api/admin";
import { fallbackAppSettings } from "@/lib/api/settings";

/** Quiet ops-console footer — copyright + dashboard build version. */
export function AdminFooter() {
  const year = new Date().getFullYear();
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

  return (
    <footer className="mt-auto border-t border-border/70 bg-white/70 px-4 py-4 backdrop-blur sm:px-8">
      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {legalName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="tabular-nums">Admin dashboard v{ADMIN_DASHBOARD_VERSION}</span>
          <span className="hidden text-border sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href={privacyUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-forest hover:underline underline-offset-2"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
