"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

function subscribe() {
  return () => undefined;
}

/**
 * End-to-end indeterminate progress rail for the admin header bottom edge.
 * Visible while React Query is fetching/mutating or during route changes.
 */
export function HeaderProgressLine({ className }: { className?: string }) {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    // Defer so the effect does not call setState synchronously on commit.
    const showId = window.setTimeout(() => setNavigating(true), 0);
    const hideId = window.setTimeout(() => setNavigating(false), 450);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, [mounted, pathname, searchParams]);

  const active = mounted && (fetching > 0 || mutating > 0 || navigating);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[2px] overflow-hidden bg-transparent",
        className,
      )}
      role="progressbar"
      aria-hidden={!active}
      aria-busy={active}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 h-full w-[38%] rounded-full bg-gradient-to-r from-brand-mantis via-brand-emerald to-brand-blue shadow-[0_0_14px_rgb(111_219_66/0.55)] transition-opacity duration-200",
          active ? "opacity-100 animate-header-progress" : "opacity-0",
        )}
      />
    </div>
  );
}
