import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { SERVICE_CATEGORIES } from "@/features/marketing/service-categories";

export const metadata: Metadata = {
  title: "Services | Kattegat",
  description:
    "Explore hospitality, events, marketing, fit-out, and specialist services on Kattegat.",
};

export default function ServicesPage() {
  return (
    <MarketingPageShell
      eyebrow="Marketplace categories"
      title="The specialists behind exceptional hospitality."
      description="Explore professional services built around how venues, events, and hospitality teams actually operate. Pick a category to search live listings."
    >
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:grid-cols-2 sm:px-8 sm:py-24 lg:grid-cols-4">
        {SERVICE_CATEGORIES.map((service) => (
          <Link
            key={service.title}
            href={`/search?category=${encodeURIComponent(service.query)}`}
            className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgb(0_57_18/0.08)] transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-[.72]">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-extrabold">{service.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-forest/60">{service.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-blue">
                Search this category <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 pb-16 sm:px-8 sm:pb-24">
        <Link
          href="/search"
          className="inline-flex min-h-13 items-center gap-3 rounded-2xl bg-brand-forest px-7 py-3 font-extrabold text-white"
        >
          Open search <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-13 items-center gap-3 rounded-2xl border border-brand-forest/15 bg-white px-7 py-3 font-extrabold"
        >
          Need help finding a service?
        </Link>
      </div>
    </MarketingPageShell>
  );
}
