import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, Search, Send, UserRoundCheck } from "lucide-react";
import Link from "next/link";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = { title: "How It Works | Kattegat", description: "Learn how businesses and sellers discover, connect, and work together on Kattegat." };

export default function HowItWorksPage() {
  const steps = [{ icon: Search, title: "Explore or publish a brief", body: "Businesses browse specialists or describe exactly what they need. Sellers build structured service profiles that are easy to compare." }, { icon: UserRoundCheck, title: "Review the right fit", body: "Assess capabilities, experience, service detail, and marketplace trust signals before starting a conversation." }, { icon: MessageCircle, title: "Talk directly", body: "Share context, ask questions, and align on scope with the person or team delivering the work." }, { icon: BadgeCheck, title: "Confirm and collaborate", body: "Move forward confidently with a clear conversation trail and no commission taken from the booking." }];
  return <MarketingPageShell eyebrow="How Kattegat works" title="A shorter route from need to know-how." description="Kattegat gives businesses and specialist sellers a direct, structured way to find each other and move from first search to working relationship.">
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><ol className="grid gap-5 md:grid-cols-2">{steps.map((step, index) => <li key={step.title} className="rounded-[2rem] bg-white p-7 shadow-[0_16px_50px_rgb(0_57_18/0.07)] sm:p-9"><div className="flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-brand-mantis/20"><step.icon className="size-5" /></span><span className="text-sm font-extrabold text-brand-forest/25">0{index + 1}</span></div><h2 className="mt-10 text-2xl font-extrabold">{step.title}</h2><p className="mt-4 leading-7 text-brand-forest/65">{step.body}</p></li>)}</ol><div className="mt-12 rounded-[2rem] bg-brand-forest p-7 text-white sm:p-10"><Send className="size-6 text-brand-mantis" /><h2 className="mt-6 text-3xl font-extrabold">Ready to discuss what you need?</h2><Link href="/contact" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-brand-mantis px-6 font-extrabold text-brand-forest">Contact the Kattegat team</Link></div></section>
  </MarketingPageShell>;
}
