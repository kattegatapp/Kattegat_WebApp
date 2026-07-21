import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MemberAuthShell } from "@/features/auth/member-auth-shell";
import { MemberProfileSetupContent } from "@/features/auth/member-profile-setup-content";
import { readImpersonationState } from "@/lib/admin/impersonation";
import { loadAccountDashboard } from "@/lib/api/account";
import {
  needsBusinessNameField,
  profileSetupPath,
  resolveProfileSetupStep,
  safeNextPath,
} from "@/lib/auth/profile-completion";

export const metadata: Metadata = {
  title: "Complete your profile | Kattegat",
  description: "Finish setting up your Kattegat account.",
};

type PageProps = {
  searchParams: Promise<{ step?: string; next?: string }>;
};

export default async function AccountSetupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next ?? null);
  const [dashboard, impersonation] = await Promise.all([
    loadAccountDashboard(),
    readImpersonationState(),
  ]);

  if (!dashboard) {
    redirect(`/login?next=${encodeURIComponent("/account/setup")}`);
  }

  const step = resolveProfileSetupStep(dashboard);

  if (step === "complete") {
    redirect(nextPath ?? "/account");
  }

  const activeStep = step === "seller-setup" ? "seller-setup" : "profile-details";

  if (params.step === "seller" && step === "profile-details") {
    redirect(profileSetupPath("profile-details", nextPath));
  }

  const { user } = dashboard;
  const showBusinessName = needsBusinessNameField(user);
  const copy =
    activeStep === "seller-setup"
      ? {
          title: "Tell buyers about you",
          description:
            "This is your public seller name — what venues and event planners see in discovery.",
        }
      : {
          title: "Set up your profile",
          description: showBusinessName
            ? "Choose a username and tell us who you book as — this is how you appear across Kattegat."
            : "Choose a public username for your Kattegat account. You can add more details later.",
        };

  return (
    <>
      {impersonation ? <ImpersonationBanner /> : null}
      <MemberAuthShell title={copy.title} description={copy.description}>
        <MemberProfileSetupContent
          dashboard={dashboard}
          initialStep={activeStep}
          nextPath={nextPath}
        />
      </MemberAuthShell>
    </>
  );
}
