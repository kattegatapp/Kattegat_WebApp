import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Star } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import {
  DUBAI_SEO_PAGES,
  dubaiPageDescription,
  dubaiPageTitle,
  getDubaiSeoPage,
} from "@/features/marketing/local-seo";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import {
  getCatalogCategories,
  searchListings,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import { cloudinaryCrop } from "@/lib/cloudinary";
import { listingPublicPath } from "@/lib/navigation/public-paths";
import { getSiteOrigin, jsonLdScript } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DUBAI_SEO_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDubaiSeoPage(slug);
  if (!page) return { title: "Not found | Kattegat", robots: { index: false } };

  const origin = await getSiteOrigin();
  const title = dubaiPageTitle(page);
  const description = dubaiPageDescription(page);

  return {
    title,
    description,
    alternates: { canonical: `${origin}/dubai/${page.slug}` },
    openGraph: {
      title,
      description,
      url: `${origin}/dubai/${page.slug}`,
    },
  };
}

function isDubaiLocation(location: string | null) {
  if (!location) return true; // keep listings without location in local browse
  return /dubai|uae|united arab emirates|dxb/i.test(location);
}

export default async function DubaiLocalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getDubaiSeoPage(slug);
  if (!page) notFound();

  const [settings, origin, categories, search] = await Promise.all([
    getPublicAppSettings(),
    getSiteOrigin(),
    getCatalogCategories(),
    searchListings({ q: page.searchQuery, pageSize: 24, sort: "recommended" }),
  ]);

  const matchedCategory = categories.find(
    (category) =>
      category.slug === page.categoryQuery.toLowerCase().replace(/\s+/g, "-") ||
      category.name.toLowerCase() === page.categoryQuery.toLowerCase() ||
      category.name.toLowerCase().includes(page.categoryQuery.toLowerCase()),
  );

  const listings = search.items.filter((item) => isDubaiLocation(item.location));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.headline,
    description: page.intro,
    url: `${origin}/dubai/${page.slug}`,
    areaServed: "Dubai, UAE",
  };

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-forest/45">
          <Link href="/" className="hover:text-brand-blue">
            Home
          </Link>
          <span>/</span>
          <Link href="/dubai" className="hover:text-brand-blue">
            Dubai
          </Link>
          <span>/</span>
          <span className="text-brand-forest/70">{page.name}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
              Dubai · {page.name}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              {page.headline}
            </h1>
            <p className="mt-4 text-base leading-7 text-brand-forest/60">{page.intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ContinueInApp
              title="Download the app to continue"
              description={`Browse ${page.pluralLabel} in Dubai and message sellers inside Kattegat.`}
              deepLinkPath={`/search`}
              webOrigin={origin}
              appStoreUrl={settings.links.appStoreUrl}
              playStoreUrl={settings.links.playStoreUrl}
              mobileAppUrl={settings.links.mobileAppUrl}
            />
            <Link
              href={`/search?q=${encodeURIComponent(page.searchQuery)}`}
              className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
            >
              Filter in search
            </Link>
          </div>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {page.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-2 rounded-2xl border border-brand-forest/10 bg-white px-4 py-3 text-sm font-semibold text-brand-forest/70"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-brand-mantis" />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-3 border-b border-brand-forest/10 pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
              Live listings
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
              {listings.length} {page.pluralLabel} on Kattegat
            </h2>
          </div>
          {matchedCategory ? (
            <Link
              href={`/category/${matchedCategory.slug}`}
              className="text-sm font-extrabold text-brand-blue hover:underline"
            >
              Full {matchedCategory.name} category
            </Link>
          ) : null}
        </div>

        {listings.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-brand-forest/60">
            No matching live listings yet. Check back soon, or browse{" "}
            <Link href="/search" className="font-extrabold text-brand-blue hover:underline">
              all services
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-brand-forest/10">
            {listings.map((item) => {
              const image = item.coverImage || item.sellerAvatarUrl;
              return (
                <li key={item.id}>
                  <Link
                    href={listingPublicPath({ id: item.id, title: item.title })}
                    className="group flex gap-4 py-5 transition hover:bg-white/70 sm:gap-5 sm:rounded-2xl sm:px-3"
                  >
                    <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-[#EEF2F0] sm:size-24">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote media
                        <img src={cloudinaryCrop(image, "1:1", "auto")} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] font-extrabold text-brand-forest/30">
                          KG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-extrabold tracking-[-0.02em] group-hover:text-brand-blue sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-brand-forest/60">
                        {item.description || item.sellerName}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-brand-forest/50">
                        <span className="font-extrabold text-brand-forest/75">{item.sellerName}</span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                          {item.sellerAggregateRating > 0
                            ? item.sellerAggregateRating.toFixed(1)
                            : "New"}
                        </span>
                        {item.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {item.location}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            Dubai
                          </span>
                        )}
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-forest/55 group-hover:text-brand-blue">
                        View listing <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-14 rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-extrabold tracking-[-0.03em]">
            Why book {page.pluralLabel} on Kattegat?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-forest/60">
            Kattegat is built for Dubai hospitality and events. Sellers keep what they earn,
            buyers speak directly with talent, and location is captured on listings so you can
            find people who actually work where you need them.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/how-it-works" className="text-sm font-extrabold text-brand-blue hover:underline">
              How it works
            </Link>
            <Link href="/dubai" className="text-sm font-extrabold text-brand-blue hover:underline">
              More Dubai categories
            </Link>
            {matchedCategory ? (
              <Link
                href={`/category/${matchedCategory.slug}`}
                className="text-sm font-extrabold text-brand-blue hover:underline"
              >
                {matchedCategory.name} category
              </Link>
            ) : null}
          </div>
        </section>
      </article>

      <SiteFooter
        brandName={settings.brand.siteName}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        mobileAppUrl={settings.links.mobileAppUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
