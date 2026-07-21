import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MemberAccountApp } from "@/features/account/member-account-app";
import { loadMemberWorkspaceOrRedirect } from "@/lib/auth/member-workspace-page";

export const metadata: Metadata = {
  title: "Account | Kattegat",
  description: "Your Kattegat workspace — discover talent, manage bookings, and grow your business.",
};

export default async function AccountPage() {
  const { dashboard, impersonation, homeFeed, notifications } =
    await loadMemberWorkspaceOrRedirect("/account");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {impersonation ? <ImpersonationBanner /> : null}
      <MemberAccountApp dashboard={dashboard} homeFeed={homeFeed} notifications={notifications} />
    </div>
  );
}
