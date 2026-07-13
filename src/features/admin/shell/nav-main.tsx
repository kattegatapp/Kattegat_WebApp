"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, Building2, ChevronRight, Link2, MailCheck, MapPinned, Search, Settings2, ToggleLeft, UserCog, UsersRound } from "lucide-react";
import { useState } from "react";

import {
  adminNavItems,
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
import { fetchAdminOverview } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

export function AdminNavMain() {
  const pathname = usePathname();
  const overviewHref = adminPath();
  const approvalsHref = adminPath("/approvals");
  const waitlistHref = adminPath("/waitlist");
  const usersHref = adminPath("/users");
  const identityVerificationsHref = adminPath("/identity-verifications");
  const settingsHref = adminPath("/settings");
  const recommendedLeadsHref = adminPath("/recommended-leads");
  const foundingMembersHref = adminPath("/founding-members");
  const listingsHref = adminPath("/listings");
  const requirementsHref = adminPath("/requirements");

  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const operationsItems = adminNavItems.filter(
    (item) =>
      item.href === overviewHref ||
      item.href === approvalsHref ||
      item.href === waitlistHref,
  );
  const userManagementItems = adminNavItems.filter(
    (item) => item.href === usersHref || item.href === identityVerificationsHref,
  );
  const vettedItems = adminNavItems.filter(
    (item) => item.href === recommendedLeadsHref || item.href === foundingMembersHref,
  );
  const contentItems = adminNavItems.filter((item) => item.href === listingsHref || item.href === requirementsHref);
  const configItems = adminNavItems.filter(
    (item) => !operationsItems.includes(item) && !userManagementItems.includes(item) && !vettedItems.includes(item) && !contentItems.includes(item) && item.href !== settingsHref,
  );

  function badgeFor(item: AdminNavItem) {
    if (!item.badgeKey || !overviewQuery.data) return null;
    const count = resolveAdminNavBadgeCount(item.badgeKey, overviewQuery.data.kpis);
    return count > 0 ? count : null;
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Operations</SidebarGroupLabel>
        <SidebarMenu>
          {operationsItems.filter((item) => item.href !== approvalsHref).map((item) => (
            <AdminNavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              badge={badgeFor(item)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Marketplace Content</SidebarGroupLabel>
        <SidebarMenu><AdminNavDropdown title="Content" icon={Building2} isActive={contentItems.some((item) => pathname.startsWith(item.href))} badge={null} items={[{ title: "Listings", href: listingsHref, icon: Building2, badge: overviewQuery.data?.kpis.pendingListings ?? 0 }, { title: "Requirements", href: requirementsHref, icon: BriefcaseBusiness, badge: overviewQuery.data?.kpis.pendingRequirements ?? 0 }]} /></SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">User Management</SidebarGroupLabel>
        <SidebarMenu>
          <AdminNavDropdown
            title="Users"
            icon={UserCog}
            isActive={userManagementItems.some((item) => pathname.startsWith(item.href))}
            badge={null}
            items={[
              { title: "User accounts", href: usersHref, icon: UsersRound },
              { title: "Identity verification", href: identityVerificationsHref, icon: BadgeCheck, badge: overviewQuery.data?.kpis.pendingIdentityVerifications ?? 0 },
            ]}
          />
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Vetted</SidebarGroupLabel>
        <SidebarMenu>
          {vettedItems.map((item) => (
            <AdminNavLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
              badge={badgeFor(item)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Workspace</SidebarGroupLabel>
        <SidebarMenu>
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
    </>
  );
}

function AdminNavDropdown({ title, icon: Icon, isActive, badge, items }: { title: string; icon: AdminNavItem["icon"]; isActive: boolean; badge: number | null; items: Array<{ title: string; href: string; icon: AdminNavItem["icon"]; badge?: number }> }) {
  const pathname = usePathname();
  const [manuallyOpen, setOpen] = useState(false);
  const open = isActive || manuallyOpen;

  return <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible"><SidebarMenuItem><CollapsibleTrigger render={<SidebarMenuButton className="h-10 rounded-xl px-3 text-white/60 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:font-bold data-[active=true]:text-white" isActive={isActive} tooltip={title} />}><Icon /><span>{title}</span><ChevronRight className="ml-auto transition-transform group-data-[panel-open]/collapsible:rotate-90" /></CollapsibleTrigger>{badge != null ? <SidebarMenuBadge className="rounded-full bg-white/10 font-semibold text-white">{badge > 99 ? "99+" : badge}</SidebarMenuBadge> : null}<CollapsibleContent><SidebarMenuSub className="border-white/15">{items.map((item) => <SidebarMenuSubItem key={item.href} className="relative"><SidebarMenuSubButton render={<Link href={item.href} />} isActive={pathname === item.href} className="h-9 pr-9 text-white/55 hover:bg-white/10 hover:text-white data-active:bg-brand-mantis data-active:font-bold data-active:text-brand-forest"><item.icon /><span>{item.title}</span></SidebarMenuSubButton>{item.badge ? <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-brand-forest">{item.badge > 99 ? "99+" : item.badge}</span> : null}</SidebarMenuSubItem>)}</SidebarMenuSub></CollapsibleContent></SidebarMenuItem></Collapsible>;
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
