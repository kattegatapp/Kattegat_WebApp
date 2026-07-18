import type { MetadataRoute } from "next";

import {
  getCatalogCategories,
  listSitemapListings,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicAppSettings();
  const origin = settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/services",
    "/about",
    "/how-it-works",
    "/faq",
    "/contact",
    "/support",
    "/waitlist",
    "/terms-of-service",
    "/privacy-policy",
  ].map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/search" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/search" || path === "/services" ? 0.9 : 0.6,
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
    url: `${origin}/listing/${listing.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sellerIds = [...new Set(listings.map((listing) => listing.sellerId))];
  const sellerRoutes: MetadataRoute.Sitemap = sellerIds.map((sellerId) => ({
    url: `${origin}/seller/${sellerId}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...sellerRoutes];
}
