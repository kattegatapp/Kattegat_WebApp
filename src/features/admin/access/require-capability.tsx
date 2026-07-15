"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";

import {
  AdminSessionExpired,
  isAdminSessionError,
} from "@/features/admin/shared/query-state";
import { Button } from "@/components/ui/button";
import { hasAnyCapability, isSuperAdmin } from "@/lib/admin/capabilities";
import { adminPath } from "@/lib/admin/paths";
import { ADMIN_ME_QUERY_OPTIONS } from "@/lib/admin/query";

export function AccessDenied({
  title = "You do not have access",
  description = "Your job role does not include this part of the control room. Ask an owner if you need it.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-72 w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
        <ShieldOff className="size-7" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-brand-forest">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Button nativeButton={false} render={<Link href={adminPath()} />}>
        Back to Operations
      </Button>
    </div>
  );
}

export function useAdminAccess(anyOf: readonly string[] = []) {
  const meQuery = useQuery({
    ...ADMIN_ME_QUERY_OPTIONS,
  });

  const subject = meQuery.data;
  const allowed =
    !anyOf.length ||
    isSuperAdmin(subject) ||
    hasAnyCapability(subject, anyOf);

  return {
    me: subject,
    isPending: meQuery.isPending,
    isError: meQuery.isError,
    error: meQuery.error,
    isSuperAdmin: isSuperAdmin(subject),
    allowed,
    can: (capabilities: readonly string[]) => hasAnyCapability(subject, capabilities),
  };
}

/**
 * Hides page content until capability is confirmed. Does not mount children when denied,
 * so unauthorized queries never fire.
 */
export function RequireCapability({
  anyOf = [],
  superAdminOnly = false,
  title,
  description,
  children,
}: {
  anyOf?: readonly string[];
  superAdminOnly?: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const access = useAdminAccess(anyOf);
  const allowed = superAdminOnly ? access.isSuperAdmin : access.allowed;

  if (access.isPending) {
    return (
      <div className="flex min-h-56 items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="size-6 animate-spin text-brand-forest" aria-hidden />
        <span className="sr-only">Checking access</span>
      </div>
    );
  }

  if (access.isError) {
    if (isAdminSessionError(access.error)) {
      return <AdminSessionExpired />;
    }
    return (
      <AccessDenied
        title="Could not verify access"
        description="We could not confirm your permissions right now. Try again, or sign in again if the problem continues."
      />
    );
  }

  if (!allowed) {
    return <AccessDenied title={title} description={description} />;
  }

  return children;
}
