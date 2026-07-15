"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { CircleCheck, X, XCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type ActionNotice = {
  id: number;
  tone: "success" | "error";
  title: string;
  message: string;
};

function announceAction(detail: Omit<ActionNotice, "id">) {
  window.dispatchEvent(new CustomEvent("kattegat:action-notice", { detail }));
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: () =>
            announceAction({
              tone: "success",
              title: "Action completed",
              message: "Your changes were saved successfully.",
            }),
          onError: (error) =>
            announceAction({
              tone: "error",
              title: "Action could not be completed",
              message:
                error instanceof Error ? error.message : "Please try again.",
            }),
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ActionNotifications />
    </QueryClientProvider>
  );
}

function ActionNotifications() {
  const [notices, setNotices] = useState<ActionNotice[]>([]);
  useEffect(() => {
    function onNotice(event: Event) {
      const detail = (event as CustomEvent<Omit<ActionNotice, "id">>).detail;
      const id = Date.now() + Math.random();
      setNotices((current) => [...current.slice(-2), { ...detail, id }]);
      window.setTimeout(
        () =>
          setNotices((current) => current.filter((notice) => notice.id !== id)),
        5000,
      );
    }
    window.addEventListener("kattegat:action-notice", onNotice);
    return () => window.removeEventListener("kattegat:action-notice", onNotice);
  }, []);
  if (!notices.length) return null;
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      aria-live="polite"
    >
      {notices.map((notice) => (
        <div
          key={notice.id}
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            notice.tone === "success"
              ? "pointer-events-auto flex gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-emerald-900 shadow-2xl"
              : "pointer-events-auto flex gap-3 rounded-2xl border border-red-200 bg-white p-4 text-red-900 shadow-2xl"
          }
        >
          {notice.tone === "success" ? (
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold">{notice.title}</p>
            <p className="mt-0.5 text-sm opacity-80">{notice.message}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
            aria-label="Dismiss notification"
            onClick={() =>
              setNotices((current) =>
                current.filter((item) => item.id !== notice.id),
              )
            }
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
