import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = { title: "About | Kattegat", description: "Why Kattegat is building a more direct marketplace for Dubai hospitality and events." };

export default function AboutPage() {
  const values = [{ icon: MessageCircle, title: "Direct by design", body: "The people making the decisions speak to the people doing the work." }, { icon: BadgeCheck, title: "Professional clarity", body: "Structured profiles and briefs make it easier to understand fit before the first call." }, { icon: ShieldCheck, title: "Trust matters", body: "Marketplace signals, moderation, and clear conversation trails support better decisions." }];
  return <MarketingPageShell eyebrow="About Kattegat" title="Built for the people who make hospitality happen." description="Kattegat is a Dubai-built marketplace connecting businesses and specialist providers directly—without an agency sitting between the brief and the work.">
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Better connections create better work.</h2><div className="space-y-5 text-base leading-8 text-brand-forest/65"><p>Hospitality moves quickly. Teams change, briefs evolve, and the right specialist can determine whether an experience feels ordinary or exceptional.</p><p>We are building Kattegat so buyers can discover capable people with clarity, while providers can present their work, access relevant demand, and keep the full value of what they earn.</p></div></div><div className="mt-16 grid gap-5 md:grid-cols-3">{values.map((item) => <article key={item.title} className="rounded-[2rem] bg-white p-7 shadow-[0_16px_50px_rgb(0_57_18/0.07)]"><item.icon className="size-6 text-brand-blue" /><h3 className="mt-8 text-xl font-extrabold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-brand-forest/60">{item.body}</p></article>)}</div></section>
  </MarketingPageShell>;
}
