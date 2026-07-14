"use client";

import {
  ClipboardCheck,
  ExternalLink,
  KeyRound,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";

import { getAdminBreadcrumbs, getAdminNavItem } from "@/features/admin/navigation";
import { hasAnyCapability } from "@/lib/admin/capabilities";
import { resetAdminQueryCache } from "@/lib/admin/query-cache";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADMIN_LOGIN_PATH, adminPath } from "@/lib/admin/paths";
import { clearAdminToken, fetchAdminMe, fetchAdminSettings } from "@/lib/api/admin";
import { fallbackAppSettings } from "@/lib/api/settings";
import { cn } from "@/lib/utils";
import { AdminNotificationsMenu } from "@/features/admin/shell/notifications-menu";

function roleLabel(role: string | null | undefined) {
  if (!role) return "Admin";
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayName(me: {
  businessName?: string | null;
  username?: string | null;
  email?: string;
} | null | undefined) {
  const name = me?.businessName?.trim() || me?.username?.trim();
  return name || me?.email || "Admin";
}

function initialsFrom(me: {
  businessName?: string | null;
  username?: string | null;
  email?: string;
} | null | undefined) {
  const source = me?.businessName?.trim() || me?.username?.trim() || me?.email || "KG";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** Header: breadcrumbs, quick links, and account dropdown. */
export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const current = getAdminNavItem(pathname);
  const breadcrumbs = getAdminBreadcrumbs(pathname);

  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: fetchAdminMe,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const me = meQuery.data;
  const canApprovals = hasAnyCapability(me, ["moderation.write"]);
  const canSettings = hasAnyCapability(me, ["settings.read", "settings.write"]);
  const brand = settingsQuery.data?.brand ?? fallbackAppSettings.brand;
  const links = settingsQuery.data?.links ?? fallbackAppSettings.links;
  const websiteUrl = links.webAppUrl?.trim() || "/";
  const privacyUrl = links.privacyUrl?.trim() || "/privacy-policy";
  const supportEmail = brand.supportEmail?.trim() || fallbackAppSettings.brand.supportEmail;

  async function logout() {
    try {
      await clearAdminToken();
    } finally {
      resetAdminQueryCache(queryClient);
      router.replace(ADMIN_LOGIN_PATH);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-border/70 bg-white/85 shadow-[0_1px_0_rgb(255_255_255/0.8)] backdrop-blur-xl transition-[width,height] ease-linear sm:h-[4.5rem] sm:gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 px-2 sm:gap-2 sm:px-4">
        <SidebarTrigger className="-ml-0.5 size-10 shrink-0 rounded-xl border border-border/70 bg-white shadow-sm hover:bg-muted sm:size-8" />
        <Separator
          orientation="vertical"
          className="mr-1 hidden data-[orientation=vertical]:h-4 sm:mr-2 sm:block"
        />
        <div className="min-w-0 flex-1">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <Fragment key={`${item.title}-${index}`}>
                  {index > 0 ? <BreadcrumbSeparator className="hidden sm:block" /> : null}
                  <BreadcrumbItem className={index === 0 ? "hidden sm:block" : undefined}>
                    {item.href ? (
                      <BreadcrumbLink render={<Link href={item.href} />}>{item.title}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="max-w-[9.5rem] truncate sm:max-w-none">
                        {item.title}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {current?.description ? (
            <p className="mt-0.5 hidden max-w-xl truncate text-[11px] text-muted-foreground lg:block">
              {current.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 px-2 sm:gap-1.5 sm:px-4">
        <HeaderIconLink
          href={websiteUrl}
          external
          label="Open website"
          className="hidden md:inline-flex"
        >
          <ExternalLink className="size-4" />
          <span className="hidden lg:inline">Website</span>
        </HeaderIconLink>

        {canApprovals ? (
          <HeaderIconLink
            href={`${adminPath("/listings")}?view=pending`}
            label="Approvals"
            className="hidden sm:inline-flex"
          >
            <ClipboardCheck className="size-4" />
            <span className="hidden xl:inline">Approvals</span>
          </HeaderIconLink>
        ) : null}

        {canSettings ? (
          <HeaderIconLink
            href={adminPath("/settings/brand")}
            label="Settings"
            className="hidden sm:inline-flex"
          >
            <Settings2 className="size-4" />
            <span className="hidden xl:inline">Settings</span>
          </HeaderIconLink>
        ) : null}

        <AdminNotificationsMenu />

        <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-10 gap-2 rounded-xl border border-border/70 bg-white px-1.5 shadow-sm hover:bg-muted sm:px-2"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {me?.avatarUrl ? <AvatarImage src={me.avatarUrl} alt="" /> : null}
              <AvatarFallback className="rounded-lg bg-brand-forest text-[11px] font-bold text-white">
                {initialsFrom(me)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-36 truncate text-left text-sm font-medium md:block">
              {displayName(me)}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-64 rounded-lg">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5 px-0.5 py-0.5">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayName(me)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{me?.email ?? "—"}</span>
                  {me?.phone ? (
                    <span className="truncate text-xs text-muted-foreground">{me.phone}</span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">{roleLabel(me?.adminRole)}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={adminPath("/account")} />}
              >
                <UserRound />
                My profile
              </DropdownMenuItem>
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={`${adminPath("/account")}?tab=security`} />}
              >
                <KeyRound />
                Change password
              </DropdownMenuItem>
              {canApprovals ? (
                <DropdownMenuItem
                  nativeButton={false}
                  render={<Link href={`${adminPath("/listings")}?view=pending`} />}
                  className="sm:hidden"
                >
                  <ClipboardCheck />
                  Approvals
                </DropdownMenuItem>
              ) : null}
              {canSettings ? (
                <DropdownMenuItem
                  nativeButton={false}
                  render={<Link href={adminPath("/settings/brand")} />}
                  className="sm:hidden"
                >
                  <Settings2 />
                  Settings
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton={false}
                render={<a href={websiteUrl} target="_blank" rel="noreferrer" />}
              >
                <ExternalLink />
                Open website
              </DropdownMenuItem>
              <DropdownMenuItem
                nativeButton={false}
                render={<a href={privacyUrl} target="_blank" rel="noreferrer" />}
              >
                <ExternalLink />
                Privacy policy
              </DropdownMenuItem>
              {supportEmail ? (
                <DropdownMenuItem
                  nativeButton={false}
                  render={<a href={`mailto:${supportEmail}`} />}
                >
                  <ExternalLink />
                  Email support
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function HeaderIconLink({
  href,
  label,
  children,
  external = false,
  className,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-forest/5 hover:text-brand-forest sm:h-9",
    className,
  );

  if (external) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={classes}
              aria-label={label}
            />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Link href={href} className={classes} aria-label={label} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
