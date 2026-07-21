"use client";

import { ArrowRight, ArrowUpRight, MapPin, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type {
  CatalogCategory,
  CatalogSubcategory,
  ListingSearchHit,
  ListingSearchSort,
} from "@/lib/api/marketing";
import { listingPublicPath } from "@/lib/navigation/public-paths";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ListingSearchSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "top_rated", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

type SearchExplorerProps = {
  initialQuery: string;
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  selectedCategorySlug: string;
  selectedSubcategorySlug: string;
  selectedSort: ListingSearchSort;
  items: ListingSearchHit[];
  total: number;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
};

function tierLabel(tier: ListingSearchHit["sellerTier"]) {
  if (tier === "white_glove") return "White Glove";
  if (tier === "pro") return "Pro";
  if (tier === "starter") return "Starter";
  return null;
}

function buildSearchHref(options: {
  q?: string;
  category?: string;
  subcategory?: string;
  sort?: ListingSearchSort;
}) {
  const params = new URLSearchParams();
  const q = options.q?.trim();
  if (q) params.set("q", q);
  if (options.category) params.set("category", options.category);
  if (options.subcategory) params.set("subcategory", options.subcategory);
  if (options.sort && options.sort !== "recommended") params.set("sort", options.sort);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function SearchExplorer({
  initialQuery,
  categories,
  subcategories,
  selectedCategorySlug,
  selectedSubcategorySlug,
  selectedSort,
  items,
  total,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
}: SearchExplorerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  function navigate(next: {
    q?: string;
    category?: string;
    subcategory?: string;
    sort?: ListingSearchSort;
  }) {
    startTransition(() => {
      router.push(buildSearchHref(next));
    });
  }

  function submitSearch(nextQuery: string) {
    navigate({
      q: nextQuery,
      category: selectedCategorySlug || undefined,
      subcategory: selectedSubcategorySlug || undefined,
      sort: selectedSort,
    });
  }

  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);
  const hasFilters = Boolean(
    query || selectedCategorySlug || selectedSubcategorySlug || selectedSort !== "recommended",
  );
  const appHref = mobileAppUrl || appStoreUrl || playStoreUrl || "/contact";
  const chipCategories = categories.length > 0 ? categories : [];

  const headline = selectedCategory
    ? selectedCategory.name
    : query
      ? `“${query}”`
      : "Find talent & services";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          Search
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
          {selectedCategory || query ? (
            <>
              Results for <span className="text-brand-blue">{headline}</span>
            </>
          ) : (
            headline
          )}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-brand-forest/60">
          Filter by category, subcategory, and sort — then continue in the app to message and book.
        </p>
      </div>

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
      >
        <label className="sr-only" htmlFor="marketplace-search">
          Search services and talent
        </label>
        <div className="flex items-stretch gap-2 rounded-2xl border border-brand-forest/12 bg-white p-2 shadow-[0_16px_50px_rgb(0_57_18/0.08)] sm:gap-3 sm:p-2.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35 sm:left-4" />
            <input
              id="marketplace-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="DJ, host, event manager, marketing…"
              autoFocus
              className="h-12 w-full rounded-xl bg-transparent pl-10 pr-10 text-sm font-medium text-brand-forest outline-none placeholder:text-brand-forest/35 sm:h-13 sm:pl-11 sm:text-base"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search text"
                onClick={() => {
                  setQuery("");
                  navigate({
                    category: selectedCategorySlug || undefined,
                    subcategory: selectedSubcategorySlug || undefined,
                    sort: selectedSort,
                  });
                }}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-forest/40 transition hover:bg-[#EEF2F0] hover:text-brand-forest"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95 disabled:opacity-70 sm:h-13 sm:px-7"
          >
            {pending ? "…" : "Search"}
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-forest/45">
            Category
          </span>
          <select
            value={selectedCategorySlug}
            onChange={(event) => {
              navigate({
                q: query,
                category: event.target.value || undefined,
                sort: selectedSort,
              });
            }}
            className="h-11 w-full rounded-xl border border-brand-forest/12 bg-white px-3 text-sm font-bold text-brand-forest outline-none transition focus:border-brand-mantis/50"
          >
            <option value="">All categories</option>
            {chipCategories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-forest/45">
            Subcategory
          </span>
          <select
            value={selectedSubcategorySlug}
            disabled={!selectedCategorySlug || subcategories.length === 0}
            onChange={(event) => {
              navigate({
                q: query,
                category: selectedCategorySlug || undefined,
                subcategory: event.target.value || undefined,
                sort: selectedSort,
              });
            }}
            className="h-11 w-full rounded-xl border border-brand-forest/12 bg-white px-3 text-sm font-bold text-brand-forest outline-none transition focus:border-brand-mantis/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {!selectedCategorySlug
                ? "Pick a category first"
                : subcategories.length === 0
                  ? "No subcategories"
                  : "All subcategories"}
            </option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.slug}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-forest/45">
            Sort by
          </span>
          <select
            value={selectedSort}
            onChange={(event) => {
              navigate({
                q: query,
                category: selectedCategorySlug || undefined,
                subcategory: selectedSubcategorySlug || undefined,
                sort: event.target.value as ListingSearchSort,
              });
            }}
            className="h-11 w-full rounded-xl border border-brand-forest/12 bg-white px-3 text-sm font-bold text-brand-forest outline-none transition focus:border-brand-mantis/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chipCategories.length > 0 ? (
        <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            onClick={() =>
              navigate({
                q: query,
                sort: selectedSort,
              })
            }
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition",
              !selectedCategorySlug
                ? "border-brand-forest bg-brand-forest text-white"
                : "border-brand-forest/15 bg-white text-brand-forest/70 hover:border-brand-forest/30",
            )}
          >
            All
          </button>
          {chipCategories.map((category) => {
            const active = selectedCategorySlug === category.slug;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  navigate({
                    q: query,
                    category: category.slug,
                    sort: selectedSort,
                  })
                }
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition",
                  active
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-forest/15 bg-white text-brand-forest/70 hover:border-brand-forest/30",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-b border-brand-forest/10 pb-4">
        <p className="text-sm font-bold text-brand-forest/55">
          {pending ? "Updating…" : `${total} result${total === 1 ? "" : "s"}`}
          {selectedCategory ? ` in ${selectedCategory.name}` : ""}
        </p>
        <div className="flex items-center gap-3">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                navigate({});
              }}
              className="text-sm font-extrabold text-brand-forest/60 hover:text-brand-blue"
            >
              Clear filters
            </button>
          ) : null}
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-extrabold text-brand-forest/70 hover:text-brand-blue"
          >
            Categories <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 max-w-lg py-6">
          <p className="text-xl font-extrabold tracking-[-0.03em]">No matches yet</p>
          <p className="mt-3 text-sm leading-7 text-brand-forest/60">
            Try clearing a filter, broadening the search, or open the app for the full marketplace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                navigate({});
              }}
              className="inline-flex h-11 items-center rounded-xl bg-brand-forest px-5 text-sm font-extrabold text-white"
            >
              Reset filters
            </button>
            <a
              href={appHref}
              target={appHref.startsWith("http") ? "_blank" : undefined}
              rel={appHref.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex h-11 items-center rounded-xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
            >
              Get the app
            </a>
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-brand-forest/10">
          {items.map((item) => {
            const tier = tierLabel(item.sellerTier);
            const image = item.coverImage || item.sellerAvatarUrl;
            return (
              <li key={item.id}>
                <Link
                  href={listingPublicPath({ id: item.id, title: item.title })}
                  className="group flex w-full gap-4 py-5 text-left transition hover:bg-white/70 sm:gap-5 sm:rounded-2xl sm:px-3"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-[#EEF2F0] sm:size-24">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote listing media; hosts vary
                      <img src={image} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] font-extrabold uppercase tracking-wide text-brand-forest/30">
                        KG
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.categoryName ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-blue">
                          {item.categoryName}
                        </span>
                      ) : null}
                      {item.subcategoryName ? (
                        <span className="text-[11px] font-bold text-brand-forest/45">
                          {item.subcategoryName}
                        </span>
                      ) : null}
                      {tier ? (
                        <span className="rounded-full bg-brand-mantis/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-forest">
                          {tier}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] group-hover:text-brand-blue sm:text-xl">
                      {item.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-brand-forest/60">
                      {item.description || `${item.sellerName} · live on Kattegat`}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-brand-forest/50">
                      <span className="font-extrabold text-brand-forest/75">{item.sellerName}</span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                        {item.sellerAggregateRating > 0
                          ? item.sellerAggregateRating.toFixed(1)
                          : "New"}
                        {item.sellerReviewCount > 0 ? ` · ${item.sellerReviewCount}` : ""}
                      </span>
                      {item.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {item.location}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-forest/55 transition group-hover:text-brand-blue">
                      View listing <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-14 flex flex-col gap-4 border-t border-brand-forest/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">
            Full marketplace
          </p>
          <p className="mt-2 max-w-md text-sm leading-7 text-brand-forest/60">
            Message sellers and manage bookings in the Kattegat app.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {appStoreUrl ? (
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-xl bg-brand-forest px-4 text-xs font-extrabold text-white"
            >
              App Store
            </a>
          ) : null}
          {playStoreUrl ? (
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-xl border border-brand-forest/15 bg-white px-4 text-xs font-extrabold"
            >
              Google Play
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
