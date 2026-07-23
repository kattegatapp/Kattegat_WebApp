import type { Metadata } from "next";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MemberAccountApp } from "@/features/account/member-account-app";
import type { AccountViewId } from "@/features/account/types";
import { loadMemberWorkspaceOrRedirect } from "@/lib/auth/member-workspace-page";

export const metadata: Metadata = {
  title: "Account | Kattegat",
  description: "Your Kattegat workspace — discover talent, manage bookings, and grow your business.",
};

const ACCOUNT_VIEWS: readonly AccountViewId[] = [
  "home",
  "browse",
  "categories",
  "requirements",
  "saved",
  "my-listings",
  "my-requirements",
  "applications",
  "jobs-bookings",
  "seller-tools",
  "verification",
  "referrals",
  "recommend",
  "notifications",
  "dashboard",
  "membership",
  "chat",
];

function accountView(value: string | string[] | undefined): AccountViewId {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ACCOUNT_VIEWS.includes(candidate as AccountViewId) ? (candidate as AccountViewId) : "home";
}

function firstString(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string | string[];
    q?: string | string[];
    categoryId?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const { dashboard, impersonation, homeFeed, notifications } =
    await loadMemberWorkspaceOrRedirect("/account");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {impersonation ? <ImpersonationBanner /> : null}
      <MemberAccountApp
        dashboard={dashboard}
        homeFeed={homeFeed}
        notifications={notifications}
        initialView={accountView(params.view)}
        initialBrowseQuery={firstString(params.q)}
        initialBrowseCategoryId={firstString(params.categoryId)}
      />
    </div>
  );
}
