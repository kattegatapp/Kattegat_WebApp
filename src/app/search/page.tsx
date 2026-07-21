import type { Metadata } from "next";

import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SearchExplorer } from "@/features/marketing/search-explorer";
import { SiteFooter } from "@/features/marketing/site-footer";
import {
  getCatalogCategories,
  getCatalogSubcategories,
  searchListings,
  type ListingSearchSort,
} from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Search | Kattegat",
  description: "Search Dubai hospitality and event talent, services, and specialists on Kattegat.",
};

const SORTS = new Set<ListingSearchSort>([
  "recommended",
  "top_rated",
  "newest",
  "price_asc",
  "price_desc",
]);

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    subcategory?: string | string[];
    sort?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function resolveCategory(
  categories: Awaited<ReturnType<typeof getCatalogCategories>>,
  token: string,
) {
  if (!token) return undefined;
  const normalized = normalizeToken(token);

  const exact = categories.find(
    (category) =>
      category.slug === token ||
      category.id === token ||
      normalizeToken(category.name) === normalized,
  );
  if (exact) return exact;

  // Soft match for homepage labels like "Event management" → catalog name variants.
  if (normalized.length < 4) return undefined;
  return categories.find((category) => {
    const name = normalizeToken(category.name);
    return name.includes(normalized) || normalized.includes(name);
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const qParam = firstParam(params.q).trim();
  const categoryParam = firstParam(params.category).trim();
  const subcategoryParam = firstParam(params.subcategory).trim();
  const sortParam = firstParam(params.sort).trim();
  const sort: ListingSearchSort = SORTS.has(sortParam as ListingSearchSort)
    ? (sortParam as ListingSearchSort)
    : "recommended";

  const [settings, categories] = await Promise.all([
    getPublicAppSettings(),
    getCatalogCategories(),
  ]);

  const categoryFromParam = resolveCategory(categories, categoryParam);
  const categoryFromQuery =
    !categoryFromParam && qParam ? resolveCategory(categories, qParam) : undefined;
  const selectedCategory = categoryFromParam ?? categoryFromQuery;

  // Category chips / home links that land as `?q=Entertainment` browse by categoryId.
  // Free-text stays in `q` when a category is explicitly selected via `?category=`.
  const query = categoryFromParam ? qParam : categoryFromQuery ? "" : qParam;

  const subcategories = selectedCategory
    ? await getCatalogSubcategories(selectedCategory.id)
    : [];

  const selectedSubcategory = subcategoryParam
    ? subcategories.find(
        (subcategory) =>
          subcategory.slug === subcategoryParam ||
          normalizeToken(subcategory.name) === normalizeToken(subcategoryParam) ||
          subcategory.id === subcategoryParam,
      )
    : undefined;

  const results = await searchListings({
    q: query || undefined,
    categoryId: selectedCategory?.id,
    subcategoryId: selectedSubcategory?.id,
    sort,
    pageSize: 24,
  });

  const explorerKey = [
    query || "all",
    selectedCategory?.slug || "any-cat",
    selectedSubcategory?.slug || "any-sub",
    sort,
  ].join(":");

  return (
    <main className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-20 size-[22rem] rounded-full bg-brand-mantis/15 blur-3xl" />
        <div className="absolute right-0 top-40 size-[18rem] rounded-full bg-brand-blue/10 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <SearchExplorer
        key={explorerKey}
        initialQuery={query}
        categories={categories}
        subcategories={subcategories}
        selectedCategorySlug={selectedCategory?.slug ?? ""}
        selectedSubcategorySlug={selectedSubcategory?.slug ?? ""}
        selectedSort={sort}
        items={results.items}
        total={results.total}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        mobileAppUrl={settings.links.mobileAppUrl}
      />

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
