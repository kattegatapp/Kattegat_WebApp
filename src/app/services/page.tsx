import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";

export const metadata: Metadata = { title: "Services | Kattegat", description: "Explore hospitality, events, marketing, fit-out, and specialist services on Kattegat." };

const services = [
  ["Restaurant Consultancy", "Concept, menu, operations, and guest experience.", "/assets/service-categories/restaurant-consultancy.png"],
  ["Event Management", "Planning and delivery for experiences of every scale.", "/assets/service-categories/event-management.png"],
  ["Entertainment Services", "Performers, hosts, DJs, and production talent.", "/assets/service-categories/entertainment-services.png"],
  ["Marketing Services", "Strategy, creative, campaigns, and content partners.", "/assets/service-categories/marketing-services.png"],
  ["Fit-Out Subcontractor", "Specialist teams for venues and event spaces.", "/assets/service-categories/fit-out-subcontractor.png"],
  ["Shisha Outsourcing", "Premium shisha operations and service teams.", "/assets/service-categories/shisha-outsourcing.png"],
  ["Tailor Services", "Uniform, wardrobe, alterations, and bespoke work.", "/assets/service-categories/tailor-services.png"],
  ["Lead Generation", "Commercial growth and qualified opportunity support.", "/assets/service-categories/lead-generation.png"],
] as const;

export default function ServicesPage() {
  return <MarketingPageShell eyebrow="Marketplace categories" title="The specialists behind exceptional hospitality." description="Explore professional services built around how venues, events, and hospitality teams actually operate.">
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:grid-cols-2 sm:px-8 sm:py-24 lg:grid-cols-4">
      {services.map(([title, body, image]) => <article key={title} className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgb(0_57_18/0.08)]"><div className="relative aspect-[.72]"><Image src={image} alt={title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover" /></div><div className="p-5"><h2 className="text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-brand-forest/60">{body}</p></div></article>)}
    </section>
    <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24"><Link href="/contact" className="inline-flex min-h-13 items-center gap-3 rounded-2xl bg-brand-forest px-7 py-3 font-extrabold text-white">Need help finding a service? <ArrowRight className="size-4" /></Link></div>
  </MarketingPageShell>;
}
