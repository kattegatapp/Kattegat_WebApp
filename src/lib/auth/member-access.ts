import { DEFAULT_PUBLIC_PLANS, type PublicPlanFeatures, type PublicSellerTier } from "@/lib/api/plans";

export type MemberIdentity = "buyer" | "seller";

const BUYER_ONLY_VIEWS = new Set(["saved", "my-requirements"]);
const SELLER_ONLY_VIEWS = new Set(["my-listings", "membership"]);

export function normalizeSellerTier(tier: string | null | undefined): PublicSellerTier {
  if (tier === "pro") return "pro";
  if (tier === "white_glove" || tier === "vetted") return "white_glove";
  return "starter";
}

export function sellerPlanAccess(
  tier: string | null | undefined,
  plans: PublicPlanFeatures[] = DEFAULT_PUBLIC_PLANS,
) {
  const normalizedTier = normalizeSellerTier(tier);
  return plans.find((plan) => plan.tier === normalizedTier) ?? DEFAULT_PUBLIC_PLANS[0];
}

export function canAccessMemberView(view: string, identity: MemberIdentity) {
  if (BUYER_ONLY_VIEWS.has(view)) return identity === "buyer";
  if (SELLER_ONLY_VIEWS.has(view)) return identity === "seller";
  return true;
}

export function safeMemberView<T extends string>(view: T, identity: MemberIdentity): T | "home" {
  return canAccessMemberView(view, identity) ? view : "home";
}
