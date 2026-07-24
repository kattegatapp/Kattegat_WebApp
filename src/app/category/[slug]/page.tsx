import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import {
  getCatalogCategories,
  searchListings,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import { cloudinaryCrop } from "@/lib/cloudinary";
import { listingPublicPath } from "@/lib/navigation/public-paths";
import {
  categoryPageDescription,
  categoryPageTitle,
  getSiteOrigin,
  jsonLdScript,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [categories, origin] = await Promise.all([getCatalogCategories(), getSiteOrigin()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return { title: "Category not found | Kattegat", robots: { index: false } };
  }

  const title = categoryPageTitle(category.name, "Dubai");
  const description = categoryPageDescription(category.name, "Dubai");

  return {
    title,
    description,
    alternates: { canonical: `${origin}/category/${category.slug}` },
    openGraph: {
      title,
      description,
      url: `${origin}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [settings, categories, origin] = await Promise.all([
    getPublicAppSettings(),
    getCatalogCategories(),
    getSiteOrigin(),
  ]);

  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const results = await searchListings({
    categoryId: category.id,
    pageSize: 24,
    sort: "recommended",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} on Kattegat`,
    url: `${origin}/category/${category.slug}`,
    description: `Live ${category.name} listings on Kattegat.`,
  };

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-forest/45">
              <Link href="/" className="hover:text-brand-blue">
                Home
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-brand-blue">
                Services
              </Link>
              <span>/</span>
              <span className="text-brand-forest/70">{category.name}</span>
            </nav>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
              Category
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              {category.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-brand-forest/60">
              {results.total} live listing{results.total === 1 ? "" : "s"} in this category across
              Dubai and the UAE. Continue in the app to message sellers and book.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ContinueInApp
              title="Download the app to continue"
              description={`Browse ${category.name} and message sellers inside the Kattegat app.`}
              deepLinkPath={`/category/${category.id}`}
              webOrigin={origin}
              appStoreUrl={settings.links.appStoreUrl}
              playStoreUrl={settings.links.playStoreUrl}
              mobileAppUrl={settings.links.mobileAppUrl}
            />
            <Link
              href={`/search?category=${encodeURIComponent(category.slug)}`}
              className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
            >
              Open search filters
            </Link>
            <Link
              href="/dubai"
              className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
            >
              Dubai landings
            </Link>
          </div>
        </div>

        {results.items.length === 0 ? (
          <p className="mt-12 text-sm text-brand-forest/60">No live listings in this category yet.</p>
        ) : (
          <ul className="mt-10 divide-y divide-brand-forest/10 border-y border-brand-forest/10">
            {results.items.map((item) => {
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
                      <h2 className="text-lg font-extrabold tracking-[-0.02em] group-hover:text-brand-blue sm:text-xl">
                        {item.title}
                      </h2>
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
      </section>

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
