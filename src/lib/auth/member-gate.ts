import { redirect } from "next/navigation";

import { loadAccountDashboard } from "@/lib/api/account";
import {
  profileSetupPath,
  resolveProfileSetupStep,
  safeNextPath,
} from "@/lib/auth/profile-completion";

/** Staff (admin/agent) accounts use the admin portal — not the member workspace. */
export function isStaffAccount(user: {
  isAdmin?: boolean;
  adminRole?: string | null;
}) {
  return Boolean(user.isAdmin || user.adminRole);
}

/** Redirect signed-in members away from /login and /register. */
export async function redirectAuthenticatedMember(nextParam?: string | null) {
  const dashboard = await loadAccountDashboard();
  if (!dashboard) return;

  const next = safeNextPath(nextParam) ?? "/account";
  const step = resolveProfileSetupStep(dashboard);
  redirect(step === "complete" ? next : profileSetupPath(step, next));
}
