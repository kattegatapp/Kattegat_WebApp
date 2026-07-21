import type { AccountListing } from "@/lib/api/account";
import { apiFetch } from "@/lib/api/client";
import type { CreateListingPayload, UpdateListingPayload } from "@/lib/validations/listing";

export type { AccountListing };

export async function fetchAccountListings() {
  return apiFetch<AccountListing[]>("/api/account/listings", undefined, { baseUrl: "" });
}

export async function fetchAccountListing(listingId: string) {
  return apiFetch<AccountListing>(`/api/account/listings/${listingId}`, undefined, { baseUrl: "" });
}

export async function createAccountListing(payload: CreateListingPayload) {
  return apiFetch<AccountListing>(
    "/api/account/listings",
    { method: "POST", body: JSON.stringify(payload) },
    { baseUrl: "" },
  );
}

export async function updateAccountListing(listingId: string, payload: UpdateListingPayload) {
  return apiFetch<AccountListing>(
    `/api/account/listings/${listingId}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    { baseUrl: "" },
  );
}

export async function submitListingForReview(listingId: string) {
  return apiFetch<AccountListing>(
    `/api/account/listings/${listingId}/publish`,
    { method: "POST" },
    { baseUrl: "" },
  );
}

export async function unpublishAccountListing(listingId: string) {
  return apiFetch<AccountListing>(
    `/api/account/listings/${listingId}/unpublish`,
    { method: "POST" },
    { baseUrl: "" },
  );
}

export async function republishAccountListing(listingId: string) {
  return apiFetch<AccountListing>(
    `/api/account/listings/${listingId}/republish`,
    { method: "POST" },
    { baseUrl: "" },
  );
}

export function listingPriceAmount(pricing: AccountListing["pricing"]): number | null {
  if (!pricing || typeof pricing !== "object") return null;
  const amount = "amount" in pricing ? pricing.amount : undefined;
  return typeof amount === "number" && Number.isFinite(amount) ? amount : null;
}

export function filsToAedInput(fils: number | null | undefined) {
  if (fils == null) return "";
  return String(fils / 100);
}
