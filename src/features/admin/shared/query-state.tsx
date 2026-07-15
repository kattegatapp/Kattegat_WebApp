"use client";

import { Inbox, Loader2, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";
import { ApiRequestError } from "@/lib/api/client";

export function AdminLoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-56 items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="size-6 animate-spin text-brand-forest" aria-hidden />
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
    <Card className="border-dashed border-border/80 bg-white/70">
      <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-forest/5 text-brand-forest">
          {icon ?? <Inbox className="size-7" aria-hidden />}
        </span>
        <p className="font-bold text-brand-forest">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
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
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {typeof count === "number" ? (
          <span className="inline-flex items-center rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-semibold text-brand-forest">
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
    <div className="mx-auto flex min-h-72 w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
        <Shield className="size-7" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-brand-forest">
          Please sign in again
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
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
      <Alert className="border-red-200 bg-red-50 text-red-800">
        <Shield />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{formatAdminAccessError(error, fallback)}</AlertDescription>
      </Alert>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
