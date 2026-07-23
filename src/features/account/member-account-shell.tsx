"use client";

import {
  BriefcaseBusiness,
  ClipboardList,
  FileCheck2,
  Gift,
  Grid2x2,
  Heart,
  Home,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
  AccountAvatar,
  accountDisplayName,
} from "@/features/account/account-shared";
import { AccountNotificationsMenu } from "@/features/account/account-notifications-menu";
import { AccountProfileMenu } from "@/features/account/account-profile-menu";
import { ListingEditorDialog } from "@/features/account/listing-editor-dialog";
import { RequirementEditorDialog } from "@/features/account/requirement-editor-dialog";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import { HeaderProgressLine } from "@/components/header-progress-line";
import type { AccountDashboard } from "@/lib/api/account";
import type { AccountNotificationsState } from "@/lib/api/account-notifications";
import { cn } from "@/lib/utils";

type NavItem = {
  id: AccountViewId;
  label: string;
  icon: typeof Home;
  badge?: number;
  sellerOnly?: boolean;
  buyerOnly?: boolean;
};

const MARKETPLACE_NAV: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "browse", label: "Browse listings", icon: Search },
  { id: "categories", label: "Categories", icon: Grid2x2 },
  { id: "requirements", label: "Browse requirements", icon: ClipboardList },
  { id: "saved", label: "Saved", icon: Heart, buyerOnly: true },
  { id: "my-listings", label: "My listings", icon: BriefcaseBusiness, sellerOnly: true },
  { id: "my-requirements", label: "My requirements", icon: Megaphone, buyerOnly: true },
  { id: "applications", label: "Applications", icon: FileCheck2 },
  {
    id: "jobs-bookings",
    label: "Jobs & Bookings",
    icon: BriefcaseBusiness,
  },
  { id: "seller-tools", label: "Seller Tools", icon: ReceiptText, sellerOnly: true },
  { id: "verification", label: "Identity verification", icon: ShieldCheck, sellerOnly: true },
];

const GROWTH_NAV: NavItem[] = [
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "recommend", label: "Recommend & earn", icon: Megaphone },
];

const WORKSPACE_NAV: NavItem[] = [
  { id: "chat", label: "Chat Room", icon: MessageCircle },
];

