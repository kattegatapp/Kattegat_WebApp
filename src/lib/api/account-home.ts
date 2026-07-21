import type { CatalogCategory } from "@/lib/api/marketing";
import type { ListingSearchHit } from "@/lib/api/marketing";

export type OpenRequirementSummary = {
  id: string;
  title: string;
  description: string;
  location: string;
  budgetMin: number | null;
  budgetMax: number | null;
  jobType: string;
  createdAt: string;
  viewCount: number;
};

export type AccountHomeFeed = {
  categories: CatalogCategory[];
  listings: ListingSearchHit[];
  listingsTotal: number;
  requirements: OpenRequirementSummary[];
  requirementsTotal: number;
};

export function formatAedRange(min: number | null, max: number | null) {
  const format = (fils: number) =>
    `AED ${(fils / 100).toLocaleString("en-AE", { maximumFractionDigits: 0 })}`;
  if (min != null && max != null && min !== max) return `${format(min)} – ${format(max)}`;
  if (max != null) return `Up to ${format(max)}`;
  if (min != null) return `From ${format(min)}`;
  return "Budget on request";
}

export function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-AE", { month: "short", day: "numeric" });
}
