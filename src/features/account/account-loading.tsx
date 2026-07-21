"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChatConversationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading conversations</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-brand-forest/6 px-4 py-3.5"
        >
          <Skeleton className="size-12 shrink-0 rounded-full bg-brand-forest/8" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-[min(72%,9rem)] rounded-full bg-brand-forest/8" />
              <Skeleton className="h-2.5 w-10 shrink-0 rounded-full bg-brand-forest/6" />
            </div>
            <Skeleton className="h-3 w-[min(88%,12rem)] rounded-full bg-brand-forest/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-1 py-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading messages</span>
      <div className="flex justify-start">
        <Skeleton className="h-14 w-[min(72%,16rem)] rounded-2xl rounded-bl-md bg-white/80" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[min(58%,12rem)] rounded-2xl rounded-br-md bg-brand-mantis/25" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-20 w-[min(78%,18rem)] rounded-2xl rounded-bl-md bg-white/80" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-[min(64%,14rem)] rounded-2xl rounded-br-md bg-brand-mantis/25" />
      </div>
    </div>
  );
}

export function AccountCardGridSkeleton({ count = 4, columns = 2 }: { count?: number; columns?: 1 | 2 }) {
  return (
    <div
      className={cn("grid gap-3", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="ios-glass-pane space-y-3 rounded-[18px] p-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full bg-brand-forest/8" />
            <Skeleton className="h-5 w-12 rounded-full bg-brand-forest/6" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded-full bg-brand-forest/8" />
          <Skeleton className="h-3 w-full rounded-full bg-brand-forest/6" />
          <Skeleton className="h-3 w-5/6 rounded-full bg-brand-forest/6" />
        </div>
      ))}
    </div>
  );
}
