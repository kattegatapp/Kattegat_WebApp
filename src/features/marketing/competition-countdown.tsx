"use client";

import { useEffect, useState } from "react";

function remaining(now: number, endsAt: string) {
  const value = Math.max(0, new Date(endsAt).getTime() - now);
  return {
    days: Math.floor(value / 86_400_000),
    hours: Math.floor((value % 86_400_000) / 3_600_000),
    minutes: Math.floor((value % 3_600_000) / 60_000),
    seconds: Math.floor((value % 60_000) / 1000),
  };
}

export function CompetitionCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = remaining(now, endsAt);
  const finished = Object.values(time).every((value) => value === 0);
  return (
    <div className="flex flex-wrap gap-2" aria-label={finished ? "Competition countdown has ended" : `${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds remaining`}>
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className="min-w-[4.25rem] rounded-2xl border border-brand-forest/10 bg-white/70 px-3 py-2.5 text-center shadow-[0_8px_24px_rgb(0_57_18/0.08),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-xl">
          <strong className="block text-xl font-extrabold tabular-nums text-brand-forest">{String(value).padStart(2, "0")}</strong>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-forest/55">{label === "minutes" ? "Min" : label === "seconds" ? "Sec" : label}</span>
        </div>
      ))}
      {finished ? <span className="w-full pt-1 text-xs font-bold uppercase tracking-widest text-brand-forest/60">Competition closed</span> : null}
    </div>
  );
}
