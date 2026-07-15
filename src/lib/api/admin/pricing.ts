import { apiFetch } from "@/lib/api/client";

export type SellerTier = "starter" | "pro" | "white_glove";

export interface PlanFeatures {
  tier: SellerTier;
  maxListings: number | null;
  maxPhotosPerListing: number | null;
  maxVideoLinksPerListing: number | null;
  maxProfileMedia: number | null;
  /** Monthly plan price in fils. Null = free / not publicly priced. */
  monthlyPriceFils: number | null;
  canReceiveReviews: boolean;
  canChatDirectly: boolean;
  socialLinkOut: boolean;
  prioritySearch: boolean;
}

export type UpdatePlanFeaturesInput = Partial<Omit<PlanFeatures, "tier">>;

export async function fetchPlanFeatures(): Promise<PlanFeatures[]> {
  return apiFetch<PlanFeatures[]>("/api/admin/pricing", undefined, { baseUrl: "" });
}

export async function updatePlanFeatures(
  tier: SellerTier,
  input: UpdatePlanFeaturesInput,
): Promise<PlanFeatures> {
  return apiFetch<PlanFeatures>(
    `/api/admin/pricing/${tier}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    { baseUrl: "" },
  );
}
