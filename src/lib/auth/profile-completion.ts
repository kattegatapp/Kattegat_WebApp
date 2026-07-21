import type { AccountUser, SellerProfileSummary } from "@/lib/api/account";

export type ProfileSetupStep = "profile-details" | "seller-setup" | "complete";

export type ProfileSetupContext = {
  user: AccountUser;
  sellerProfile: SellerProfileSummary | null;
};

/** Mirrors mobile onboarding gates, with web fixes for dual-identity upgrades. */
export function resolveProfileSetupStep({
  user,
  sellerProfile,
}: ProfileSetupContext): ProfileSetupStep {
  if (!user.username?.trim()) {
    return "profile-details";
  }

  if (user.originalRole !== "seller" && !user.businessName?.trim()) {
    return "profile-details";
  }

  if (user.originalRole === "seller" && user.bid && !user.businessName?.trim()) {
    return "profile-details";
  }

  if (user.sid && !sellerProfile?.displayName?.trim()) {
    return "seller-setup";
  }

  return "complete";
}

/** Buyers use `users.business_name`; sellers use `seller_profiles.display_name` instead. */
export function needsBusinessNameField(user: AccountUser) {
  return user.originalRole !== "seller" || Boolean(user.bid);
}

export function profileSetupPath(step: ProfileSetupStep, next?: string | null) {
  if (step === "complete") {
    return safeNextPath(next) ?? "/account";
  }

  const params = new URLSearchParams();
  if (step === "seller-setup") params.set("step", "seller");
  const nextPath = safeNextPath(next);
  if (nextPath) params.set("next", nextPath);
  const query = params.toString();
  return query ? `/account/setup?${query}` : "/account/setup";
}

export function safeNextPath(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.startsWith("/account/setup")) return null;
  return raw;
}

export function missingProfileFields({ user, sellerProfile }: ProfileSetupContext) {
  const missing: string[] = [];
  if (!user.username?.trim()) missing.push("username");
  if (user.originalRole !== "seller" && !user.businessName?.trim()) {
    missing.push("business name");
  }
  if (user.originalRole === "seller" && user.bid && !user.businessName?.trim()) {
    missing.push("business name");
  }
  if (user.sid && !sellerProfile?.displayName?.trim()) missing.push("seller display name");
  return missing;
}
