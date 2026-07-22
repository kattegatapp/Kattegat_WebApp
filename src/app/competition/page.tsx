import type { Metadata } from "next";

import { ReferralCompetitionPage } from "@/features/marketing/referral-competition-page";
import { fetchPublicCompetition } from "@/lib/api/competition";

export const metadata: Metadata = {
  title: "Referral Competition | Win AED 30,000 | Kattegat",
  description: "Refer active buyers and sellers to Kattegat, climb the live leaderboard, and compete for a share of AED 30,000.",
  openGraph: {
    title: "Kattegat Referral Competition — AED 30,000",
    description: "Refer. Climb. Win a share of AED 30,000.",
  },
};

export default async function CompetitionPage() {
  return <ReferralCompetitionPage competition={await fetchPublicCompetition()} />;
}
