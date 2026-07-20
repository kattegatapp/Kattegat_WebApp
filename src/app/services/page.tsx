import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { dubaiHrefForQuery } from "@/features/marketing/local-seo";
import { MarketingPageShell } from "@/features/marketing/marketing-page-shell";
import { SERVICE_CATEGORIES } from "@/features/marketing/service-categories";

export const metadata: Metadata = {
  title: "Services | Kattegat",
  description:
    "Explore hospitality, events, marketing, fit-out, and specialist services on Kattegat.",
};

function categoryHref(query: string) {
  return dubaiHrefForQuery(query) ?? `/search?category=${encodeURIComponent(query)}`;
}

export default function ServicesPage() {
  return (
    <MarketingPageShell
      eyebrow="Marketplace categories"
      title="The specialists behind exceptional hospitality."
      description="Explore professional services built around how venues, events, and hospitality teams actually operate. Pick a category to browse live listings in Dubai."
    >
      <section className="relative isolate overflow-x-clip bg-white">
        <div aria-hidden className="marketing-section-bg">
          <div className="category-grid absolute inset-0 opacity-40" />
          <div className="absolute -left-32 top-8 size-[26rem] rounded-full bg-brand-mantis/18 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-[24rem] rounded-full bg-brand-blue/12 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                {SERVICE_CATEGORIES.length} live categories
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl">
                Pick a path into the marketplace
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-brand-forest/60 sm:text-base">
                Tap a category to see who&apos;s live on Kattegat — then continue in the app to
                message and book directly.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-extrabold text-brand-forest transition hover:text-brand-blue"
            >
              Open full search
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((service) => (
              <Link
                key={service.title}
                href={categoryHref(service.query)}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-brand-forest shadow-[0_12px_40px_rgb(0_57_18/0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgb(0_57_18/0.14)]"
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/90 via-brand-forest/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                  <h2 className="text-sm font-extrabold tracking-[-0.02em] text-white sm:text-base">
                    {service.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/70 sm:mt-1.5 sm:text-[13px] sm:leading-6">
                    {service.body}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-mantis sm:mt-3 sm:text-[11px]">
                    Browse
                    <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="glass-panel mt-12 flex flex-col gap-5 rounded-[1.5rem] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-brand-mantis sm:size-12">
                <Search className="size-5" />
              </span>
              <div>
                <p className="text-base font-extrabold tracking-[-0.02em] sm:text-lg">
                  Not sure which category fits?
                </p>
                <p className="mt-1 max-w-md text-sm leading-7 text-brand-forest/60">
                  Search across all listings, or tell us what you need and we&apos;ll point you in
                  the right direction.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:min-w-[17rem]">
              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest transition hover:bg-brand-emerald"
              >
                Search marketplace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-brand-forest/15 bg-white px-6 text-sm font-extrabold transition hover:border-brand-mantis/50"
              >
                Get help finding a service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
