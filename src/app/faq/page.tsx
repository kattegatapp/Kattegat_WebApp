import type { Metadata } from "next";
import Link from "next/link";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "FAQ | Kattegat",
  description: "Answers to common questions about Kattegat for buyers and service providers.",
};

const questions = [
  { q: "What is Kattegat?", a: "Kattegat is a direct marketplace for hospitality, events, and specialist business services, built in Dubai for the UAE market." },
  { q: "Who can use Kattegat?", a: "Businesses can find specialist providers. Service professionals and companies can present their capabilities and respond to relevant demand." },
  { q: "Does Kattegat take commission from bookings?", a: "Kattegat is designed around zero booking commission. Providers keep the agreed value of their work." },
  { q: "How do businesses find providers?", a: "Businesses can explore service categories, review profiles and trust signals, publish requirements, and speak directly with suitable providers." },
  { q: "How do providers join?", a: "Providers create an account, complete their service profile, add relevant capabilities, and respond to marketplace opportunities when access is available." },
  { q: "Is Kattegat only for events?", a: "No. The marketplace covers events, hospitality operations, restaurant consultancy, marketing, fit-out, lead generation, tailoring, entertainment, and related professional services." },
];

export default function FaqPage() {
  return (
    <MarketingPageShell eyebrow="Frequently asked questions" title="The useful answers, all in one place." description="Learn how the marketplace works for businesses and providers, how direct booking operates, and what kinds of services belong on Kattegat.">
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="space-y-4">
          {questions.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-brand-forest/10 bg-white p-6 open:shadow-[0_14px_40px_rgb(0_57_18/0.07)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-extrabold"><span>{item.q}</span><span className="text-xl text-brand-blue transition group-open:rotate-45">+</span></summary>
              <p className="mt-4 max-w-2xl leading-7 text-brand-forest/65">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-brand-forest/60">Still have a question? <Link href="/contact" className="font-extrabold text-brand-forest underline underline-offset-4">Contact us</Link>.</p>
      </section>
    </MarketingPageShell>
  );
}
