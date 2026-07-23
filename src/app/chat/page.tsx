import type { Metadata } from "next";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MemberAccountApp } from "@/features/account/member-account-app";
import { loadMemberWorkspaceOrRedirect } from "@/lib/auth/member-workspace-page";

export const metadata: Metadata = {
  title: "Chat | Kattegat",
  description: "Your Kattegat conversations",
  robots: { index: false, follow: false },
};

export default async function ChatInboxPage() {
  const { dashboard, impersonation, homeFeed, notifications, features } =
    await loadMemberWorkspaceOrRedirect("/chat");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {impersonation ? <ImpersonationBanner /> : null}
      <MemberAccountApp
        dashboard={dashboard}
        homeFeed={homeFeed}
        notifications={notifications}
        features={features}
        initialView="chat"
      />
    </div>
  );
}
