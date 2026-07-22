import { apiFetchEnvelope } from "@/lib/api/client";
import type { ListingSearchHit, ListingSearchSort } from "@/lib/api/marketing";

export type MarketplaceSearchResult = {
  items: ListingSearchHit[];
  total: number;
  page: number;
};

export async function fetchMarketplaceListings(options: {
  q?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
  sort?: ListingSearchSort;
}): Promise<MarketplaceSearchResult> {
  const params = new URLSearchParams();
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.subcategoryId) params.set("subcategoryId", options.subcategoryId);
  params.set("page", String(options.page ?? 1));
  params.set("pageSize", String(options.pageSize ?? 24));
  params.set("sort", options.sort ?? "recommended");

  const { data, meta } = await apiFetchEnvelope<ListingSearchHit[]>(
    `/api/marketplace/search?${params.toString()}`,
    undefined,
    { baseUrl: "" },
  );

  return {
    items: data,
    total: meta?.total ?? data.length,
    page: meta?.page ?? options.page ?? 1,
  };
}
