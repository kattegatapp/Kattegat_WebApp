import { apiFetch } from "@/lib/api/client";
import type { ReferralSummary } from "@/lib/api/account";

export type ReferredUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "buyer" | "seller";
  tier: "starter" | "pro" | "white_glove" | null;
  isSubscribed: boolean;
  joinedAt: string;
};

export type ReferralLeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  referralCount: number;
  rank: number;
  isCurrentUser: boolean;
};

export type ReferralLeaderboardResult = {
  entries: ReferralLeaderboardEntry[];
  totalParticipants: number;
  currentUser: ReferralLeaderboardEntry | null;
};

export async function fetchAccountReferralSummary() {
  return apiFetch<ReferralSummary>("/api/account/referrals", undefined, { baseUrl: "" });
}

export async function fetchReferredUsers() {
  return apiFetch<ReferredUser[]>("/api/account/referrals/referred-users", undefined, { baseUrl: "" });
}

export async function fetchReferralLeaderboard() {
  return apiFetch<ReferralLeaderboardResult>("/api/account/referrals/leaderboard", undefined, { baseUrl: "" });
}
