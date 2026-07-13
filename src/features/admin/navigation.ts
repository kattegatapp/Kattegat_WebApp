import {
  Building2,
  BadgeCheck,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  Link2,
  MapPinned,
  MailCheck,
  Megaphone,
  Search,
  Settings2,
  Tags,
  ToggleLeft,
  Users,
  UserCog,
  Crown,
  HandHeart,
  BriefcaseBusiness,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { adminPath } from "@/lib/admin/paths";
import type { AdminOverviewKpis } from "@/lib/api/admin";

export type AdminSettingsSectionKey =
  | "brand"
  | "metadata"
  | "links"
  | "features"
  | "operations"
  | "email";

/**
 * Sidebar badge sources. Add a key when a new queue screen ships,
 * then wire it in `resolveAdminNavBadgeCount`.
 */
export type AdminNavBadgeKey =
  | "approvals"
  | "identity"
  | "moderation"
  | "founding"
  | "vetted"
  | "recommended";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** When set, sidebar shows a live count from overview KPIs. */
  badgeKey?: AdminNavBadgeKey;
};

export type AdminSettingsNavItem = AdminNavItem & {
  section: AdminSettingsSectionKey;
};

export function resolveAdminNavBadgeCount(
  badgeKey: AdminNavBadgeKey,
  kpis: AdminOverviewKpis,
): number {
  const n = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  switch (badgeKey) {
    case "approvals":
      return n(kpis.pendingListings) + n(kpis.pendingRequirements);
    case "identity":
      return n(kpis.pendingIdentityVerifications);
    case "moderation":
      return n(kpis.pendingModerationReports);
    case "founding":
      return n(kpis.foundingQueue);
    case "vetted":
      return n(kpis.vettedQueue);
    case "recommended":
      return n(kpis.recommendedLeadsQueue);
    default:
      return 0;
  }
}

export const adminSettingsSections: AdminSettingsNavItem[] = [
  {
    title: "Brand",
    href: adminPath("/settings/brand"),
    icon: Building2,
    description: "Site name, legal name, support contacts",
    section: "brand",
  },
  {
    title: "Metadata",
    href: adminPath("/settings/metadata"),
    icon: Search,
    description: "SEO title, description, keywords, OG image",
    section: "metadata",
  },
  {
    title: "Links",
    href: adminPath("/settings/links"),
    icon: Link2,
    description: "Web, app store, legal, and social URLs",
    section: "links",
  },
  {
    title: "Features",
    href: adminPath("/settings/features"),
    icon: ToggleLeft,
    description: "Product gates and maintenance mode",
    section: "features",
  },
  {
    title: "Operations",
    href: adminPath("/settings/operations"),
    icon: MapPinned,
    description: "Defaults, limits, upgrades, and commercial values",
    section: "operations",
  },
  {
    title: "Email",
    href: adminPath("/settings/email"),
    icon: MailCheck,
    description: "SMTP readiness and delivery testing",
    section: "email",
  },
];

/**
 * Sidebar destinations.
 * Account / password lives in the header avatar menu only.
 */
export const adminNavItems: AdminNavItem[] = [
  {
    title: "Operations",
    href: adminPath(),
    icon: LayoutDashboard,
    description: "KPIs, queues, and system gates",
  },
  {
    title: "Approvals",
    href: adminPath("/approvals"),
    icon: ClipboardCheck,
    description: "Listing and requirement approval queues",
    badgeKey: "approvals",
  },
  {
    title: "Waitlist",
    href: adminPath("/waitlist"),
    icon: ListChecks,
    description: "People awaiting platform access",
  },
  {
    title: "Recommended Leads",
    href: adminPath("/recommended-leads"),
    icon: HandHeart,
    description: "Member referrals for the team to qualify",
    badgeKey: "recommended",
  },
  {
    title: "Founding Members",
    href: adminPath("/founding-members"),
    icon: Crown,
    description: "Review founding contributor applications",
    badgeKey: "founding",
  },
  {
    title: "Listings",
    href: adminPath("/listings"),
    icon: Building2,
    description: "Search listings and manage availability",
  },
  {
    title: "Requirements",
    href: adminPath("/requirements"),
    icon: BriefcaseBusiness,
    description: "Search buyer requirements and manage availability",
  },
  {
    title: "Users",
    href: adminPath("/users"),
    icon: UserCog,
    description: "Search and manage platform accounts",
  },
  {
    title: "Identity Verification",
    href: adminPath("/identity-verifications"),
    icon: BadgeCheck,
    description: "Review seller identity applications",
    badgeKey: "identity",
  },
  {
    title: "Settings",
    href: adminPath("/settings"),
    icon: Settings2,
    description: "Brand, features, and operations config",
  },
  {
    title: "Communications",
    href: adminPath("/communications"),
    icon: Megaphone,
    description: "Send targeted push and email announcements",
  },
  {
    title: "Pricing",
    href: adminPath("/pricing"),
    icon: Tags,
    description: "Seller plan feature limits",
  },
  {
    title: "Control Room",
    href: adminPath("/team"),
    icon: Users,
    description: "People who can use this console",
  },
];

export function isSettingsPath(pathname: string) {
  const settingsRoot = adminPath("/settings");
  return pathname === settingsRoot || pathname.startsWith(`${settingsRoot}/`);
}

export function getAdminSettingsSection(pathname: string): AdminSettingsNavItem | undefined {
  return adminSettingsSections.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export function getAdminNavItem(pathname: string): AdminNavItem | undefined {
  const overview = adminPath();

  if (pathname === overview) {
    return adminNavItems.find((item) => item.href === overview);
  }

  if (isSettingsPath(pathname)) {
    return adminNavItems.find((item) => item.href === adminPath("/settings"));
  }

  if (pathname.startsWith(adminPath("/account"))) {
    return {
      title: "Account",
      href: adminPath("/account"),
      icon: KeyRound,
      description: "Your password",
    };
  }

  return adminNavItems.find((item) => item.href !== overview && pathname.startsWith(item.href));
}

export type AdminBreadcrumb = { title: string; href?: string };

export function getAdminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  const root = adminPath();
  const routes: Array<[string, AdminBreadcrumb[]]> = [
    [adminPath("/approvals/listings"), [{ title: "Approvals", href: adminPath("/approvals") }, { title: "Listing approvals" }]],
    [adminPath("/approvals/requirements"), [{ title: "Approvals", href: adminPath("/approvals") }, { title: "Requirement approvals" }]],
    [adminPath("/settings/brand"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Brand" }]],
    [adminPath("/settings/metadata"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Metadata" }]],
    [adminPath("/settings/links"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Links" }]],
    [adminPath("/settings/features"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Features" }]],
    [adminPath("/settings/operations"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Operations" }]],
    [adminPath("/settings/email"), [{ title: "Settings", href: adminPath("/settings/brand") }, { title: "Email" }]],
  ];

  if (pathname.startsWith(`${adminPath("/users")}/`)) {
    return [{ title: "Admin", href: root }, { title: "Users", href: adminPath("/users") }, { title: "User profile" }];
  }

  const child = routes.find(([path]) => pathname === path);
  if (child) return [{ title: "Admin", href: root }, ...child[1]];

  const current = getAdminNavItem(pathname);
  return [{ title: "Admin", href: root }, ...(current && pathname !== root ? [{ title: current.title }] : [])];
}
