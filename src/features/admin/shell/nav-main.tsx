"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  ConciergeBell,
  Link2,
  MailCheck,
  MapPinned,
  Search,
  Settings2,
  Shield,
  Sparkles,
  ToggleLeft,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import {
  adminNavItems,
  canAccessAdminNavItem,
  isSettingsPath,
  resolveAdminNavBadgeCount,
  type AdminNavItem,
} from "@/features/admin/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { adminPath } from "@/lib/admin/paths";
import { fetchAdminMe, fetchAdminOverview } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type DropdownItem = {
  title: string;
  href: string;
  icon: AdminNavItem["icon"];
  badge?: number;
  anyOf?: readonly string[];
  superAdminOnly?: boolean;
};

export function AdminNavMain() {
  const pathname = usePathname();
  const overviewHref = adminPath();
  const approvalsHref = adminPath("/approvals");
  const waitlistHref = adminPath("/waitlist");
  const usersHref = adminPath("/users");
  const identityVerificationsHref = adminPath("/identity-verifications");
  const moderationHref = adminPath("/moderation");
  const settingsHref = adminPath("/settings");
  const recommendedLeadsHref = adminPath("/recommended-leads");
  const foundingMembersHref = adminPath("/founding-members");
  const agentRequestsHref = adminPath("/agent-requests");
  const whiteGloveApplicationsHref = adminPath("/white-glove-applications");
  const acceptedApplicationsHref = adminPath("/accepted-applications");
  const listingsHref = adminPath("/listings");
  const requirementsHref = adminPath("/requirements");
  const auditLogsHref = adminPath("/audit-logs");

  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: fetchAdminMe,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const me = meQuery.data;

  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 5 * 60_000,
    retry: false,
    enabled: Boolean(me),
  });

  function visible(item: AdminNavItem) {
    return canAccessAdminNavItem(item, me);
  }

  const operationsItems = adminNavItems.filter(
    (item) =>
      visible(item) &&
      (item.href === overviewHref || item.href === approvalsHref || item.href === waitlistHref),
  );
  const userManagementItems = adminNavItems.filter(
    (item) =>
      visible(item) &&
      (item.href === usersHref ||
        item.href === identityVerificationsHref ||
        item.href === moderationHref),
  );
  const growthItems = adminNavItems.filter(
    (item) =>
      visible(item) &&
      (item.href === recommendedLeadsHref || item.href === foundingMembersHref),
  );
  const vettedDeskHrefs = [agentRequestsHref, whiteGloveApplicationsHref, acceptedApplicationsHref];
  const contentItems = adminNavItems.filter(
    (item) => visible(item) && (item.href === listingsHref || item.href === requirementsHref),
  );
  const configItems = adminNavItems.filter(
    (item) =>
      visible(item) &&
      !operationsItems.includes(item) &&
      !userManagementItems.includes(item) &&
      !growthItems.includes(item) &&
      !vettedDeskHrefs.includes(item.href) &&
      !contentItems.includes(item) &&
      item.href !== settingsHref &&
      item.href !== auditLogsHref,
  );
  const governanceItems = adminNavItems.filter(
    (item) => visible(item) && item.href === auditLogsHref,
  );
  const showSettings = canAccessAdminNavItem(
    { anyOf: ["settings.read", "settings.write"] },
    me,
  );

  const vettedItems: DropdownItem[] = [
    {
      title: "Vetted chats",
      href: agentRequestsHref,
      icon: ConciergeBell,
      badge: overviewQuery.data
        ? resolveAdminNavBadgeCount("vettedChats", overviewQuery.data.kpis)
        : 0,
      anyOf: ["chat.admin"],
    },
    {
      title: "White Glove applications",
      href: whiteGloveApplicationsHref,
      icon: Sparkles,
      badge: overviewQuery.data
        ? resolveAdminNavBadgeCount("vetted", overviewQuery.data.kpis)
        : 0,
      anyOf: ["growth.write"],
    },
    {
      title: "Accepted Applications",
      href: acceptedApplicationsHref,
      icon: BadgeCheck,
      anyOf: ["growth.write"],
    },
  ].filter((item) => canAccessAdminNavItem(item, me));

  const userDropdownItems: DropdownItem[] = [
    { title: "User accounts", href: usersHref, icon: UsersRound, anyOf: ["users.read"] },
    {
      title: "Identity verification",
      href: identityVerificationsHref,
      icon: BadgeCheck,
      badge: overviewQuery.data?.kpis.pendingIdentityVerifications ?? 0,
      anyOf: ["moderation.write"],
    },
    {
      title: "Moderation reports",
      href: moderationHref,
      icon: Shield,
      badge: overviewQuery.data?.kpis.pendingModerationReports ?? 0,
      anyOf: ["moderation.write"],
    },
  ].filter((item) => canAccessAdminNavItem(item, me));

  const contentDropdownItems: DropdownItem[] = [
    {
      title: "Listings",
      href: listingsHref,
      icon: Building2,
      badge: overviewQuery.data?.kpis.pendingListings ?? 0,
      anyOf: ["moderation.write"],
    },
    {
      title: "Requirements",
      href: requirementsHref,
      icon: BriefcaseBusiness,
      badge: overviewQuery.data?.kpis.pendingRequirements ?? 0,
      anyOf: ["moderation.write"],
    },
  ].filter((item) => canAccessAdminNavItem(item, me));

  function badgeFor(item: AdminNavItem) {
    if (!item.badgeKey || !overviewQuery.data) return null;
    const count = resolveAdminNavBadgeCount(item.badgeKey, overviewQuery.data.kpis);
    return count > 0 ? count : null;
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Operations
        </SidebarGroupLabel>
        <SidebarMenu>
          {operationsItems
            .filter((item) => item.href !== approvalsHref)
            .map((item) => (
              <AdminNavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                badge={badgeFor(item)}
              />
            ))}
        </SidebarMenu>
      </SidebarGroup>

      {contentDropdownItems.length ? (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Marketplace Content
          </SidebarGroupLabel>
          <SidebarMenu>
            <AdminNavDropdown
              title="Content"
              icon={Building2}
              isActive={contentDropdownItems.some((item) => pathname.startsWith(item.href))}
              badge={null}
              items={contentDropdownItems}
            />
          </SidebarMenu>
        </SidebarGroup>
      ) : null}

      {userDropdownItems.length ? (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            User Management
          </SidebarGroupLabel>
          <SidebarMenu>
            <AdminNavDropdown
              title="Users"
              icon={UserCog}
              isActive={userDropdownItems.some((item) => pathname.startsWith(item.href))}
              badge={null}
              items={userDropdownItems}
            />
          </SidebarMenu>
        </SidebarGroup>
      ) : null}

      {vettedItems.length || growthItems.length ? (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Vetted
          </SidebarGroupLabel>
          <SidebarMenu>
            {vettedItems.length ? (
              <AdminNavDropdown
                title="Vetted"
                icon={ConciergeBell}
                isActive={vettedItems.some((item) => pathname.startsWith(item.href))}
                badge={null}
                items={vettedItems}
              />
            ) : null}
            {growthItems.map((item) => (
              <AdminNavLink
                key={item.href}
                item={item}
                isActive={pathname.startsWith(item.href)}
                badge={badgeFor(item)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ) : null}

      {showSettings || configItems.length ? (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu>
            {showSettings ? (
              <AdminNavDropdown
                title="Settings"
                icon={Settings2}
                isActive={pathname.startsWith(settingsHref)}
                badge={null}
                items={[
                  { title: "Brand", href: adminPath("/settings/brand"), icon: Building2 },
                  { title: "Metadata", href: adminPath("/settings/metadata"), icon: Search },
                  { title: "Links", href: adminPath("/settings/links"), icon: Link2 },
                  { title: "Features", href: adminPath("/settings/features"), icon: ToggleLeft },
                  { title: "Operations", href: adminPath("/settings/operations"), icon: MapPinned },
                  { title: "Email", href: adminPath("/settings/email"), icon: MailCheck },
                ]}
              />
            ) : null}
            {configItems.map((item) => (
              <AdminNavLink
                key={item.href}
                item={item}
                isActive={
                  item.href === adminPath("/settings")
                    ? isSettingsPath(pathname)
                    : pathname.startsWith(item.href)
                }
                badge={badgeFor(item)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ) : null}

      {governanceItems.length ? (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Governance
          </SidebarGroupLabel>
          <SidebarMenu>
            {governanceItems.map((item) => (
              <AdminNavLink
                key={item.href}
                item={item}
                isActive={pathname.startsWith(item.href)}
                badge={null}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ) : null}
    </>
  );
}

function AdminNavDropdown({
  title,
  icon: Icon,
  isActive,
  badge,
  items,
}: {
  title: string;
  icon: AdminNavItem["icon"];
  isActive: boolean;
  badge: number | null;
  items: DropdownItem[];
}) {
  const pathname = usePathname();
  const [manuallyOpen, setOpen] = useState(false);
  const open = isActive || manuallyOpen;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              className="h-10 rounded-xl px-3 text-white/60 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:font-bold data-[active=true]:text-white"
              isActive={isActive}
              tooltip={title}
            />
          }
        >
          <Icon />
          <span>{title}</span>
          <ChevronRight className="ml-auto transition-transform group-data-[panel-open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        {badge != null ? (
          <SidebarMenuBadge className="rounded-full bg-white/10 font-semibold text-white">
            {badge > 99 ? "99+" : badge}
          </SidebarMenuBadge>
        ) : null}
        <CollapsibleContent>
          <SidebarMenuSub className="border-white/15">
            {items.map((item) => (
              <SidebarMenuSubItem key={item.href} className="relative">
                <SidebarMenuSubButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  className="h-9 pr-9 text-white/55 hover:bg-white/10 hover:text-white data-active:bg-brand-mantis data-active:font-bold data-active:text-brand-forest"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
                {item.badge != null && item.badge > 0 ? (
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-brand-forest">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function AdminNavLink({
  item,
  isActive,
  badge,
}: {
  item: AdminNavItem;
  isActive: boolean;
  badge: number | null;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-10 rounded-xl px-3 text-white/60 hover:bg-white/10 hover:text-white data-[active=true]:bg-brand-mantis data-[active=true]:font-bold data-[active=true]:text-brand-forest data-[active=true]:shadow-[0_8px_24px_rgb(111_219_66/0.16)]"
        render={<Link href={item.href} />}
        isActive={isActive}
        tooltip={badge != null ? `${item.title} (${badge})` : item.title}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
      {badge != null ? (
        <SidebarMenuBadge
          className={cn(
            "rounded-full bg-white/10 font-semibold text-white",
            isActive && "bg-brand-forest/15 text-brand-forest",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}
