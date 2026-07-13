export { AdminShell } from "@/features/admin/shell/shell";
export { AdminAppSidebar } from "@/features/admin/shell/app-sidebar";
export { AdminHeader } from "@/features/admin/shell/header";
export { AdminFooter } from "@/features/admin/shell/footer";
export { AdminNavMain } from "@/features/admin/shell/nav-main";

export { AdminLoginForm } from "@/features/admin/auth/login-form";
export { AdminLoginAtmosphere } from "@/features/admin/auth/login-atmosphere";

export { AdminOverview } from "@/features/admin/overview/overview-page";
export { AdminApprovalsPage } from "@/features/admin/approvals/approvals-page";
export { AdminPricingForm } from "@/features/admin/pricing/pricing-form";
export { AdminTeamPage } from "@/features/admin/team/team-page";
export { AdminAccountPage } from "@/features/admin/account/account-page";

export { AdminSettingsPage } from "@/features/admin/settings/settings-page";
export { SettingsBrandForm } from "@/features/admin/settings/brand-form";
export { SettingsMetadataForm } from "@/features/admin/settings/metadata-form";
export { SettingsLinksForm } from "@/features/admin/settings/links-form";
export { SettingsFeaturesForm } from "@/features/admin/settings/features-form";
export { SettingsOperationsForm } from "@/features/admin/settings/operations-form";

export {
  adminNavItems,
  adminSettingsSections,
  getAdminNavItem,
  getAdminSettingsSection,
  isSettingsPath,
  resolveAdminNavBadgeCount,
  type AdminNavBadgeKey,
  type AdminNavItem,
  type AdminSettingsNavItem,
  type AdminSettingsSectionKey,
} from "@/features/admin/navigation";
