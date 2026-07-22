"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { LockKeyhole, Trophy } from "lucide-react";

import { useState } from "react";
import { fetchCompetitionLeaderboard, fetchReferralCompetition, joinReferralCompetition } from "@/lib/api/account-referrals";

export function CompetitionLeaderboard() {
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);
  const competition = useQuery({ queryKey: ["account", "referrals", "competition"], queryFn: fetchReferralCompetition, retry: false });
  const joined = competition.data?.participant.joined === true && competition.data.participant.termsCurrent;
  const leaderboard = useQuery({
    queryKey: ["account", "referrals", "competition-leaderboard"],
    queryFn: fetchCompetitionLeaderboard,
    enabled: joined,
    retry: false,
    refetchInterval: joined ? 15_000 : false,
  });
  const join = useMutation({
    mutationFn: () => {
      if (!competition.data) throw new Error("Competition configuration unavailable");
      return joinReferralCompetition({ documentId: competition.data.documentId, termsVersion: competition.data.termsVersion });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "referrals", "competition"], data);
      void queryClient.invalidateQueries({ queryKey: ["account", "referrals", "competition-leaderboard"] });
    },
  });

  if (competition.isPending || (joined && leaderboard.isPending)) {
    return <div className="space-y-2" aria-label="Loading leaderboard">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl border border-brand-forest/8 bg-brand-forest/5" />)}</div>;
  }

  if (competition.isError) {
    return (
      <div className="rounded-3xl border border-brand-forest/10 bg-white/55 px-6 py-10 text-center">
        <LockKeyhole className="mx-auto size-8 text-brand-mantis" />
        <h3 className="mt-4 font-extrabold">Sign in to see the live standings</h3>
        <p className="mt-2 text-sm leading-6 text-brand-forest/55">Leaderboard names and personal positions are available to Kattegat members.</p>
        <Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand-mantis px-5 py-2.5 text-sm font-extrabold text-brand-forest">Sign in</Link>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="rounded-3xl border border-brand-mantis/30 bg-brand-mantis/5 p-6">
        <h3 className="font-extrabold">Accept the rules to join</h3>
        <p className="mt-2 text-sm leading-6 text-brand-forest/60">Only members who explicitly accept the competition terms participate. Referrals made before acceptance do not enter the contest.</p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-brand-forest">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 accent-[#6FDB42]" />
          <span>I have read and accept the <Link href="/competition/terms" className="font-bold text-brand-mantis underline underline-offset-4">Referral Competition Terms & Conditions</Link>.</span>
        </label>
        <button type="button" disabled={!accepted || join.isPending || competition.data?.status !== "live"} onClick={() => join.mutate()} className="mt-5 w-full rounded-xl bg-brand-mantis px-5 py-3 font-extrabold text-brand-forest disabled:cursor-not-allowed disabled:opacity-40">{join.isPending ? "Joining…" : competition.data?.status === "live" ? "Accept terms and join" : `Competition ${competition.data?.status}`}</button>
        {join.isError ? <p className="mt-3 text-sm text-red-700">We couldn&apos;t join the competition. Please try again.</p> : null}
      </div>
    );
  }

  if (leaderboard.isError || !leaderboard.data?.entries.length) {
    return <div className="rounded-3xl border border-brand-forest/10 bg-white/55 px-6 py-10 text-center"><Trophy className="mx-auto size-8 text-brand-mantis" /><h3 className="mt-4 font-extrabold">The competition is wide open</h3><p className="mt-2 text-sm text-brand-forest/55">Share your referral link to become the first contender.</p></div>;
  }

  const entries = leaderboard.data.entries.slice(0, 6);
  const listedCurrentUser = entries.some((entry) => entry.isCurrentUser);
  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-brand-forest/8 bg-brand-forest/5 px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest/55">Accepted participants</span>
        <strong className="text-[#238A37]">{leaderboard.data.totalParticipants.toLocaleString()}</strong>
      </div>
      {entries.map((entry) => (
        <div key={entry.userId} className={`flex items-center gap-3 rounded-2xl border p-3 ${entry.isCurrentUser ? "border-brand-mantis/60 bg-brand-mantis/10" : entry.rank === 1 ? "border-[#C9A24B]/45 bg-[#C9A24B]/10" : "border-brand-forest/8 bg-white/60"}`}>
          <strong className={`w-6 text-center text-sm ${entry.rank === 1 ? "text-[#9A762A]" : "text-brand-forest/55"}`}>{entry.rank}</strong>
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#C6F3CA] to-brand-mantis text-xs font-extrabold text-brand-forest">{entry.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
          <span className="flex-1 truncate font-bold">{entry.isCurrentUser ? "You" : entry.displayName}</span>
          <strong className="text-[#238A37]">{entry.referralCount} <small className="font-medium text-brand-forest/45">active</small></strong>
        </div>
      ))}
      {!listedCurrentUser && leaderboard.data.currentUser ? (
        <><div className="py-1 text-center text-[10px] font-bold uppercase tracking-widest text-brand-forest/45">Your position</div><div className="flex items-center gap-3 rounded-2xl border border-brand-mantis/60 bg-brand-mantis/10 p-3"><strong className="w-6 text-center text-sm text-brand-forest/55">{leaderboard.data.currentUser.rank}</strong><Trophy className="size-8 rounded-full bg-brand-mantis/15 p-2 text-[#238A37]" /><span className="flex-1 font-bold">You</span><strong className="text-[#238A37]">{leaderboard.data.currentUser.referralCount} <small className="font-medium text-brand-forest/45">active</small></strong></div></>
      ) : null}
      <Link href="/account?view=referrals" className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-mantis px-5 py-3 font-extrabold text-brand-forest">Get my referral link</Link>
    </div>
  );
}
