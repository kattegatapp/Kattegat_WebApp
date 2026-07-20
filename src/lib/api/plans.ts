import { apiFetch } from "@/lib/api/client";
import { resolveBackendApiUrl } from "@/lib/api/settings";

export type PublicSellerTier = "starter" | "pro" | "white_glove";

export interface PublicPlanFeatures {
  tier: PublicSellerTier;
  maxListings: number | null;
  maxPhotosPerListing: number | null;
  maxVideoLinksPerListing: number | null;
  maxProfileMedia: number | null;
  monthlyPriceFils: number | null;
  canReceiveReviews: boolean;
  canChatDirectly: boolean;
  socialLinkOut: boolean;
  prioritySearch: boolean;
}

const TIER_ORDER: PublicSellerTier[] = ["starter", "pro", "white_glove"];

export const DEFAULT_PUBLIC_PLANS: PublicPlanFeatures[] = [
  {
    tier: "starter",
    maxListings: 3,
    maxPhotosPerListing: 6,
    maxVideoLinksPerListing: 1,
    maxProfileMedia: 8,
    monthlyPriceFils: null,
    canReceiveReviews: false,
    canChatDirectly: false,
    socialLinkOut: false,
    prioritySearch: false,
  },
  {
    tier: "pro",
    maxListings: 12,
    maxPhotosPerListing: 20,
    maxVideoLinksPerListing: 4,
    maxProfileMedia: 24,
    monthlyPriceFils: 19900,
    canReceiveReviews: true,
    canChatDirectly: true,
    socialLinkOut: true,
    prioritySearch: true,
  },
  {
    tier: "white_glove",
    maxListings: null,
    maxPhotosPerListing: null,
    maxVideoLinksPerListing: null,
    maxProfileMedia: null,
    monthlyPriceFils: null,
    canReceiveReviews: true,
    canChatDirectly: true,
    socialLinkOut: true,
    prioritySearch: true,
  },
];

export function sortPublicPlans(plans: PublicPlanFeatures[]) {
  return [...plans].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );
}

export async function getPublicPlanFeatures(): Promise<PublicPlanFeatures[]> {
  try {
    const plans = await apiFetch<PublicPlanFeatures[]>(
      "/api/catalog/plan-features",
      { next: { revalidate: 60 } },
      { baseUrl: resolveBackendApiUrl() },
    );
    return sortPublicPlans(plans.length ? plans : DEFAULT_PUBLIC_PLANS);
  } catch {
    return DEFAULT_PUBLIC_PLANS;
  }
}