type MemberAccountShellProps = {
  dashboard: AccountDashboard;
  activeView: AccountViewId;
  onViewChange: (view: AccountViewId) => void;
  onMarketplaceSearch?: (query: string) => void;
  marketplaceSearchQuery?: string;
  identity: AccountIdentity;
  notifications: AccountNotificationsState;
  chatUnreadCount?: number;
  onIdentityChange: (identity: AccountIdentity) => void;
  onSignOut: () => void;
  signingOut?: boolean;
  listingEditorOpen?: boolean;
  onListingEditorOpenChange?: (open: boolean) => void;
  requirementEditorOpen?: boolean;
  onRequirementEditorOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function MemberAccountShell({
  dashboard,
  activeView,
  onViewChange,
  onMarketplaceSearch,
  marketplaceSearchQuery = "",
  identity,
  notifications,
  chatUnreadCount = 0,
  onIdentityChange,
  onSignOut,
  signingOut,
  listingEditorOpen: listingEditorOpenProp,
  onListingEditorOpenChange,
  requirementEditorOpen: requirementEditorOpenProp,
  onRequirementEditorOpenChange,
  children,
}: MemberAccountShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listingEditorOpenInternal, setListingEditorOpenInternal] = useState(false);
  const [requirementEditorOpenInternal, setRequirementEditorOpenInternal] = useState(false);
  const listingEditorOpen = listingEditorOpenProp ?? listingEditorOpenInternal;
  const requirementEditorOpen = requirementEditorOpenProp ?? requirementEditorOpenInternal;
  const setListingEditorOpen = onListingEditorOpenChange ?? setListingEditorOpenInternal;
  const setRequirementEditorOpen =
    onRequirementEditorOpenChange ?? setRequirementEditorOpenInternal;
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const { user, sellerProfile, listings } = dashboard;

  const displayName = accountDisplayName({
    displayName: sellerProfile?.displayName,
    businessName: user.businessName,
    username: user.username,
    email: user.email,
  });

  const avatarUrl = user.avatarUrl || sellerProfile?.avatarUrl;
  const publicId = identity === "seller" ? user.sid : user.bid;
  const marketplaceNav = MARKETPLACE_NAV.map((item) =>
    item.id === "applications"
      ? { ...item, label: identity === "seller" ? "My applications" : "Applicants" }
      : item,
  );
  const workspaceNav = WORKSPACE_NAV.map((item) =>
    item.id === "chat" ? { ...item, badge: chatUnreadCount > 0 ? chatUnreadCount : undefined } : item,
  );

  function selectView(view: AccountViewId) {
    setMobileOpen(false);
    onViewChange(view);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sidebarProps = {
    activeView,
    displayName,
    avatarUrl,
    publicId,
    user,
    identity,
    marketplaceItems: marketplaceNav,
    workspaceItems: workspaceNav,
    growthItems: GROWTH_NAV,
    signingOut,
    onSelectView: selectView,
    onIdentityChange,
    onSignOut,
  };

  return (
    <div className="member-workspace relative flex h-full min-h-0 flex-1 overflow-hidden text-brand-forest" aria-busy={signingOut}>
      {signingOut ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-brand-forest/10 bg-white px-5 py-3.5 shadow-lg">
            <Spinner className="size-5 text-brand-mantis" />
            <span className="text-sm font-bold text-brand-forest">Signing you out…</span>
          </div>
        </div>
      ) : null}

      {/* Mobile nav — only mounted in sheet, opened via hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
          side="left"
          className="account-mobile-nav flex h-dvh max-h-dvh w-[min(88vw,300px)] flex-col gap-0 overflow-hidden border-brand-forest/10 bg-white p-0 sm:max-w-[300px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Account navigation</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <AccountSidebarContent {...sidebarProps} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — fixed, never scrolls with main content */}
      <div className="account-shell-body flex min-h-0 w-full flex-1 overflow-hidden">
        <aside className="account-sidebar member-sidebar-glass hidden min-h-0 shrink-0 lg:flex">
          <AccountSidebarContent {...sidebarProps} />
        </aside>

        <div className="account-layout-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="account-topbar member-header-glass relative">
          <HeaderProgressLine />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-lg border border-brand-forest/10 text-brand-forest hover:bg-brand-forest/5 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="account-search flex min-w-0 flex-1 items-center gap-2">
            <Search className="size-4 shrink-0 text-muted-foreground max-sm:hidden" />
            <Input
              type="search"
              placeholder="Search listings"
              defaultValue={marketplaceSearchQuery}
              key={marketplaceSearchQuery}
              className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:h-9"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const q = event.currentTarget.value.trim();
                if (onMarketplaceSearch) {
                  onMarketplaceSearch(q);
                  return;
                }
                window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
              }}
            />
          </div>

          <AccountNotificationsMenu
            identity={identity}
            notifications={notifications}
            onViewAll={() => selectView("notifications")}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  className="size-9 shrink-0 rounded-lg border border-brand-forest/12 bg-white text-brand-forest hover:bg-brand-forest/5 sm:size-10"
                  aria-label="Create"
                />
              }
            >
              <Plus className="size-4 sm:size-5" strokeWidth={2.4} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[min(100vw-2rem,262px)] rounded-2xl border-brand-forest/10 bg-white p-2 text-brand-forest"
            >
              <DropdownMenuGroup>
                {identity === "seller" && user.sid ? (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl p-3 focus:bg-brand-forest/5"
                    onClick={() => setListingEditorOpen(true)}
                  >
                    <div className="flex gap-3">
                      <span className="grid size-[34px] place-items-center rounded-[10px] bg-brand-forest/5 text-brand-forest">
                        <BriefcaseBusiness className="size-4" />
                      </span>
                      <div>
                        <p className="text-[13.5px] font-bold">List your service</p>
                        <p className="text-xs leading-5 text-brand-forest/65">
                          Create a draft listing and submit for review when ready.
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ) : null}
                {identity === "buyer" && user.bid ? (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl p-3 focus:bg-brand-forest/5"
                    onClick={() => setRequirementEditorOpen(true)}
                  >
                    <div className="flex gap-3">
                      <span className="grid size-[34px] place-items-center rounded-[10px] bg-brand-forest/5 text-brand-forest">
                        <ClipboardList className="size-4" />
                      </span>
                      <div>
                        <p className="text-[13.5px] font-bold">Post a requirement</p>
                        <p className="text-xs leading-5 text-brand-forest/65">
                          Post what you need — sellers apply directly inside Kattegat.
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AccountProfileMenu
            displayName={displayName}
            email={user.email}
            avatarUrl={avatarUrl}
            publicId={publicId}
            identity={identity}
            hasSellerId={Boolean(user.sid)}
            signingOut={signingOut}
            onOpenSettings={() => selectView("dashboard")}
            onOpenMembership={identity === "seller" ? () => selectView("membership") : undefined}
            onOpenReferrals={() => selectView("referrals")}
            onOpenRecommend={() => selectView("recommend")}
            onSignOut={onSignOut}
          />
        </header>

        <div
          ref={mainScrollRef}
          className={cn(
            "account-main-scroll",
            activeView === "chat" && "account-main-scroll--chat",
          )}
        >
          <main
            className={cn(
              "account-main",
              activeView === "chat"
                ? "account-main--chat"
                : "px-3 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8",
            )}
          >
            {children}
          </main>
        </div>

        {activeView !== "chat" ? (
        <footer className="member-footer-glass shrink-0 border-t border-brand-forest/10 px-3 py-4 text-xs text-muted-foreground sm:px-6 sm:py-5 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <span>Kattegat.app — UAE hospitality &amp; entertainment</span>
            <span className="hidden sm:inline">All bookings begin and end inside Kattegat</span>
          </div>
        </footer>
        ) : null}
      </div>
      </div>

      <ListingEditorDialog
        open={listingEditorOpen}
        onOpenChange={setListingEditorOpen}
        mode="create"
        sellerTier={sellerProfile?.tier}
        listingCount={listings.length}
      />
      <RequirementEditorDialog
        open={requirementEditorOpen}
        onOpenChange={setRequirementEditorOpen}
        mode="create"
      />
    </div>
  );
}

