import { redirect } from "next/navigation";

import { readImpersonationState } from "@/lib/admin/impersonation";
import { loadAccountHomeFeed } from "@/lib/api/account-home.server";
import { loadAccountNotifications } from "@/lib/api/account-notifications.server";
import { loadAccountDashboard } from "@/lib/api/account";
import { getPublicAppSettings } from "@/lib/api/settings";
import { pickAccountFeatureFlags } from "@/lib/chat/chat-access";
import {
  profileSetupPath,
  resolveProfileSetupStep,
} from "@/lib/auth/profile-completion";

/** Shared member workspace gate — login + profile setup, then load shell data. */
export async function loadMemberWorkspaceOrRedirect(nextPath: string) {
  const dashboard = await loadAccountDashboard();
  if (!dashboard) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const setupStep = resolveProfileSetupStep(dashboard);
  if (setupStep !== "complete") {
    redirect(profileSetupPath(setupStep, nextPath));
  }

  const [impersonation, homeFeed, notifications, settings] = await Promise.all([
    readImpersonationState(),
    loadAccountHomeFeed(),
    loadAccountNotifications(),
    getPublicAppSettings(),
  ]);

  return {
    dashboard,
    impersonation,
    homeFeed,
    notifications,
    features: pickAccountFeatureFlags(settings.features),
  };
}
