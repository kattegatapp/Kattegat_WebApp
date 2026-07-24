import type { Metadata } from "next";
import Link from "next/link";

import { MoneyText } from "@/components/currency";

export const metadata: Metadata = { title: "Referral Competition Terms | Kattegat", description: "Official Kattegat Referral Competition Terms and Conditions v1.0." };

const sections = [
  ["1. The Organizer", "This competition is operated by Hidden Diversion Recreational Services, Dubai, United Arab Emirates, trading as Kattegat."],
  ["2. The Competition", "Kattegat is awarding AED 30,000: AED 15,000 for first place, AED 10,000 for second place, and AED 5,000 for third place."],
  ["3. Competition Period", "The competition closes at 23:59 Gulf Standard Time on 30 January 2027. Only successful referrals attributed after a member accepts these terms and joins, and before the closing time, count."],
  ["4. Who May Enter", "Registered Kattegat members with an active referral code may enter by explicitly accepting these terms. Kattegat employees, owners, management, and their immediate family members are not eligible for prizes."],
  ["5. What Counts", "A successful competition referral is a new member who signed up through your referral link or code during the competition period and activated their Kattegat account. The competition screen shows whether verified activation is sufficient or a qualifying payment is currently required. When payment qualification is enabled, a referral made before payment still counts after that payment clears. Unverified, fake, duplicate, self-referred, suspended, banned, or deleted accounts do not count."],
  ["6. Qualifying Thresholds", "A participant needs at least 100 successful referrals for first place, 50 for second place, or 25 for third place."],
  ["7. How Winners Are Decided", "Participants are ranked by successful referrals. A tie is resolved in favour of the participant who reached the tied count first. Each participant may win only one prize."],
  ["8. Unclaimed Prizes", "If no participant meets a prize threshold, that prize is not awarded and is added to the next Kattegat referral competition prize pool."],
  ["9. Verification and Fair Play", "Counts are reviewed before prizes are paid. Kattegat may check account verification, signup attribution, device and usage patterns, contact details, and other fraud indicators. Self-referrals, fake or duplicate accounts, circular arrangements, automated signups, and fraud may be removed and may result in disqualification."],
  ["10. Announcement and Payment", "Winners are announced within 14 days after closing and paid in AED by bank transfer within 30 days of announcement, subject to identity verification."],
  ["11. Changes", "Kattegat may amend, extend, or end the competition with 14 days' notice in the app. Referrals made before a change remain counted."],
  ["12. General", "The competition does not affect standard referral earnings. These terms are governed by the laws of the United Arab Emirates."],
] as const;

export default function CompetitionTermsPage() {
  return <main className="min-h-screen bg-[#F7F9F8] px-5 py-12 text-brand-forest sm:px-8"><article className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-white p-7 shadow-xl sm:p-12"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">Official competition rules</p><h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Referral Competition Terms &amp; Conditions</h1><div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><span><b>Version:</b> v1.0</span><span><b>Issued:</b> 18 July 2026</span><span><b>Closes:</b> 30 January 2027</span></div><div className="mt-10 space-y-7">{sections.map(([title, body]) => <section key={title}><h2 className="text-lg font-extrabold">{title}</h2><MoneyText className="mt-2 leading-7 text-muted-foreground">{body}</MoneyText></section>)}</div><div className="mt-10 border-t border-border pt-7"><Link href="/competition" className="inline-flex rounded-xl bg-brand-mantis px-6 py-3 font-extrabold text-brand-forest">Back to competition</Link></div></article></main>;
}
