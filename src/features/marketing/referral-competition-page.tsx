import Link from "next/link";
import { ArrowRight, Crown, Share2, Trophy, UserPlus } from "lucide-react";

import { CompetitionCountdown } from "./competition-countdown";
import { CompetitionLeaderboard } from "./competition-leaderboard";
import { MarketingHeader } from "./marketing-header";
import { SiteFooter } from "./site-footer";
import type { PublicCompetition } from "@/lib/api/competition";
import { MoneyText } from "@/components/currency";

export function ReferralCompetitionPage({ competition }: { competition: PublicCompetition }) {
  const first = competition.prizes.find((prize) => prize.place === 1)!;
  const second = competition.prizes.find((prize) => prize.place === 2)!;
  const third = competition.prizes.find((prize) => prize.place === 3)!;
  const prizes = [second, first, third];
  const isLive = competition.status === "live";
  return (
    <div className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader />
        </div>
      </div>
      <main className="pt-24 sm:pt-28">
        <section className="relative isolate overflow-hidden border-b border-brand-forest/8 px-5 py-16 sm:px-8 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(111,219,66,0.22),transparent_32rem),radial-gradient(circle_at_90%_90%,rgba(72,220,129,0.15),transparent_30rem),linear-gradient(135deg,#ffffff,#f2faf3_58%,#eaf7ec)]" />
          <div className="pointer-events-none absolute -right-32 top-20 -z-10 size-96 rounded-full border-[55px] border-brand-mantis/8" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-mantis/25 bg-white/65 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-forest shadow-sm backdrop-blur-xl">
                <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-brand-mantis shadow-[0_0_14px_#6FDB42]" : "bg-white/40"}`} /> {isLive ? "Live now" : competition.status} · Closes {new Date(competition.endsAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Refer. Climb.
                <br />
                <span className="inline-flex flex-wrap items-center gap-2 bg-gradient-to-r from-[#C6F3CA] via-brand-mantis to-brand-emerald bg-clip-text text-transparent">
                  Win{" "}
                  <MoneyText
                    className="bg-gradient-to-r from-[#C6F3CA] via-brand-mantis to-brand-emerald bg-clip-text text-transparent"
                    symbolClassName="text-brand-mantis"
                    symbolSize={36}
                  >{`AED ${competition.prizePoolAed.toLocaleString()}`}</MoneyText>
                  .
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-brand-forest/65 sm:text-lg">Bring the UAE&apos;s best talent and venues to Kattegat. The three highest eligible referrers share the prize pool when the competition closes.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="#competition-entry" className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-mantis to-brand-emerald px-7 py-4 font-extrabold text-brand-forest shadow-[0_10px_35px_rgba(111,219,66,0.3)] transition hover:-translate-y-0.5">Join the competition <ArrowRight className="size-4" /></Link>
                <CompetitionCountdown endsAt={competition.endsAt} />
              </div>
              <p className="mt-4 text-xs text-brand-forest/50">Founding Members are eligible. Kattegat employees are not. {competition.requirePaymentToCount ? "A referral counts when its qualifying payment clears, even if signup happened earlier." : "Verified activated signups count; Pro is not required."}</p>
              <div className="mt-10 flex items-end gap-2">
                {prizes.map((prize) => (
                  <div
                    key={prize.place}
                    className={`flex min-h-36 flex-1 flex-col items-center justify-center rounded-3xl border p-4 text-center shadow-[0_16px_40px_rgb(0_57_18/0.08)] backdrop-blur-xl ${prize.place === 1 ? "min-h-44 border-[#C9A24B]/55 bg-gradient-to-b from-[#fffaf0] to-white" : "border-white/90 bg-white/65"}`}
                  >
                    {prize.place === 1 ? <Crown className="mb-2 size-6 text-[#C9A24B]" /> : null}
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${prize.place === 1 ? "text-[#9A762A]" : "text-brand-forest/55"}`}
                    >
                      {prize.place === 1 ? "1st" : prize.place === 2 ? "2nd" : "3rd"}
                    </span>
                    <MoneyText className="mt-1 text-base font-extrabold text-brand-forest sm:text-xl" symbolSize={16}>
                      {`AED ${prize.amountAed.toLocaleString()}`}
                    </MoneyText>
                    <span className="mt-1 text-[10px] text-brand-forest/50">
                      {prize.minimumActiveReferrals}+ successful referrals
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <aside id="competition-entry" className="scroll-mt-24 rounded-[2rem] border border-white/90 bg-white/70 p-5 shadow-[0_28px_80px_rgb(0_57_18/0.13)] backdrop-blur-2xl sm:p-7">
              <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><Trophy className="size-5 text-[#C9A24B]" /><h2 className="font-extrabold uppercase tracking-wider text-brand-forest">Competition leaderboard</h2></div><span className={`text-[10px] font-extrabold tracking-[0.18em] ${isLive ? "text-[#238A37]" : "text-brand-forest/45"}`}>{isLive ? "● LIVE" : competition.status.toUpperCase()}</span></div>
              <CompetitionLeaderboard />
            </aside>
          </div>
        </section>

        <section className="bg-[#F7F9F8] px-5 py-20 text-brand-forest sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">Simple by design</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">How the competition works</h2></div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {[[Share2, "Share your referral link", "Open your Kattegat account, copy your unique link, and share it anywhere."], [UserPlus, "Your referral joins", "They register as a buyer or seller through your unique referral link."], [Trophy, "They go active—you climb", "Qualified active accounts increase your count and move you up the live leaderboard."]].map(([Icon, title, copy], index) => { const StepIcon = Icon as typeof Share2; return <article key={String(title)} className="rounded-3xl border border-border bg-white p-7 shadow-[0_18px_50px_rgba(0,57,18,0.07)]"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-brand-mantis/15 text-brand-forest"><StepIcon className="size-5" /></span><span className="text-sm font-extrabold text-brand-mantis">0{index + 1}</span></div><h3 className="mt-6 text-lg font-extrabold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p></article>; })}
            </div>
            <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand-forest p-7 text-white sm:flex-row sm:items-center"><div><h3 className="text-xl font-extrabold">Ready to enter the race?</h3><p className="mt-1 text-sm text-white/65">Your existing Kattegat referral link is your competition link.</p></div><Link href="/account?view=referrals" className="inline-flex items-center gap-2 rounded-2xl bg-brand-mantis px-6 py-3 font-extrabold text-brand-forest">Get my link <ArrowRight className="size-4" /></Link></div>
            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">Competition closes 30 January 2027 at 23:59 GST. Prize thresholds, eligibility and tie-breaking rules apply. <Link href="/terms-of-service" className="font-bold text-brand-blue underline underline-offset-4">Read full terms</Link>.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
