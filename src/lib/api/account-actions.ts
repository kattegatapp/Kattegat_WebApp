import { apiFetch } from "@/lib/api/client";

import type { AccountUser, SellerProfileSummary } from "./account";

export async function updateAccountProfile(input: {
  username?: string;
  phone?: string;
  businessName?: string;
}) {
  return apiFetch<AccountUser>(
    "/api/account/me",
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function updateSellerProfile(input: {
  displayName?: string;
  bio?: string;
}) {
  return apiFetch<SellerProfileSummary>(
    "/api/account/seller-profile",
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
