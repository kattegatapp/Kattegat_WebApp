import { apiFetch } from "@/lib/api/client";

export type PublicCompetition = {
  id: string; documentId: string; termsVersion: string; title: string; startsAt: string; endsAt: string;
  prizePoolAed: number; status: "upcoming" | "live" | "paused" | "ended" | "cancelled";
  prizes: { place: 1 | 2 | 3; amountAed: number; minimumActiveReferrals: number }[];
};

export const FALLBACK_COMPETITION: PublicCompetition = {
  id: "KTG-COMP-001", documentId: "KTG-COMP-001", termsVersion: "v1.0", title: "Kattegat Referral Competition",
  startsAt: "2026-07-18T00:00:00+04:00", endsAt: "2027-01-30T23:59:00+04:00", prizePoolAed: 30000, status: "live",
  prizes: [{ place: 1, amountAed: 15000, minimumActiveReferrals: 100 }, { place: 2, amountAed: 10000, minimumActiveReferrals: 50 }, { place: 3, amountAed: 5000, minimumActiveReferrals: 25 }],
};

export async function fetchPublicCompetition(): Promise<PublicCompetition> {
  try { return await apiFetch<PublicCompetition>("/referral/competition/public"); }
  catch { return FALLBACK_COMPETITION; }
}
