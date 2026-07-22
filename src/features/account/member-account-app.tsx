"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { MemberGlassCanvas } from "@/features/account/account-glass";
import { MemberAccountShell } from "@/features/account/member-account-shell";
import { AccountBrowseListingsView } from "@/features/account/account-browse-listings-view";
import { AccountHomeView } from "@/features/account/account-home-view";
import { AccountChatView } from "@/features/account/account-chat-view";
import { AccountApplicationsView } from "@/features/account/account-applications-view";
import { AccountVerificationView } from "@/features/account/account-verification-view";
import {
  AccountCategoriesView,
  AccountDashboardView,
  AccountMembershipView,
  AccountNotificationsView,
} from "@/features/account/member-account-views";
import {
  AccountMyListingsView,
  AccountMyRequirementsView,
  AccountOpenRequirementsView,
  AccountSavedView,
} from "@/features/account/account-library-views";
import { AccountRecommendView } from "@/features/account/account-recommend-view";
import { AccountReferralsView } from "@/features/account/account-referrals-view";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import type { AccountConversation } from "@/lib/api/account-chat";
import type { AccountHomeFeed } from "@/lib/api/account-home";
import type { AccountNotificationsState } from "@/lib/api/account-notifications";
import type { AccountDashboard } from "@/lib/api/account";
import {
  defaultMemberIdentity,
  readStoredMemberIdentity,
  writeStoredMemberIdentity,
} from "@/lib/auth/member-identity";
import { writeBrowseResume } from "@/lib/auth/browse-resume";
import { logoutMember } from "@/lib/api/auth";
import { fetchAccountConversations } from "@/lib/api/account-chat";
import { canAccessMemberView, safeMemberView } from "@/lib/auth/member-access";
import { cn } from "@/lib/utils";

type MemberAccountAppProps = {
  dashboard: AccountDashboard;
  homeFeed: AccountHomeFeed;
  notifications: AccountNotificationsState;
  initialView?: AccountViewId;
  initialConversationId?: string;
  initialBrowseQuery?: string;
  initialBrowseCategoryId?: string;
};

function identityForConversation(
  thread: AccountConversation,
  userId: string,
): AccountIdentity | null {
  if (thread.buyerId === userId) return "buyer";
  if (thread.sellerId === userId) return "seller";
  return null;
}

function syncAccountQueryParams(input: {
  view: AccountViewId;
  browseQuery?: string;
  browseCategoryId?: string;
}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const { view, browseQuery, browseCategoryId } = input;

  if (view === "home") url.searchParams.delete("view");
  else url.searchParams.set("view", view);

  if (view === "browse" && browseQuery?.trim()) {
    url.searchParams.set("q", browseQuery.trim());
  } else {
    url.searchParams.delete("q");
  }

  if (view === "browse" && browseCategoryId?.trim()) {
    url.searchParams.set("categoryId", browseCategoryId.trim());
  } else {
    url.searchParams.delete("categoryId");
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState(null, "", next);
  }
}