type AccountSidebarContentProps = {
  activeView: AccountViewId;
  displayName: string;
  avatarUrl?: string | null;
  publicId?: string | null;
  user: AccountDashboard["user"];
  identity: AccountIdentity;
  marketplaceItems: NavItem[];
  workspaceItems: NavItem[];
  growthItems: NavItem[];
  signingOut?: boolean;
  onSelectView: (view: AccountViewId) => void;
  onIdentityChange: (identity: AccountIdentity) => void;
  onSignOut: () => void;
};

function AccountSidebarContent({
  activeView,
  displayName,
  avatarUrl,
  publicId,
  user,
  identity,
  marketplaceItems,
  workspaceItems,
  growthItems,
  signingOut,
  onSelectView,
  onIdentityChange,
  onSignOut,
}: AccountSidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:p-0 lg:pb-0">
      <Link
        href="/account"
        className="flex shrink-0 items-center gap-3 px-2.5 pb-5 pt-0.5"
        onClick={() => onSelectView("home")}
      >
        <span className="grid size-[38px] place-items-center rounded-xl border border-brand-forest/10 bg-white">
          <Image src="/brand/logo/brandmark-main.svg" alt="" width={22} height={22} />
        </span>
        <span className="text-lg font-extrabold tracking-[-0.01em] text-brand-forest">
          Kattegat<span className="font-bold text-brand-forest/70">.app</span>
        </span>
      </Link>

      <div className="account-sidebar-nav min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:thin]">
        <NavGroup label="Marketplace" items={marketplaceItems} active={activeView} identity={identity} onSelect={onSelectView} />
        <NavGroup label="Growth" items={growthItems} active={activeView} identity={identity} onSelect={onSelectView} />
        <NavGroup label="Workspace" items={workspaceItems} active={activeView} identity={identity} onSelect={onSelectView} />
      </div>

      <Card className="mt-3 shrink-0 gap-0 border-white/70 bg-white/45 p-3 shadow-none backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2.5">
          <AccountAvatar name={displayName} imageUrl={avatarUrl} className="size-9 rounded-full text-sm" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold leading-tight text-brand-forest">{displayName}</p>
            <p className="truncate text-[10.5px] tracking-[0.03em] text-muted-foreground">
              {publicId ?? user.email}
            </p>
          </div>
        </div>

        {user.sid && user.bid ? (
          <div className="relative flex gap-1 rounded-[11px] border border-brand-forest/10 bg-[#f7f9f8] p-1">
            <span
              className={cn(
                "pointer-events-none absolute bottom-1 top-1 w-[calc(50%-6px)] rounded-lg bg-white shadow-sm transition-all duration-200",
                identity === "seller" ? "left-[calc(50%+2px)]" : "left-1",
              )}
            />
            <button
              type="button"
              className={cn(
                "relative z-10 flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors",
                identity === "buyer" ? "text-brand-forest" : "text-brand-forest/55",
                !user.bid && "cursor-not-allowed opacity-50",
              )}
              disabled={!user.bid}
              onClick={() => user.bid && onIdentityChange("buyer")}
            >
              Buyer
            </button>
            <button
              type="button"
              className={cn(
                "relative z-10 flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors",
                identity === "seller" ? "text-brand-forest" : "text-brand-forest/55",
                !user.sid && "cursor-not-allowed opacity-50",
              )}
              disabled={!user.sid}
              onClick={() => user.sid && onIdentityChange("seller")}
            >
              Seller
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-forest/55">
              {user.sid ? "Seller mode" : "Buyer mode"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-lg border-brand-forest/10 text-[11px] font-bold"
              onClick={() => onSelectView("dashboard")}
            >
              {user.sid ? "Add buyer identity" : "Add seller identity"}
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full rounded-xl border-brand-forest/10 text-xs font-bold"
          disabled={signingOut}
          aria-busy={signingOut}
          onClick={onSignOut}
        >
          {signingOut ? <Spinner className="size-3.5" /> : <LogOut className="size-3.5" />}
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </Card>
    </div>
  );
}

function NavGroup({
  label,
  items,
  active,
  identity,
  onSelect,
}: {
  label: string;
  items: NavItem[];
  active: AccountViewId;
  identity: AccountIdentity;
  onSelect: (id: AccountViewId) => void;
}) {
  const visible = items.filter((item) => {
    if (item.sellerOnly && identity !== "seller") return false;
    if (item.buyerOnly && identity !== "buyer") return false;
    return true;
  });
  if (visible.length === 0) return null;

  return (
    <>
      <p className="mb-1.5 mt-4 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground first:mt-0">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14.5px] font-medium transition",
                isActive
                  ? "bg-brand-forest/5 font-semibold text-brand-forest"
                  : "text-brand-forest/65 hover:bg-brand-forest/[0.03] hover:text-brand-forest",
              )}
            >
              <Icon className="size-[19px] shrink-0" />
              <span>{item.label}</span>
              {item.badge ? (
                <Badge variant="secondary" className="ml-auto bg-brand-forest/5 text-brand-forest">
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
}
