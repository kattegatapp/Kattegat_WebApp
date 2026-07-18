import { getPublicAppSettings } from "@/lib/api/settings";

export async function getSiteOrigin() {
  const settings = await getPublicAppSettings();
  return settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";
}

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/** Prefer a clean city label for titles (e.g. "Dubai Marina" → keep, empty → Dubai). */
export function locationLabel(location: string | null | undefined, fallback = "Dubai") {
  const value = location?.trim();
  if (!value) return fallback;
  // Keep short enough for SERP titles.
  return value.length > 40 ? `${value.slice(0, 37).trim()}…` : value;
}

export function listingPageTitle(input: {
  title: string;
  categoryName?: string | null;
  location?: string | null;
  sellerName?: string | null;
}) {
  const service = input.categoryName?.trim() || input.title.trim() || "Service";
  const place = locationLabel(input.location);
  const seller = input.sellerName?.trim();
  const lead = `${service} in ${place}`;
  return seller ? `${lead} | ${seller} | Kattegat` : `${lead} | Kattegat`;
}

export function listingPageDescription(input: {
  title: string;
  description?: string | null;
  categoryName?: string | null;
  location?: string | null;
  sellerName?: string | null;
}) {
  if (input.description?.trim()) {
    return input.description.trim().slice(0, 160);
  }
  const place = locationLabel(input.location);
  const seller = input.sellerName?.trim() || "a verified seller";
  const category = input.categoryName?.trim();
  const service = category ? `${category.toLowerCase()} service` : input.title;
  return `Book ${service} in ${place} with ${seller} on Kattegat — Dubai’s direct events & hospitality marketplace. No agency middlemen.`.slice(
    0,
    160,
  );
}

export function sellerPageTitle(name: string, location?: string | null) {
  const place = locationLabel(location);
  return `${name} | Talent in ${place} | Kattegat`;
}

export function sellerPageDescription(input: {
  name: string;
  bio?: string | null;
  location?: string | null;
}) {
  if (input.bio?.trim()) return input.bio.trim().slice(0, 160);
  const place = locationLabel(input.location);
  return `${input.name} is available on Kattegat in ${place}. View services, ratings, and connect directly — no booking commission.`.slice(
    0,
    160,
  );
}

export function categoryPageTitle(categoryName: string, location = "Dubai") {
  return `${categoryName} in ${location} | Kattegat`;
}

export function categoryPageDescription(categoryName: string, location = "Dubai") {
  return `Find ${categoryName.toLowerCase()} talent and services in ${location} on Kattegat. Browse live listings and continue in the app to message sellers directly.`.slice(
    0,
    160,
  );
}
