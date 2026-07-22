import { ApiRequestError, apiFetch } from "@/lib/api/client";
import { billingApiUrl } from "@/lib/billing/session";
import { getMemberAccessToken } from "@/lib/auth/session";
import { isStaffAccount } from "@/lib/auth/member-gate";

export type AccountUser = {
  id: string;
  email: string;
  bid: string | null;
  sid: string | null;
  originalRole: string;
  phone: string | null;
  username: string | null;
  businessName: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  isAdmin?: boolean;
  adminRole?: string | null;
};

export type SellerProfileSummary = {
  userId: string;
  sid: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  socialLinks: Record<string, string>;
  tags: string[];
  customSlug: string | null;
  tier: "starter" | "pro" | "white_glove" | string;
  aggregateRating: number;
  reviewCount: number;
  vatRegistered: boolean;
  badges: string[];
  profileMedia?: Array<{
    id: string;
    type: "photo" | "video_link";
    url: string;
    sortOrder: number;
  }>;
};

export type AccountListing = {
  id: string;
  sellerId?: string;
  categoryId?: string;
  subcategoryId?: string;
  title: string;
  description: string | null;
  location: string | null;
  pricing?: { amount?: number; unit?: string } | Record<string, unknown>;
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
  status: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverImage?: string | null;
};

export type BuyerProfileSummary = {
  userId: string;
  bid: string;
  favoriteSellerIds: string[];
  savedListingIds: string[];
  savedRequirementIds: string[];
};

export type ReferralSummary = {
  code: string;
  shareUrl: string;
  wallet: {
    memberId: string;
    totalEarned: number;
    thisMonth: number;
    pending: number;
    paidOut: number;
  };
  activeReferrals: number;
  tier: string;
};

export type AccountDashboard = {
  user: AccountUser;
  sellerProfile: SellerProfileSummary | null;
  listings: AccountListing[];
  buyerProfile: BuyerProfileSummary | null;
  referral: ReferralSummary | null;
};

async function memberFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const response = await fetch(billingApiUrl(path), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) return null;
    return payload.data as T;
  } catch {
    return null;
  }
}

/** Server-side account aggregate — soft-fails identity sections the account does not hold. */
export async function loadAccountDashboard(): Promise<AccountDashboard | null> {
  const token = await getMemberAccessToken();
  if (!token) return null;

  const user = await memberFetch<AccountUser>("/users/me", token);
  if (!user?.id) return null;
  if (isStaffAccount(user)) return null;

  const [sellerProfile, listings, buyerProfile, referral] = await Promise.all([
    user.sid ? memberFetch<SellerProfileSummary>("/sellers/me/profile", token) : Promise.resolve(null),
    user.sid ? memberFetch<AccountListing[]>("/sellers/me/listings", token) : Promise.resolve(null),
    user.bid ? memberFetch<BuyerProfileSummary>("/buyers/me/profile", token) : Promise.resolve(null),
    memberFetch<ReferralSummary>("/referral/summary", token),
  ]);

  return {
    user,
    sellerProfile: sellerProfile ?? null,
    listings: listings ?? [],
    buyerProfile: buyerProfile ?? null,
    referral: referral ?? null,
  };
}

export async function fetchAccountMe() {
  return apiFetch<AccountUser>("/api/account/me", undefined, { baseUrl: "" });
}

export async function fetchAccountSellerProfile() {
  return apiFetch<SellerProfileSummary>("/api/account/seller-profile", undefined, { baseUrl: "" });
}

export async function fetchAccountListings() {
  return apiFetch<AccountListing[]>("/api/account/listings", undefined, { baseUrl: "" });
}

export async function fetchAccountBuyerProfile() {
  return apiFetch<BuyerProfileSummary>("/api/account/buyer-profile", undefined, { baseUrl: "" });
}

export function isAccountForbidden(error: unknown) {
  return error instanceof ApiRequestError && (error.status === 403 || error.code === "SELLER_ONLY" || error.code === "BUYER_ONLY");
}
