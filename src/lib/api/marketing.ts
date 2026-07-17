import { apiFetchEnvelope } from "@/lib/api/client";
import { resolveBackendApiUrl } from "@/lib/api/settings";

type DiscoveryListing = {
  sellerId: string;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerTier?: "starter" | "pro" | "white_glove" | null;
  sellerAggregateRating?: number | null;
  sellerReviewCount?: number | null;
  categoryName?: string | null;
  title: string;
};

export type FeaturedSeller = {
  id: string;
  name: string;
  avatarUrl: string | null;
  tier: "starter" | "pro" | "white_glove" | null;
  rating: number;
  reviewCount: number;
  category: string | null;
  service: string;
};

function safeRemoteImage(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function getFeaturedSellers(limit = 4): Promise<FeaturedSeller[]> {
  try {
    const { data } = await apiFetchEnvelope<DiscoveryListing[]>(
      `/api/listings/search?sort=recommended&page=1&pageSize=${Math.max(limit * 3, 12)}`,
      { cache: "no-store" },
      { baseUrl: resolveBackendApiUrl() },
    );

    const sellers = new Map<string, FeaturedSeller>();
    for (const listing of data) {
      if (!listing.sellerId || sellers.has(listing.sellerId)) continue;
      sellers.set(listing.sellerId, {
        id: listing.sellerId,
        name: listing.sellerName?.trim() || "Kattegat seller",
        avatarUrl: safeRemoteImage(listing.sellerAvatarUrl),
        tier: listing.sellerTier ?? null,
        rating: Number.isFinite(listing.sellerAggregateRating)
          ? Number(listing.sellerAggregateRating)
          : 0,
        reviewCount: Number.isFinite(listing.sellerReviewCount)
          ? Number(listing.sellerReviewCount)
          : 0,
        category: listing.categoryName?.trim() || null,
        service: listing.title,
      });
      if (sellers.size >= limit) break;
    }
    return [...sellers.values()];
  } catch {
    return [];
  }
}
