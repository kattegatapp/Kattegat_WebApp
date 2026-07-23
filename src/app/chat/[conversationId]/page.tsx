import type { Metadata } from "next";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MemberAccountApp } from "@/features/account/member-account-app";
import { loadMemberWorkspaceOrRedirect } from "@/lib/auth/member-workspace-page";

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { conversationId } = await params;
  return {
    title: "Chat | Kattegat",
    description: "Kattegat conversation",
    robots: { index: false, follow: false },
    other: { "kattegat:conversation-id": conversationId },
  };
}

export default async function ChatConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const cleaned = conversationId.trim();
  const nextPath = `/chat/${encodeURIComponent(cleaned)}`;
  const { dashboard, impersonation, homeFeed, notifications, features } =
    await loadMemberWorkspaceOrRedirect(nextPath);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {impersonation ? <ImpersonationBanner /> : null}
      <MemberAccountApp
        dashboard={dashboard}
        homeFeed={homeFeed}
        notifications={notifications}
        features={features}
        initialView="chat"
        initialConversationId={cleaned}
      />
    </div>
  );
}
