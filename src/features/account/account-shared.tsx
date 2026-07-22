"use client";

import type { ReactNode } from "react";

import { MEMBER_GLASS_CARD } from "@/features/account/account-glass";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function accountDisplayName(input: {
  displayName?: string | null;
  businessName?: string | null;
  username?: string | null;
  email: string;
}) {
  return (
    input.displayName ||
    input.businessName ||
    input.username ||
    input.email.split("@")[0] ||
    "Member"
  );
}

export function accountInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "K").toUpperCase();
}

function isKattegatVettedAvatar(name: string, imageUrl?: string | null) {
  if (name.trim().toLowerCase() === "kattegat.vetted") return true;
  const url = imageUrl?.toLowerCase() ?? "";
  return url.includes("vetted-chat-logo");
}

export function AccountAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const vettedLogo = isKattegatVettedAvatar(name, imageUrl);

  return (
    <Avatar className={cn("rounded-xl", vettedLogo && "bg-white", className)}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt=""
          className={cn(
            "rounded-[inherit]",
            vettedLogo ? "object-contain p-[12%]" : "object-cover",
          )}
        />
      ) : null}
      <AvatarFallback className="rounded-[inherit] bg-brand-blue/10 text-xs font-bold text-brand-blue">
        {accountInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function AccountGlass({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn(MEMBER_GLASS_CARD, className)}>
      {children}
    </Card>
  );
}

/** Dense marketplace catalog grid — scales better than a long single-column list. */
export const ACCOUNT_CATALOG_GRID =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3";

export function AccountCatalogGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(ACCOUNT_CATALOG_GRID, className)}>{children}</div>;
}

/** Solid surface for dense catalog cards (listings, requirements) — easier to scan than glass. */
export function AccountListCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[18px] border border-brand-forest/10 !bg-white shadow-sm ring-0",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function SectionHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 mt-8 flex items-baseline justify-between gap-3 first:mt-0", className)}>
      <h2 className="text-xl font-extrabold tracking-[-0.01em] text-brand-forest">{title}</h2>
      {action}
    </div>
  );
}

export function AccountViewIntro({
  title,
  badge,
  description,
  className,
}: {
  title: string;
  badge?: "Marketplace" | "Your catalog" | "Your posts";
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-xl font-extrabold tracking-[-0.01em] text-brand-forest">{title}</h2>
        {badge ? (
          <Badge
            variant="outline"
            className="rounded-full border-brand-mantis/35 bg-brand-mantis/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-forest"
          >
            {badge}
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function IdChip({ children, gold }: { children: ReactNode; gold?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide",
        gold
          ? "border-amber-300/60 bg-amber-50 text-amber-800"
          : "border-brand-forest/12 bg-brand-forest/[0.03] text-brand-forest/80",
      )}
    >
      {children}
    </Badge>
  );
}

export function ProNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-brand-mantis/25 bg-brand-mantis/10 px-4 py-3 text-[12.5px] leading-6 text-brand-forest/70">
      {children}
    </div>
  );
}

export function AccountViewWrap({ children }: { children: ReactNode }) {
  return <div className="account-view mx-auto max-w-6xl">{children}</div>;
}
