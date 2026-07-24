"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  AccountCatalogGrid,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { fetchMarketplaceListings } from "@/lib/api/account-marketplace";
import { getCatalogCategories, type ListingSearchSort } from "@/lib/api/marketing";
import { listingPublicPath } from "@/lib/navigation/public-paths";
import { formatListingDisplayPrice } from "@/lib/pricing-blocks";
import { MoneyText } from "@/components/currency";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: Array<{ value: ListingSearchSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "top_rated", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

function tierLabel(tier: string | null | undefined) {
  if (tier === "white_glove") return "Vetted";
  if (tier === "pro") return "Pro";
  if (tier === "starter") return "Starter";
  return null;
}

type AccountBrowseListingsViewProps = {
  initialQuery?: string;
  initialCategoryId?: string;
  onQueryChange?: (query: string) => void;
};

export function AccountBrowseListingsView({
  initialQuery = "",
  initialCategoryId = "",
  onQueryChange,
}: AccountBrowseListingsViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [sort, setSort] = useState<ListingSearchSort>("recommended");
  const deferredQuery = useDeferredValue(query.trim());
  const pageSize = 24;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    onQueryChange?.(deferredQuery);
  }, [deferredQuery, onQueryChange]);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCatalogCategories,
    staleTime: 300_000,
  });
  const categories = categoriesQuery.data ?? [];

  const listingsQuery = useInfiniteQuery({
    queryKey: ["account", "marketplace", "listings", deferredQuery, categoryId, sort, pageSize],
    queryFn: ({ pageParam }) =>
      fetchMarketplaceListings({
        q: deferredQuery || undefined,
        categoryId: categoryId || undefined,
        page: pageParam,
        pageSize,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
  });

  const items = useMemo(
    () => listingsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listingsQuery.data],
  );
  const total = listingsQuery.data?.pages[0]?.total ?? 0;
  const hasFilters = Boolean(deferredQuery || categoryId);

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Browse listings"
        badge="Marketplace"
        description="Discover live services across Dubai. Open a listing to message the seller or contact Kattegat Agent."
      />

      <AccountGlass className="mb-5 space-y-3 rounded-[18px] p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search DJs, chefs, photographers…"
            aria-label="Search marketplace listings"
            className="h-10 rounded-xl border-brand-forest/10 bg-white pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategoryId("")}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
              !categoryId
                ? "border-brand-forest bg-brand-forest text-white"
                : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
            )}
          >
            All
          </button>
          {categories.map((category) => {
            const selected = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(selected ? "" : category.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
                  selected
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-forest/10 bg-white text-brand-forest/70 hover:border-brand-mantis/30",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORT_OPTIONS.map((option) => {
            const selected = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold transition",
                  selected
                    ? "border-brand-mantis/50 bg-brand-mantis/15 text-brand-forest"
                    : "border-brand-forest/10 bg-white text-brand-forest/60 hover:border-brand-mantis/30",
                )}
              >
                {option.label}
              </button>
            );
          })}
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategoryId("");
                setSort("recommended");
              }}
              className="shrink-0 rounded-full border border-brand-forest/10 bg-white px-3 py-1 text-[11px] font-bold text-brand-forest/55 hover:bg-brand-forest/5"
            >
              Clear
            </button>
          ) : null}
        </div>
      </AccountGlass>

      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {listingsQuery.isPending
            ? "Loading…"
            : `Showing ${items.length.toLocaleString()} of ${total.toLocaleString()}${
                hasFilters ? " matching" : " live"
              } listings`}
        </p>
      </div>

      {listingsQuery.isPending ? (
        <AccountCardGridSkeleton count={6} columns={3} />
      ) : items.length ? (
        <>
          <AccountCatalogGrid>
            {items.map((item) => {
              const tier = tierLabel(item.sellerTier);
              const href = listingPublicPath({ id: item.id, title: item.title });
              return (
                <Link key={item.id} href={href} className="group block h-full">
                  <AccountListCard className="flex h-full flex-col overflow-hidden p-0 transition hover:border-brand-mantis/30 hover:shadow-md">
                    <div className="relative aspect-[16/10] bg-[#EEF2F0]">
                      {item.coverImage || item.sellerAvatarUrl ? (
                        <Image
                          src={item.coverImage || item.sellerAvatarUrl || ""}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[11px] font-extrabold uppercase tracking-wide text-brand-forest/30">
                          Kattegat
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.categoryName ? (
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-blue">
                            {item.categoryName}
                          </span>
                        ) : null}
                        {tier ? (
                          <span className="rounded-full border border-brand-forest/10 bg-brand-forest/[0.03] px-2 py-0.5 text-[10px] font-bold text-brand-forest/65">
                            {tier}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 line-clamp-2 text-[14px] font-extrabold leading-snug text-brand-forest transition group-hover:text-brand-forest/85">
                        {item.title}
                      </h3>
                      <MoneyText className="mt-1 text-[13px] font-extrabold text-brand-forest">
                        {formatListingDisplayPrice(item)}
                      </MoneyText>
                      <p className="mt-1 truncate text-[12px] text-brand-forest/55">
                        {item.sellerName || "Kattegat seller"}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-brand-forest/8 pt-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-forest/55">
                          <Star className="size-3 fill-brand-mantis text-brand-mantis" />
                          {item.sellerAggregateRating > 0
                            ? item.sellerAggregateRating.toFixed(1)
                            : "New"}
                        </span>
                        {item.location ? (
                          <span className="inline-flex max-w-[55%] items-center gap-1 text-[11px] text-brand-forest/50">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest/45 transition group-hover:text-brand-mantis">
                            View <ArrowRight className="size-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </AccountListCard>
                </Link>
              );
            })}
          </AccountCatalogGrid>

          {listingsQuery.hasNextPage ? (
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="font-bold"
                disabled={listingsQuery.isFetchingNextPage}
                onClick={() => void listingsQuery.fetchNextPage()}
              >
                {listingsQuery.isFetchingNextPage ? <Spinner className="size-4" /> : null}
                Load more
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <AccountGlass className="rounded-[18px] p-10 text-center">
          <Search className="mx-auto size-7 text-brand-mantis" />
          <p className="mt-4 font-bold text-brand-forest">
            {hasFilters ? "No matching listings" : "No live listings yet"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-brand-forest/65">
            {hasFilters
              ? "Try another search term or category."
              : "When sellers publish services, they appear here for buyers to discover."}
          </p>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setCategoryId("");
                setSort("recommended");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </AccountGlass>
      )}
    </AccountViewWrap>
  );
}
