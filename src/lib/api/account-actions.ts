import { apiFetch } from "@/lib/api/client";

import type { AccountUser, SellerProfileSummary } from "./account";

export async function updateAccountProfile(input: {
  username?: string;
  phone?: string;
  businessName?: string;
  avatarUrl?: string;
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
  tags?: string[];
  socialLinks?: Record<string, string>;
  profileMedia?: Array<{
    id?: string;
    type: "photo" | "video_link";
    url: string;
    sortOrder: number;
  }>;
}) {
  return apiFetch<SellerProfileSummary>(
    "/api/account/seller-profile",
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
