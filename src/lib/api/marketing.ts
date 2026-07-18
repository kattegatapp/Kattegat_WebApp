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

export type ListingSearchHit = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverImage: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  sellerId: string;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerTier: "starter" | "pro" | "white_glove" | null;
  sellerAggregateRating: number;
  sellerReviewCount: number;
};

export type ListingSearchPage = {
  items: ListingSearchHit[];
  total: number;
  page: number;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  allowsListings: boolean;
};

export type CatalogSubcategory = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
};

export type ListingSearchSort =
  | "recommended"
  | "top_rated"
  | "newest"
  | "price_asc"
  | "price_desc";

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const { data } = await apiFetchEnvelope<
      Array<{
        id: string;
        slug: string;
        name: string;
        allowsListings?: boolean;
      }>
    >("/api/catalog/categories", { cache: "no-store" }, { baseUrl: resolveBackendApiUrl() });

    return data
      .filter((category) => category.allowsListings !== false)
      .map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        allowsListings: category.allowsListings !== false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function getCatalogSubcategories(
  categoryId: string,
): Promise<CatalogSubcategory[]> {
  if (!categoryId) return [];
  try {
    const { data } = await apiFetchEnvelope<
      Array<{
        id: string;
        categoryId?: string;
        category_id?: string;
        slug: string;
        name: string;
      }>
    >(
      `/api/catalog/categories/${categoryId}/subcategories`,
      { cache: "no-store" },
      { baseUrl: resolveBackendApiUrl() },
    );

    return data
      .map((subcategory) => ({
        id: subcategory.id,
        categoryId: subcategory.categoryId ?? subcategory.category_id ?? categoryId,
        slug: subcategory.slug,
        name: subcategory.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function normalizeSearchHit(listing: DiscoveryListing & {
  id?: string;
  description?: string | null;
  location?: string | null;
  coverImage?: string | null;
  subcategoryName?: string | null;
}): ListingSearchHit | null {
  if (!listing.id || !listing.sellerId) return null;
  return {
    id: listing.id,
    title: listing.title?.trim() || "Service listing",
    description: listing.description?.trim() || null,
    location: listing.location?.trim() || null,
    coverImage: safeRemoteImage(listing.coverImage ?? null),
    categoryName: listing.categoryName?.trim() || null,
    subcategoryName: listing.subcategoryName?.trim() || null,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName?.trim() || "Kattegat seller",
    sellerAvatarUrl: safeRemoteImage(listing.sellerAvatarUrl),
    sellerTier: listing.sellerTier ?? null,
    sellerAggregateRating: Number.isFinite(listing.sellerAggregateRating)
      ? Number(listing.sellerAggregateRating)
      : 0,
    sellerReviewCount: Number.isFinite(listing.sellerReviewCount)
      ? Number(listing.sellerReviewCount)
      : 0,
  };
}

export async function searchListings(options: {
  q?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
  sort?: ListingSearchSort;
}): Promise<ListingSearchPage> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;
  const params = new URLSearchParams({
    sort: options.sort ?? "recommended",
    page: String(page),
    pageSize: String(pageSize),
  });
  const q = options.q?.trim();
  if (q) params.set("q", q);
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.subcategoryId) params.set("subcategoryId", options.subcategoryId);

  try {
    const { data, meta } = await apiFetchEnvelope<
      Array<
        DiscoveryListing & {
          id: string;
          description?: string | null;
          location?: string | null;
          coverImage?: string | null;
          subcategoryName?: string | null;
        }
      >
    >(`/api/listings/search?${params}`, { cache: "no-store" }, { baseUrl: resolveBackendApiUrl() });

    return {
      items: data.map(normalizeSearchHit).filter((item): item is ListingSearchHit => item != null),
      total: meta?.total ?? data.length,
      page: meta?.page ?? page,
    };
  } catch {
    return { items: [], total: 0, page };
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
    }

    // Prefer profiles that look finished on a marketing surface.
    return [...sellers.values()]
      .sort((a, b) => {
        const score = (s: FeaturedSeller) =>
          (s.avatarUrl ? 4 : 0) +
          (s.reviewCount >= 3 && s.rating >= 4 ? 2 : 0) +
          (s.tier === "white_glove" ? 2 : s.tier === "pro" ? 1 : 0) +
          (s.service && !/kattegat\.app/i.test(s.service) ? 1 : 0);
        return score(b) - score(a);
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}

export type PublicListingDetail = {
  id: string;
  sellerId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string | null;
  location: string | null;
  updatedAt: string | null;
  aggregateRating: number;
  reviewCount: number;
};

export type PublicSellerDetail = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  customSlug: string | null;
  tier: "starter" | "pro" | "white_glove" | null;
  aggregateRating: number;
  reviewCount: number;
  tags: string[];
  listings?: Array<{ id: string; title: string }>;
};

export async function getPublicListing(listingId: string): Promise<PublicListingDetail | null> {
  try {
    const { data } = await apiFetchEnvelope<{
      id: string;
      sellerId: string;
      categoryId: string;
      subcategoryId: string;
      title: string;
      description: string | null;
      location: string | null;
      updatedAt?: string | null;
      aggregateRating?: number;
      reviewCount?: number;
    }>(`/api/listings/${listingId}`, { next: { revalidate: 300 } }, { baseUrl: resolveBackendApiUrl() });

    return {
      id: data.id,
      sellerId: data.sellerId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      title: data.title?.trim() || "Service listing",
      description: data.description?.trim() || null,
      location: data.location?.trim() || null,
      updatedAt: data.updatedAt ?? null,
      aggregateRating: Number.isFinite(data.aggregateRating) ? Number(data.aggregateRating) : 0,
      reviewCount: Number.isFinite(data.reviewCount) ? Number(data.reviewCount) : 0,
    };
  } catch {
    return null;
  }
}

export async function getPublicListingMedia(listingId: string): Promise<string[]> {
  try {
    const { data } = await apiFetchEnvelope<Array<{ type: string; url: string; sortOrder: number }>>(
      `/api/listings/${listingId}/media`,
      { next: { revalidate: 300 } },
      { baseUrl: resolveBackendApiUrl() },
    );
    return data
      .filter((item) => item.type === "photo")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => safeRemoteImage(item.url))
      .filter((url): url is string => Boolean(url));
  } catch {
    return [];
  }
}

export async function getPublicSeller(sellerId: string): Promise<PublicSellerDetail | null> {
  try {
    const { data } = await apiFetchEnvelope<{
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      customSlug: string | null;
      tier?: "starter" | "pro" | "white_glove" | null;
      aggregateRating?: number;
      reviewCount?: number;
      tags?: string[];
      listings?: Array<{ id: string; title: string }>;
    }>(`/api/sellers/${sellerId}`, { next: { revalidate: 300 } }, { baseUrl: resolveBackendApiUrl() });

    return {
      userId: data.userId,
      displayName: data.displayName?.trim() || null,
      avatarUrl: safeRemoteImage(data.avatarUrl),
      bio: data.bio?.trim() || null,
      customSlug: data.customSlug?.trim() || null,
      tier: data.tier ?? null,
      aggregateRating: Number.isFinite(data.aggregateRating) ? Number(data.aggregateRating) : 0,
      reviewCount: Number.isFinite(data.reviewCount) ? Number(data.reviewCount) : 0,
      tags: data.tags ?? [],
      listings: data.listings?.map((listing) => ({
        id: listing.id,
        title: listing.title,
      })),
    };
  } catch {
    return null;
  }
}

/** Crawl budget helper — paginate live listings for sitemap generation. */
export async function listSitemapListings(maxItems = 2000): Promise<
  Array<{ id: string; sellerId: string }>
> {
  const pageSize = 50;
  const maxPages = Math.ceil(maxItems / pageSize);
  const items: Array<{ id: string; sellerId: string }> = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await searchListings({ page, pageSize, sort: "newest" });
    for (const listing of result.items) {
      items.push({ id: listing.id, sellerId: listing.sellerId });
    }
    if (result.items.length === 0 || items.length >= result.total || items.length >= maxItems) {
      break;
    }
  }

  return items.slice(0, maxItems);
}
