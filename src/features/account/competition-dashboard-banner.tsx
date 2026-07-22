"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FALLBACK_COMPETITION,
  type PublicCompetition,
} from "@/lib/api/competition";

type CompetitionDashboardBannerProps = {
  activeReferrals?: number;
  href?: string;
  ctaLabel?: string;
  compact?: boolean;
  authAware?: boolean;
};

function timeLeft(endsAt: string, now: number | null) {
  const remaining = now === null ? 0 : Math.max(0, new Date(endsAt).getTime() - now);
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1_000),
  };
}

function Laurel({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 34 56" aria-hidden className={`h-12 w-7 shrink-0 ${mirrored ? "-scale-x-100" : ""}`} fill="none">
      <path d="M28 4C16 12 10 24 12 40c1 7 4 11 8 14" stroke="#6FDB42" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 12c4 1 7-1 8-5-4-1-7 1-8 5Zm-3 9c4 1 7-1 8-5-4-1-7 1-8 5Zm-1 9c4 1 7-1 8-5-4-1-7 1-8 5Z" fill="#6FDB42" />
    </svg>
  );
}

export function CompetitionDashboardBanner({
  activeReferrals,
  href = "/competition",
  ctaLabel = "Join now",
  compact = false,
  authAware = false,
}: CompetitionDashboardBannerProps) {
  const [competition, setCompetition] = useState<PublicCompetition>(FALLBACK_COMPETITION);
  const [now, setNow] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/competition", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const value = payload?.data ?? payload;
        if (active && value?.id) setCompetition(value as PublicCompetition);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authAware) return;
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => {
        if (active) setIsLoggedIn(response.ok);
      })
      .catch(() => {
        if (active) setIsLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, [authAware]);

  useEffect(() => {
    const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  if (competition.status === "cancelled") return null;
  const countdown = timeLeft(competition.endsAt, now);
  const bannerHref = authAware
    ? isLoggedIn
      ? "/competition"
      : "/login?next=%2Fcompetition"
    : href;
  const bannerCta = authAware
    ? isLoggedIn
      ? "Join competition"
      : "Log in to join"
    : ctaLabel;

  return (
    <Link
      href={bannerHref}
      aria-label="Open the Kattegat referral competition"
      className={`group relative grid items-center overflow-hidden border border-[#C9A24B]/55 bg-[radial-gradient(circle_at_88%_12%,rgba(111,219,66,0.20),transparent_32%),linear-gradient(115deg,#082914,#003912_52%,#061f0e)] text-white transition hover:-translate-y-0.5 hover:border-[#C9A24B]/80 ${compact ? "min-h-24 grid-cols-[auto_1fr_auto] gap-3 rounded-2xl p-4 shadow-[0_8px_24px_rgba(64,54,19,0.14)] sm:gap-4 sm:px-5" : "min-h-28 gap-4 rounded-[1.35rem] p-4 shadow-[0_12px_36px_rgba(64,54,19,0.15)] hover:shadow-[0_16px_42px_rgba(64,54,19,0.22)] sm:grid-cols-[auto_1fr_auto_auto] sm:gap-6 sm:px-6"}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#E6C970] to-transparent" />
      <span className={`flex items-center justify-center ${compact ? "gap-0" : "gap-1"}`}>
        {!compact ? <Laurel /> : null}
        <span className={`whitespace-nowrap bg-gradient-to-r from-[#C6F3CA] via-brand-mantis to-brand-emerald bg-clip-text font-extrabold tracking-tight text-transparent ${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>
          <small className="mr-1 text-[10px] tracking-widest">AED</small>{competition.prizePoolAed.toLocaleString()}
        </span>
        {!compact ? <Laurel mirrored /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#E6C970]">
          {competition.status === "live" ? (
            <span className="size-2 rounded-full bg-brand-mantis shadow-[0_0_12px_rgba(111,219,66,0.9)] motion-safe:animate-pulse" />
          ) : null}
          Referral competition · {competition.status}
        </span>
        <span className={`mt-1 block font-extrabold text-white ${compact ? "text-sm" : "text-base"}`}>Refer, climb and win</span>
        <span className="mt-1 block truncate text-xs text-[#C6F3CA]/80 sm:text-sm">
          {activeReferrals !== undefined
            ? "Verified signups count · Join and view the standings"
            : "Accept the rules, join and climb the leaderboard"}
        </span>
        {competition.status === "live" && compact ? (
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#E6C970] tabular-nums">
            {countdown.days}D · {String(countdown.hours).padStart(2, "0")}H · {String(countdown.minutes).padStart(2, "0")}M · {String(countdown.seconds).padStart(2, "0")}S
          </span>
        ) : null}
        {competition.status === "live" && !compact ? (
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#E6C970] tabular-nums md:hidden">
            {countdown.days}D · {String(countdown.hours).padStart(2, "0")}H · {String(countdown.minutes).padStart(2, "0")}M · {String(countdown.seconds).padStart(2, "0")}S
          </span>
        ) : null}
      </span>
      {competition.status === "live" && !compact ? (
        <span className="hidden items-center gap-2 md:flex" aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes and ${countdown.seconds} seconds remaining`}>
          {[["D", countdown.days], ["H", countdown.hours], ["M", countdown.minutes], ["S", countdown.seconds]].map(([label, value]) => (
            <span key={label} className="min-w-11 rounded-xl border border-white/15 bg-white/8 px-2 py-1.5 text-center">
              <b className="block text-sm tabular-nums text-white">{String(value).padStart(2, "0")}</b>
              <small className="block text-[8px] font-bold tracking-widest text-[#C6F3CA]/75">{label}</small>
            </span>
          ))}
        </span>
      ) : null}
      <span className={`flex items-center justify-self-end rounded-full bg-gradient-to-r from-brand-mantis to-brand-emerald font-extrabold text-brand-forest ${compact ? "size-9 justify-center p-0" : "gap-2 px-4 py-2 text-xs"}`}>
        {!compact ? bannerCta : <span className="sr-only">{bannerCta}</span>}
        <ArrowRight className={`${compact ? "size-4" : "size-3.5"} transition group-hover:translate-x-0.5`} />
      </span>
    </Link>
  );
}
