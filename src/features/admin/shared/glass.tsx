"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared iOS glass card surface for admin Card / panel wrappers. */
export const ADMIN_GLASS_CARD =
  "ios-glass-pane overflow-hidden rounded-[1.35rem] border-white/80 bg-transparent shadow-none ring-0 sm:rounded-[1.5rem]";

/** Compact frosted chip / pill. */
export const ADMIN_GLASS_CHIP =
  "ios-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-zinc-700";

/** Success / complete action alert — translucent frosted glass. */
export const ADMIN_GLASS_ALERT_SUCCESS =
  "ios-glass-pane rounded-2xl border-emerald-200/60 bg-emerald-50/40 text-emerald-950 shadow-none backdrop-blur-xl";

/** Error action alert — translucent frosted glass. */
export const ADMIN_GLASS_ALERT_ERROR =
  "ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/40 text-red-950 shadow-none backdrop-blur-xl";

/** Warning action alert — translucent frosted glass. */
export const ADMIN_GLASS_ALERT_WARN =
  "ios-glass-pane rounded-2xl border-amber-200/60 bg-amber-50/40 text-amber-950 shadow-none backdrop-blur-xl";

/**
 * Full-page frosted canvas used by AdminShell for every non-chat screen.
 * Pages can nest ios-glass-pane sections inside; avoid nesting another ios-glass-screen.
 */
export function AdminGlassCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "admin-glass-canvas ios-glass-screen relative flex min-h-0 flex-1 flex-col rounded-[1.25rem] border border-white/55 p-3 sm:rounded-[1.75rem] sm:p-5 lg:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div className="absolute -left-24 top-0 size-80 rounded-full bg-[#6FDB42]/26 blur-3xl" />
        <div className="absolute -right-20 top-24 size-96 rounded-full bg-[#48DC81]/20 blur-3xl" />
        <div className="absolute bottom-6 left-1/3 size-72 rounded-full bg-[#48DC81]/18 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 size-56 rounded-full bg-white/25 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function AdminGlassPane({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ios-glass-pane rounded-[1.35rem] sm:rounded-[1.5rem]", className)}>
      {children}
    </div>
  );
}
