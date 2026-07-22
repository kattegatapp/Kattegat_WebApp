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

export type ReferralCompetitionStatus = {
  id: string;
  documentId: string;
  termsVersion: string;
  title: string;
  startsAt: string;
  endsAt: string;
  prizePoolAed: number;
  prizes: Array<{ place: 1 | 2 | 3; amountAed: number; minimumActiveReferrals: number }>;
  status: "upcoming" | "live" | "paused" | "ended" | "cancelled";
  participant: { joined: boolean; acceptedAt: string | null; termsCurrent: boolean; eligible: boolean };
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

export async function fetchReferralCompetition() {
  return apiFetch<ReferralCompetitionStatus>("/api/account/referrals/competition", undefined, { baseUrl: "" });
}

export async function joinReferralCompetition(input: { documentId: string; termsVersion: string }) {
  return apiFetch<ReferralCompetitionStatus>("/api/account/referrals/competition/join", {
    method: "POST",
    body: JSON.stringify({ acceptedDocumentId: input.documentId, acceptedTermsVersion: input.termsVersion, accepted: true }),
  }, { baseUrl: "" });
}

export async function fetchCompetitionLeaderboard() {
  return apiFetch<ReferralLeaderboardResult>("/api/account/referrals/competition/leaderboard", undefined, { baseUrl: "" });
}
