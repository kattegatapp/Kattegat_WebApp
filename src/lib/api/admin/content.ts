import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type AdminListingStatus = "draft" | "pending_review" | "live" | "rejected" | "unpublished";
export type AdminRequirementStatus = "pending_review" | "open" | "shortlisting" | "awarded" | "closed" | "expired" | "rejected";

export interface AdminListingRecord { id: string; sellerId: string; sellerDisplayName: string | null; title: string; description: string | null; location: string | null; coverImage: string | null; status: AdminListingStatus; createdAt: string; updatedAt: string; }

export interface AdminListingDetail extends AdminListingRecord {
  sellerAvatarUrl?: string | null;
  categoryId?: string;
  subcategoryId?: string;
  pricing?: Record<string, unknown> | null;
  media?: Array<{ id: string; type: string; url: string }>;
}

export interface AdminRequirementRecord {
  id: string;
  buyerId: string;
  buyerDisplayName: string | null;
  buyerEmail: string | null;
  title: string;
  description: string;
  location: string;
  jobType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: AdminRequirementStatus;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAllListings(input: { q?: string; status?: string; page: number }) {
  const params = new URLSearchParams({ page: String(input.page), pageSize: "20" });
  if (input.q) params.set("q", input.q);
  if (input.status && input.status !== "all") params.set("status", input.status);
  return apiFetchEnvelope<AdminListingRecord[]>(`/api/admin/listings?${params}`, undefined, { baseUrl: "" });
}

export const fetchAdminListing = (listingId: string) =>
  apiFetch<AdminListingDetail>(`/api/admin/listings/${listingId}`, undefined, { baseUrl: "" });
export const updateAdminListing = (
  listingId: string,
  input: { title?: string; description?: string | null; location?: string | null },
) =>
  apiFetch<null>(
    `/api/admin/listings/${listingId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
export const deleteAdminListingMedia = (listingId: string, mediaId: string) =>
  apiFetch<null>(
    `/api/admin/listings/${listingId}/media/${mediaId}`,
    { method: "DELETE" },
    { baseUrl: "" },
  );
export const updateListingAvailability = (id: string, available: boolean) => apiFetch<null>(`/api/admin/listings/${id}/availability`, { method: "PATCH", body: JSON.stringify({ available }) }, { baseUrl: "" });

export async function fetchAllRequirements(input: { q?: string; status?: string; page: number }) {
  const params = new URLSearchParams({ page: String(input.page), pageSize: "20" });
  if (input.q) params.set("q", input.q);
  if (input.status && input.status !== "all") params.set("status", input.status);
  return apiFetchEnvelope<AdminRequirementRecord[]>(`/api/admin/requirements?${params}`, undefined, { baseUrl: "" });
}
export const updateRequirementAvailability = (id: string, available: boolean) => apiFetch<null>(`/api/admin/requirements/${id}/availability`, { method: "PATCH", body: JSON.stringify({ available }) }, { baseUrl: "" });
