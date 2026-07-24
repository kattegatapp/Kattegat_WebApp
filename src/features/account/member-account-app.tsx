"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { MemberGlassCanvas } from "@/features/account/account-glass";
import { MemberAccountShell } from "@/features/account/member-account-shell";
import { AccountBrowseListingsView } from "@/features/account/account-browse-listings-view";
import { AccountHomeView } from "@/features/account/account-home-view";
import { AccountChatView } from "@/features/account/account-chat-view";
import { AccountApplicationsView } from "@/features/account/account-applications-view";
import { AccountJobsBookingsView } from "@/features/account/account-jobs-bookings-view";
import { AccountSellerToolsView } from "@/features/account/account-seller-tools-view";
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
import { AccountEarningsView } from "@/features/account/account-earnings-view";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import type { AccountConversation } from "@/lib/api/account-chat";
import type { AccountHomeFeed } from "@/lib/api/account-home";
import type { AccountNotification, AccountNotificationsState } from "@/lib/api/account-notifications";
import type { AccountDashboard } from "@/lib/api/account";
import {
  defaultMemberIdentity,
  readStoredMemberIdentity,
  writeStoredMemberIdentity,
} from "@/lib/auth/member-identity";
import { writeBrowseResume } from "@/lib/auth/browse-resume";
import { isConversationUnread } from "@/lib/chat/chat-read-store";
import { useChatLastViewedAt } from "@/hooks/use-chat-read";
import { logoutMember } from "@/lib/api/auth";
import { fetchAccountConversations } from "@/lib/api/account-chat";
import {
  canAccessMemberView,
  requiredMemberIdentity,
  safeMemberView,
} from "@/lib/auth/member-access";
import {
  canAccessFeatureView,
  type AccountFeatureFlags,
} from "@/lib/chat/chat-access";
import type { VipSupportChannels } from "@/lib/vip-support";
import { cn } from "@/lib/utils";

