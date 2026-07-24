"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared iOS glass card surface for member account panels. */
export const MEMBER_GLASS_CARD =
  "ios-glass-pane overflow-hidden rounded-[1.35rem] border-white/80 bg-transparent shadow-none ring-0 sm:rounded-[1.5rem]";

/**
 * Full-page frosted canvas for the member account workspace (mirrors admin glass).
 */
export function MemberGlassCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "member-glass-canvas ios-glass-screen relative flex min-h-0 flex-1 flex-col rounded-[1.1rem] border border-white/55 p-2.5 sm:rounded-[1.5rem] sm:p-4 lg:p-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div className="absolute -left-24 top-0 size-80 rounded-full bg-[#6FDB42]/24 blur-3xl" />
        <div className="absolute -right-20 top-24 size-96 rounded-full bg-[#48DC81]/16 blur-3xl" />
        <div className="absolute bottom-6 left-1/3 size-72 rounded-full bg-[#48DC81]/14 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 size-56 rounded-full bg-white/30 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
