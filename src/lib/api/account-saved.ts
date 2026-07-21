import { apiFetch } from "@/lib/api/client";

export type SavedListing = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverImage: string | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
};

export type SavedItems = {
  listingIds: string[];
  requirementIds: string[];
  listings: SavedListing[];
  requirements: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    budgetMin: number | null;
    budgetMax: number | null;
    jobType: string;
    status: string;
    createdAt: string;
    viewCount: number;
  }>;
};

export async function fetchSavedItems() {
  return apiFetch<SavedItems>("/api/account/saved", undefined, { baseUrl: "" });
}