type MemberAccountAppProps = {
  dashboard: AccountDashboard;
  homeFeed: AccountHomeFeed;
  notifications: AccountNotificationsState;
  features: AccountFeatureFlags;
  /** WhatsApp + email channels — null when VIP Support is off or unconfigured. */
  vipSupportChannels?: VipSupportChannels | null;
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
  features,
  vipSupportChannels = null,
  initialView = "home",
  initialConversationId,
  initialBrowseQuery = "",
  initialBrowseCategoryId = "",
}: MemberAccountAppProps) {
  const queryClient = useQueryClient();
  const safeInitialView = canAccessFeatureView(initialView, features) ? initialView : "home";
  const [activeView, setActiveView] = useState<AccountViewId>(safeInitialView);
  const [browseQuery, setBrowseQuery] = useState(initialBrowseQuery);
  const [browseCategoryId, setBrowseCategoryId] = useState(initialBrowseCategoryId);
  const [listingEditorOpen, setListingEditorOpen] = useState(false);
  const [requirementEditorOpen, setRequirementEditorOpen] = useState(false);
  const [accessNotice, setAccessNotice] = useState<"buyer" | "seller" | null>(null);

  const defaultIdentity = useMemo<AccountIdentity>(
    () => defaultMemberIdentity(dashboard.user.sid, dashboard.user.bid),
    [dashboard.user.bid, dashboard.user.sid],
  );

  const [identity, setIdentity] = useState<AccountIdentity>(defaultIdentity);
  const lastViewedAt = useChatLastViewedAt();

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
      if (identity === "seller" && thread.sellerId !== dashboard.user.id) return false;
      if (identity === "buyer" && thread.buyerId !== dashboard.user.id) return false;
      return isConversationUnread({
        conversationId: thread.id,
        lastMessageAt: thread.lastMessageAt,
        lastMessageSenderId: thread.lastMessageSenderId,
        myUserId: dashboard.user.id,
        lastViewedAt,
      });
    }).length;
  }, [conversationsQuery.data, dashboard.user.id, identity, lastViewedAt]);

  const deepLinkIdentity = useMemo<AccountIdentity | null>(() => {
    if (!initialConversationId) return null;
    const thread = deepLinkConversationsQuery.data?.find((item) => item.id === initialConversationId);
    if (!thread) return null;
    return identityForConversation(thread, dashboard.user.id);
  }, [initialConversationId, deepLinkConversationsQuery.data, dashboard.user.id]);

  // Always-on, app-shell-level realtime — the chat nav badge and notification bell both
  // need to update live no matter which page is active, not just while the chat view
  // itself happens to be mounted (that view has its own separate subscription for the
  // open thread's messages). Dynamic imports match `account-chat-view.tsx`'s existing
  // pattern for these "use client"-only websocket modules.
  useEffect(() => {
    const userId = dashboard.user.id;
    let active = true;
    let messagesChannel: unknown = null;
    let notificationsChannel: unknown = null;

    void (async () => {
      try {
        const chatRealtime = await import("@/lib/chat/chat.realtime");
        messagesChannel = await chatRealtime.subscribeToMyMessages(() => {
          if (!active) return;
          void queryClient.invalidateQueries({ queryKey: ["account", "chat", "conversations"] });
        });
      } catch {
        // Realtime optional — refetch-on-focus still covers it.
      }
      try {
        const notificationsRealtime = await import("@/lib/notifications/notifications.realtime");
        notificationsChannel = await notificationsRealtime.subscribeToAccountNotifications(
          userId,
          (notification) => {
            if (!active) return;
            queryClient.setQueryData<{ count: number }>(
              ["account", "notifications", "unread-count"],
              (current) => ({ count: (current?.count ?? 0) + 1 }),
            );
            queryClient.setQueryData<AccountNotification[]>(
              ["account", "notifications"],
              (current) => {
                const existing = current ?? [];
                if (existing.some((item) => item.id === notification.id)) return existing;
                return [notification, ...existing];
              },
            );
          },
        );
      } catch {
        // Realtime optional.
      }
    })();

    return () => {
      active = false;
      void import("@/lib/chat/chat.realtime").then((realtime) =>
        realtime.unsubscribeRealtime(messagesChannel as never),
      );
      void import("@/lib/notifications/notifications.realtime").then((realtime) =>
        realtime.unsubscribeAccountRealtime(notificationsChannel as never),
      );
    };
  }, [dashboard.user.id, queryClient]);

  useEffect(() => {
    const stored = readStoredMemberIdentity(dashboard.user.sid, dashboard.user.bid);
    const requiredIdentity = requiredMemberIdentity(initialView);
    const hasRequiredIdentity =
      requiredIdentity === "seller"
        ? Boolean(dashboard.user.sid)
        : requiredIdentity === "buyer"
          ? Boolean(dashboard.user.bid)
          : true;
    const next =
      initialConversationId && deepLinkIdentity
        ? deepLinkIdentity
        : requiredIdentity && hasRequiredIdentity
          ? requiredIdentity
        : stored ?? defaultIdentity;
    const timer = window.setTimeout(() => {
      setIdentity(next);
      if (requiredIdentity && !hasRequiredIdentity) {
        setAccessNotice(requiredIdentity);
        setActiveView("dashboard");
      } else if (!canAccessFeatureView(initialView, features)) {
        setAccessNotice(null);
        setActiveView("home");
      } else {
        setAccessNotice(null);
        setActiveView((current) => safeMemberView(current, next));
      }
      writeStoredMemberIdentity(next);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    dashboard.user.bid,
    dashboard.user.sid,
    initialView,
    deepLinkIdentity,
    defaultIdentity,
    initialConversationId,
    features,
  ]);

  const displayView = canAccessFeatureView(activeView, features) ? activeView : "home";

  useEffect(() => {
    syncAccountQueryParams({
      view: displayView,
      browseQuery: displayView === "browse" ? browseQuery : undefined,
      browseCategoryId: displayView === "browse" ? browseCategoryId : undefined,
    });
  }, [displayView, browseQuery, browseCategoryId]);

  function handleIdentityChange(next: AccountIdentity) {
    if (next === "seller" && !dashboard.user.sid) return;
    if (next === "buyer" && !dashboard.user.bid) return;
    setIdentity(next);
    setAccessNotice(null);
    setActiveView((current) => safeMemberView(current, next));
    writeStoredMemberIdentity(next);
    // Mirror mobile: identity is UX-only, but cached account data must refresh on switch.
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  }

  function handleViewChange(next: AccountViewId) {
    if (!canAccessFeatureView(next, features)) {
      setActiveView("home");
      return;
    }
    if (next === "browse") setBrowseCategoryId("");
    const requiredIdentity = requiredMemberIdentity(next);
    if (requiredIdentity) {
      const hasIdentity =
        requiredIdentity === "seller" ? Boolean(dashboard.user.sid) : Boolean(dashboard.user.bid);
      if (!hasIdentity) {
        setAccessNotice(requiredIdentity);
        setActiveView("dashboard");
        return;
      }
      if (identity !== requiredIdentity) {
        setIdentity(requiredIdentity);
        writeStoredMemberIdentity(requiredIdentity);
      }
    }
    setAccessNotice(null);
    setActiveView(next);
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
        activeView={displayView}
        onViewChange={handleViewChange}
        onMarketplaceSearch={handleMarketplaceSearch}
        marketplaceSearchQuery={displayView === "browse" ? browseQuery : ""}
        identity={identity}
        notifications={notifications}
        chatUnreadCount={features.chatEnabled ? chatUnreadCount : 0}
        features={features}
        vipSupportChannels={vipSupportChannels}
        onIdentityChange={handleIdentityChange}
        onSignOut={() => logout.mutate()}
        signingOut={logout.isPending}
        listingEditorOpen={listingEditorOpen}
        onListingEditorOpenChange={setListingEditorOpen}
        requirementEditorOpen={requirementEditorOpen}
        onRequirementEditorOpenChange={setRequirementEditorOpen}
      >
        {displayView === "chat" && features.chatEnabled ? (
          <AccountChatView
            dashboard={dashboard}
            identity={identity}
            initialConversationId={initialConversationId}
            features={features}
          />
        ) : (
        <MemberGlassCanvas>
        <div
          key={displayView}
          className={cn(
            "account-view mx-auto w-full",
            displayView === "home" || displayView === "browse" ? "max-w-6xl" : "max-w-5xl",
          )}
        >
          {displayView === "home" ? (
            <AccountHomeView
              dashboard={dashboard}
              homeFeed={homeFeed}
              identity={identity}
              chatUnreadCount={features.chatEnabled ? chatUnreadCount : 0}
              notifications={notifications.items}
              features={features}
              onNavigate={handleViewChange}
              onCreateListing={() => setListingEditorOpen(true)}
              onCreateRequirement={() => setRequirementEditorOpen(true)}
              onContinueBrowse={handleContinueBrowse}
            />
          ) : null}
          {displayView === "browse" ? (
            <AccountBrowseListingsView
              initialQuery={browseQuery}
              initialCategoryId={browseCategoryId}
              onQueryChange={handleBrowseQueryChange}
            />
          ) : null}
          {displayView === "categories" ? (
            <AccountCategoriesView onBrowseCategory={handleBrowseCategory} />
          ) : null}
          {displayView === "requirements" ? (
            <AccountOpenRequirementsView canApply={identity === "seller" && Boolean(dashboard.user.sid)} />
          ) : null}
          {displayView === "saved" && canAccessMemberView(displayView, identity) ? <AccountSavedView /> : null}
          {displayView === "my-listings" && canAccessMemberView(displayView, identity) ? <AccountMyListingsView dashboard={dashboard} /> : null}
          {displayView === "my-requirements" && canAccessMemberView(displayView, identity) ? <AccountMyRequirementsView dashboard={dashboard} /> : null}
          {displayView === "applications" ? <AccountApplicationsView identity={identity} /> : null}
          {displayView === "jobs-bookings" && canAccessMemberView(displayView, identity) ? (
            <AccountJobsBookingsView identity={identity} />
          ) : null}
          {displayView === "seller-tools" && canAccessMemberView(displayView, identity) ? (
            <AccountSellerToolsView />
          ) : null}
          {displayView === "verification" && canAccessMemberView(displayView, identity) ? (
            <AccountVerificationView />
          ) : null}
          {displayView === "earnings" && features.referralsEnabled ? (
            <AccountEarningsView
              dashboard={dashboard}
              onOpenReferrals={() => handleViewChange("referrals")}
              onOpenRecommend={
                features.recommendationsEnabled ? () => handleViewChange("recommend") : undefined
              }
              onOpenSellerTools={
                canAccessMemberView("seller-tools", identity)
                  ? () => handleViewChange("seller-tools")
                  : undefined
              }
            />
          ) : null}
          {displayView === "referrals" && features.referralsEnabled ? (
            <AccountReferralsView
              dashboard={dashboard}
              onOpenEarnings={() => handleViewChange("earnings")}
            />
          ) : null}
          {displayView === "recommend" && features.recommendationsEnabled ? (
            <AccountRecommendView />
          ) : null}
          {displayView === "notifications" ? (
            <AccountNotificationsView
              identity={identity}
              notifications={notifications.items}
              unreadCount={notifications.unreadCount}
            />
          ) : null}
          {displayView === "dashboard" ? (
            <AccountDashboardView
              dashboard={dashboard}
              identity={identity}
              accessNotice={accessNotice}
              onOpenEarnings={
                features.referralsEnabled ? () => handleViewChange("earnings") : undefined
              }
            />
          ) : null}
          {displayView === "membership" && canAccessMemberView(displayView, identity) ? (
            <AccountMembershipView dashboard={dashboard} features={features} />
          ) : null}
        </div>
        </MemberGlassCanvas>
        )}
      </MemberAccountShell>
    </div>
  );
}
