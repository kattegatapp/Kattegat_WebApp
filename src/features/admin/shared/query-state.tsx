"use client";

import { Inbox, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_GLASS_CARD, ADMIN_GLASS_CHIP } from "@/features/admin/shared/glass";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import { goToAdminLogin } from "@/lib/admin/session-client";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function AdminLoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-40" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <Card className={cn(ADMIN_GLASS_CARD, "border-dashed")}>
      <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-[1.15rem] border border-white/80 bg-white/55 text-zinc-800 shadow-sm backdrop-blur-xl">
          {icon ?? <Inbox className="size-7" aria-hidden />}
        </span>
        <p className="font-extrabold text-zinc-900">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-6 text-zinc-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export function AdminPageHeader({
  title,
  description,
  count,
  countLabel = "records",
  actions,
}: {
  title: string;
  description: string;
  count?: number;
  countLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ios-glass-pane flex flex-wrap items-end justify-between gap-3 rounded-[1.35rem] px-4 py-4 sm:rounded-[1.5rem] sm:px-5 sm:py-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-zinc-600">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {typeof count === "number" ? (
          <span className={cn(ADMIN_GLASS_CHIP, "px-2.5 py-1 text-xs text-zinc-800")}>
            {count} {countLabel}
          </span>
        ) : null}
        {actions}
      </div>
    </div>
  );
}

export function isAdminSessionError(error: unknown) {
  return error instanceof ApiRequestError && error.status === 401;
}

export function AdminSessionExpired({
  description = "Your admin session expired or is no longer valid. Sign in again to continue.",
}: {
  description?: string;
}) {
  const router = useRouter();

  return (
    <div className="ios-glass-pane mx-auto flex min-h-72 w-full max-w-lg flex-col items-center justify-center gap-4 rounded-[1.5rem] px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-[1.15rem] border border-amber-200/80 bg-amber-50/80 text-amber-900 backdrop-blur-xl">
        <Shield className="size-7" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">
          Please sign in again
        </h1>
        <p className="text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      <Button
        className="h-10 rounded-full border border-white/80 bg-white/55 text-zinc-900 backdrop-blur-xl hover:bg-white/75"
        variant="outline"
        onClick={() => void goToAdminLogin((path) => router.replace(path))}
      >
        Back to login
      </Button>
    </div>
  );
}

export function AdminQueryError({
  error,
  title = "Could not load this workspace",
  fallback = "Try again shortly.",
  onRetry,
}: {
  error: unknown;
  title?: string;
  fallback?: string;
  onRetry?: () => void;
}) {
  if (isAdminSessionError(error)) {
    return <AdminSessionExpired description={formatAdminAccessError(error, fallback)} />;
  }

  return (
    <div className="space-y-3">
      <Alert className="ios-glass-pane border-red-200/70 bg-red-50/70 text-red-900">
        <Shield />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{formatAdminAccessError(error, fallback)}</AlertDescription>
      </Alert>
      {onRetry ? (
        <Button
          variant="outline"
          className="rounded-full border-white/80 bg-white/55 backdrop-blur-xl"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
