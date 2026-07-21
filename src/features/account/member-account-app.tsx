"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { MemberGlassCanvas } from "@/features/account/account-glass";
import { MemberAccountShell } from "@/features/account/member-account-shell";
import { AccountHomeView } from "@/features/account/account-home-view";
import { AccountChatView } from "@/features/account/account-chat-view";
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
  AccountRecommendView,
  AccountReferralsView,
  AccountSavedView,
} from "@/features/account/account-library-views";
import type { AccountIdentity, AccountViewId } from "@/features/account/types";
import type { AccountConversation } from "@/lib/api/account-chat";
import type { AccountHomeFeed } from "@/lib/api/account-home";
import type { AccountNotificationsState } from "@/lib/api/account-notifications";
import type { AccountDashboard } from "@/lib/api/account";
import {
  readStoredMemberIdentity,
  writeStoredMemberIdentity,
} from "@/lib/auth/member-identity";
import { logoutMember } from "@/lib/api/auth";
import { fetchAccountConversations } from "@/lib/api/account-chat";
import { canAccessMemberView, safeMemberView } from "@/lib/auth/member-access";

type MemberAccountAppProps = {
  dashboard: AccountDashboard;
  homeFeed: AccountHomeFeed;
  notifications: AccountNotificationsState;
  initialView?: AccountViewId;
  initialConversationId?: string;
};

function identityForConversation(
  thread: AccountConversation,
  userId: string,
): AccountIdentity | null {
  if (thread.buyerId === userId) return "buyer";
  if (thread.sellerId === userId) return "seller";
  return null;
}

export function MemberAccountApp({
  dashboard,
  homeFeed,
  notifications,
  initialView = "home",
  initialConversationId,
}: MemberAccountAppProps) {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<AccountViewId>(initialView);

  const defaultIdentity = useMemo<AccountIdentity>(() => {
    if (dashboard.user.sid) return "seller";
    return "buyer";
  }, [dashboard.user.sid]);

  const [identity, setIdentity] = useState<AccountIdentity>(defaultIdentity);

  const deepLinkConversationsQuery = useQuery({
    queryKey: ["account", "chat", "conversations"],
    queryFn: fetchAccountConversations,
    enabled: Boolean(initialConversationId),
  });

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

  function handleIdentityChange(next: AccountIdentity) {
    if (next === "seller" && !dashboard.user.sid) return;
    if (next === "buyer" && !dashboard.user.bid) return;
    setIdentity(next);
    setActiveView((current) => safeMemberView(current, next));
    writeStoredMemberIdentity(next);
  }

  function handleViewChange(next: AccountViewId) {
    setActiveView(safeMemberView(next, identity));
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
        identity={identity}
        notifications={notifications}
        onIdentityChange={handleIdentityChange}
        onSignOut={() => logout.mutate()}
        signingOut={logout.isPending}
      >
        {activeView === "chat" ? (
          <AccountChatView
            dashboard={dashboard}
            identity={identity}
            initialConversationId={initialConversationId}
          />
        ) : (
        <MemberGlassCanvas>
        <div key={activeView} className="account-view mx-auto w-full max-w-5xl">
          {activeView === "home" ? (
            <AccountHomeView dashboard={dashboard} homeFeed={homeFeed} identity={identity} onNavigate={handleViewChange} />
          ) : null}
          {activeView === "categories" ? <AccountCategoriesView /> : null}
          {activeView === "requirements" ? <AccountOpenRequirementsView /> : null}
          {activeView === "saved" && canAccessMemberView(activeView, identity) ? <AccountSavedView /> : null}
          {activeView === "my-listings" && canAccessMemberView(activeView, identity) ? <AccountMyListingsView dashboard={dashboard} /> : null}
          {activeView === "my-requirements" && canAccessMemberView(activeView, identity) ? <AccountMyRequirementsView dashboard={dashboard} /> : null}
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