export function MemberAccountApp({
  dashboard,
  homeFeed,
  notifications,
  initialView = "home",
  initialConversationId,
  initialBrowseQuery = "",
  initialBrowseCategoryId = "",
}: MemberAccountAppProps) {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<AccountViewId>(initialView);
  const [browseQuery, setBrowseQuery] = useState(initialBrowseQuery);
  const [browseCategoryId, setBrowseCategoryId] = useState(initialBrowseCategoryId);
  const [listingEditorOpen, setListingEditorOpen] = useState(false);
  const [requirementEditorOpen, setRequirementEditorOpen] = useState(false);

  const defaultIdentity = useMemo<AccountIdentity>(
    () => defaultMemberIdentity(dashboard.user.sid, dashboard.user.bid),
    [dashboard.user.bid, dashboard.user.sid],
  );

  const [identity, setIdentity] = useState<AccountIdentity>(defaultIdentity);

  const deepLinkConversationsQuery = useQuery({
    queryKey: ["account", "chat", "conversations"],
    queryFn: fetchAccountConversations,
    enabled: Boolean(initialConversationId),
  });

  const conversationsQuery = useQuery({
    queryKey: ["account", "chat", "conversations"],
    queryFn: fetchAccountConversations,
  });

  const chatUnreadCount = useMemo(() => {
    const threads = conversationsQuery.data ?? [];
    return threads.filter((thread) => {
      if (!thread.lastMessageSenderId || thread.lastMessageSenderId === dashboard.user.id) return false;
      if (identity === "seller") return thread.sellerId === dashboard.user.id;
      if (identity === "buyer") return thread.buyerId === dashboard.user.id;
      return true;
    }).length;
  }, [conversationsQuery.data, dashboard.user.id, identity]);

  const deepLinkIdentity = useMemo<AccountIdentity | null>(() => {
    if (!initialConversationId) return null;
    const thread = deepLinkConversationsQuery.data?.find((item) => item.id === initialConversationId);
    if (!thread) return null;
    return identityForConversation(thread, dashboard.user.id);
  }, [initialConversationId, deepLinkConversationsQuery.data, dashboard.user.id]);

  useEffect(() => {
    const stored = readStoredMemberIdentity(dashboard.user.sid, dashboard.user.bid);
    const next =
      initialConversationId && deepLinkIdentity
        ? deepLinkIdentity
        : stored ?? defaultIdentity;
    const timer = window.setTimeout(() => {
      setIdentity(next);
      setActiveView((current) => safeMemberView(current, next));
      writeStoredMemberIdentity(next);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    dashboard.user.bid,
    dashboard.user.sid,
    deepLinkIdentity,
    defaultIdentity,
    initialConversationId,
  ]);

  useEffect(() => {
    syncAccountQueryParams({
      view: activeView,
      browseQuery: activeView === "browse" ? browseQuery : undefined,
      browseCategoryId: activeView === "browse" ? browseCategoryId : undefined,
    });
  }, [activeView, browseQuery, browseCategoryId]);

  function handleIdentityChange(next: AccountIdentity) {
    if (next === "seller" && !dashboard.user.sid) return;
    if (next === "buyer" && !dashboard.user.bid) return;
    setIdentity(next);
    setActiveView((current) => safeMemberView(current, next));
    writeStoredMemberIdentity(next);
    // Mirror mobile: identity is UX-only, but cached account data must refresh on switch.
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  }

  function handleViewChange(next: AccountViewId) {
    if (next === "browse") setBrowseCategoryId("");
    setActiveView(safeMemberView(next, identity));
  }

  function handleMarketplaceSearch(query: string) {
    setBrowseQuery(query);
    setBrowseCategoryId("");
    writeBrowseResume({ q: query });
    setActiveView("browse");
  }

  function handleBrowseCategory(categoryId: string) {
    setBrowseCategoryId(categoryId);
    setBrowseQuery("");
    writeBrowseResume({ categoryId });
    setActiveView("browse");
  }

  function handleBrowseQueryChange(query: string) {
    setBrowseQuery(query);
    writeBrowseResume({ q: query, categoryId: browseCategoryId || undefined });
  }

  function handleContinueBrowse(input: { q?: string; categoryId?: string }) {
    setBrowseQuery(input.q ?? "");
    setBrowseCategoryId(input.categoryId ?? "");
    writeBrowseResume(input);
    setActiveView("browse");
  }

  const logout = useMutation({
    mutationFn: logoutMember,
    onSuccess: () => {
      void queryClient.clear();
      window.location.href = "/login";
    },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MemberAccountShell
        dashboard={dashboard}
        activeView={activeView}
        onViewChange={handleViewChange}
        onMarketplaceSearch={handleMarketplaceSearch}
        marketplaceSearchQuery={activeView === "browse" ? browseQuery : ""}
        identity={identity}
        notifications={notifications}
        chatUnreadCount={chatUnreadCount}
        onIdentityChange={handleIdentityChange}
        onSignOut={() => logout.mutate()}
        signingOut={logout.isPending}
        listingEditorOpen={listingEditorOpen}
        onListingEditorOpenChange={setListingEditorOpen}
        requirementEditorOpen={requirementEditorOpen}
        onRequirementEditorOpenChange={setRequirementEditorOpen}
      >
        {activeView === "chat" ? (
          <AccountChatView
            dashboard={dashboard}
            identity={identity}
            initialConversationId={initialConversationId}
          />
        ) : (
        <MemberGlassCanvas>
        <div
          key={activeView}
          className={cn(
            "account-view mx-auto w-full",
            activeView === "home" || activeView === "browse" ? "max-w-6xl" : "max-w-5xl",
          )}
        >
          {activeView === "home" ? (
            <AccountHomeView
              dashboard={dashboard}
              homeFeed={homeFeed}
              identity={identity}
              chatUnreadCount={chatUnreadCount}
              notifications={notifications.items}
              onNavigate={handleViewChange}
              onCreateListing={() => setListingEditorOpen(true)}
              onCreateRequirement={() => setRequirementEditorOpen(true)}
              onContinueBrowse={handleContinueBrowse}
            />
          ) : null}
          {activeView === "browse" ? (
            <AccountBrowseListingsView
              initialQuery={browseQuery}
              initialCategoryId={browseCategoryId}
              onQueryChange={handleBrowseQueryChange}
            />
          ) : null}
          {activeView === "categories" ? (
            <AccountCategoriesView onBrowseCategory={handleBrowseCategory} />
          ) : null}
          {activeView === "requirements" ? (
            <AccountOpenRequirementsView canApply={identity === "seller" && Boolean(dashboard.user.sid)} />
          ) : null}
          {activeView === "saved" && canAccessMemberView(activeView, identity) ? <AccountSavedView /> : null}
          {activeView === "my-listings" && canAccessMemberView(activeView, identity) ? <AccountMyListingsView dashboard={dashboard} /> : null}
          {activeView === "my-requirements" && canAccessMemberView(activeView, identity) ? <AccountMyRequirementsView dashboard={dashboard} /> : null}
          {activeView === "applications" ? <AccountApplicationsView identity={identity} /> : null}
          {activeView === "verification" && canAccessMemberView(activeView, identity) ? (
            <AccountVerificationView />
          ) : null}
          {activeView === "referrals" ? <AccountReferralsView dashboard={dashboard} /> : null}
          {activeView === "recommend" ? <AccountRecommendView /> : null}
          {activeView === "notifications" ? (
            <AccountNotificationsView
              identity={identity}
              notifications={notifications.items}
              unreadCount={notifications.unreadCount}
            />
          ) : null}
          {activeView === "dashboard" ? <AccountDashboardView dashboard={dashboard} identity={identity} /> : null}
          {activeView === "membership" && canAccessMemberView(activeView, identity) ? <AccountMembershipView dashboard={dashboard} /> : null}
        </div>
        </MemberGlassCanvas>
        )}
      </MemberAccountShell>
    </div>
  );
}
