import { apiFetch } from "@/lib/api/client";
import type { AdminUserDetail } from "@/lib/api/admin/growth";

export type DelegateEligibility = {
  eligible: boolean;
  reason: "not_a_seller" | "not_vetted" | null;
  tier: string | null;
  displayName: string | null;
};

export type DelegatedListing = {
  id: string;
  sellerId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string | null;
  location: string | null;
  pricing: Record<string, unknown>;
  schemaFields: Record<string, unknown>;
  isConfidential: boolean;
  status: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DelegateSession = {
  eligibility: DelegateEligibility;
  user: AdminUserDetail;
};

export type DelegateAccountUpdate = {
  username?: string;
  phone?: string;
  businessName?: string;
  avatarUrl?: string;
  sellerProfile?: {
    displayName?: string;
    bio?: string;
    socialLinks?: Record<string, string>;
    tags?: string[];
    customSlug?: string;
  };
};

export type DelegateListingInput = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description?: string;
  location?: string;
  pricing?: { amount?: number; unit?: string };
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
};

export async function fetchDelegateEligibility(userId: string) {
  return apiFetch<DelegateEligibility>(`/api/admin/users/${userId}/delegate/eligibility`, undefined, {
    baseUrl: "",
  });
}

export async function startDelegateSession(userId: string) {
  return apiFetch<DelegateSession>(`/api/admin/users/${userId}/delegate/session`, {
    method: "POST",
    body: "{}",
  }, { baseUrl: "" });
}

export async function fetchDelegatedListings(userId: string) {
  return apiFetch<DelegatedListing[]>(`/api/admin/users/${userId}/delegate/listings`, undefined, {
    baseUrl: "",
  });
}

export async function createDelegatedListing(userId: string, input: DelegateListingInput) {
  return apiFetch<DelegatedListing>(`/api/admin/users/${userId}/delegate/listings`, {
    method: "POST",
    body: JSON.stringify(input),
  }, { baseUrl: "" });
}

export async function updateDelegatedListing(
  userId: string,
  listingId: string,
  input: Partial<DelegateListingInput>,
) {
  return apiFetch<DelegatedListing>(
    `/api/admin/users/${userId}/delegate/listings/${listingId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function submitDelegatedListing(userId: string, listingId: string) {
  return apiFetch<DelegatedListing>(
    `/api/admin/users/${userId}/delegate/listings/${listingId}/submit`,
    { method: "POST", body: "{}" },
    { baseUrl: "" },
  );
}

export async function updateDelegatedAccount(userId: string, input: DelegateAccountUpdate) {
  return apiFetch<AdminUserDetail>(`/api/admin/users/${userId}/delegate/account`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, { baseUrl: "" });
}
