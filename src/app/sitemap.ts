import type { MetadataRoute } from "next";

import {
  getCatalogCategories,
  listSitemapListings,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import { listingPublicPath, sellerPublicPath } from "@/lib/navigation/public-paths";
import { DUBAI_SEO_PAGES } from "@/features/marketing/local-seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicAppSettings();
  const origin = settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/services",
    "/dubai",
    "/about",
    "/how-it-works",
    "/plans",
    "/faq",
    "/contact",
    "/support",
    "/waitlist",
    "/terms-of-service",
    "/privacy-policy",
  ].map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/search" || path === "/dubai" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/search" || path === "/services" || path === "/dubai" ? 0.9 : 0.6,
  }));

  const dubaiRoutes: MetadataRoute.Sitemap = DUBAI_SEO_PAGES.map((page) => ({
    url: `${origin}/dubai/${page.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.92,
  }));

  const [categories, listings] = await Promise.all([
    getCatalogCategories(),
    listSitemapListings(2000),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${origin}/category/${encodeURIComponent(category.slug)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${origin}${listingPublicPath({ id: listing.id, title: listing.title })}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sellerPaths = new Map<string, string>();
  for (const listing of listings) {
    if (sellerPaths.has(listing.sellerId)) continue;
    sellerPaths.set(
      listing.sellerId,
      sellerPublicPath({
        userId: listing.sellerId,
        customSlug: listing.sellerCustomSlug,
        displayName: listing.sellerName,
      }),
    );
  }

  const sellerRoutes: MetadataRoute.Sitemap = [...sellerPaths.values()].map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...dubaiRoutes,
    ...categoryRoutes,
    ...listingRoutes,
    ...sellerRoutes,
  ];
}
