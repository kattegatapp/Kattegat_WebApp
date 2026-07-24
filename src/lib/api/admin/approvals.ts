import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export interface PendingListing {
  id: string;
  sellerId: string;
  sellerDisplayName: string | null;
  sellerAvatarUrl: string | null;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string | null;
  location: string | null;
  pricing: Record<string, unknown>;
  pricingBlocks?: import("@/lib/pricing-blocks").PricingBlock[];
  displayPrice?: string | null;
  coverImage: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export interface PendingRequirement {
  id: string;
  buyerId: string;
  title: string;
  categoryId: string;
  jobType: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string;
  attachments: string[];
  submittedAt: string | null;
  createdAt: string;
}

export interface ApprovalPage<T> {
  items: T[];
  page: number;
  total: number;
}

export type ListingRejectReasonCode =
  | "low_quality_media"
  | "irrelevant_category"
  | "explicit_or_prohibited_content"
  | "incomplete_information"
  | "duplicate_listing"
  | "other";

export async function fetchPendingListings(
  page = 1,
  pageSize = 20,
): Promise<ApprovalPage<PendingListing>> {
  const envelope = await apiFetchEnvelope<PendingListing[]>(
    `/api/admin/listings/pending?page=${page}&pageSize=${pageSize}`,
    undefined,
    { baseUrl: "" },
  );
  return {
    items: envelope.data,
    page: envelope.meta?.page ?? page,
    total: envelope.meta?.total ?? envelope.data.length,
  };
}

export async function approveListing(listingId: string): Promise<null> {
  return apiFetch<null>(
    `/api/admin/listings/${listingId}/approve`,
    { method: "POST" },
    { baseUrl: "" },
  );
}

export async function rejectListing(
  listingId: string,
  input: { reason: string; reasonCode?: ListingRejectReasonCode },
): Promise<null> {
  return apiFetch<null>(
    `/api/admin/listings/${listingId}/reject`,
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function fetchPendingRequirements(
  page = 1,
  pageSize = 20,
): Promise<ApprovalPage<PendingRequirement>> {
  const envelope = await apiFetchEnvelope<PendingRequirement[]>(
    `/api/admin/requirements/pending?page=${page}&pageSize=${pageSize}`,
    undefined,
    { baseUrl: "" },
  );
  return {
    items: envelope.data.map((item) => ({
      ...item,
      attachments: item.attachments ?? [],
    })),
    page: envelope.meta?.page ?? page,
    total: envelope.meta?.total ?? envelope.data.length,
  };
}

export async function approveRequirement(requirementId: string): Promise<null> {
  return apiFetch<null>(
    `/api/admin/requirements/${requirementId}/approve`,
    { method: "POST" },
    { baseUrl: "" },
  );
}

export async function rejectRequirement(requirementId: string, reason: string): Promise<null> {
  return apiFetch<null>(
    `/api/admin/requirements/${requirementId}/reject`,
    { method: "POST", body: JSON.stringify({ reason }) },
    { baseUrl: "" },
  );
}
