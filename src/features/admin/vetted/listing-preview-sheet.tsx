"use client";

import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, MapPin, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fetchAdminListing } from "@/lib/api/admin";

function formatPricing(pricing: Record<string, unknown> | null | undefined) {
  if (!pricing || typeof pricing.amount !== "number") return null;
  const aed = pricing.amount / 100;
  const unit = typeof pricing.unit === "string" && pricing.unit ? ` / ${pricing.unit}` : "";
  return `AED ${aed.toLocaleString("en-AE")}${unit}`;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ListingPreviewSheetProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Instant fallback while details load (from the Contact Agent case). */
  fallback?: {
    title?: string | null;
    coverImage?: string | null;
    pricing?: { amount?: number; unit?: string | null } | null;
    sellerName?: string | null;
  };
}

export function ListingPreviewSheet({
  listingId,
  open,
  onOpenChange,
  fallback,
}: ListingPreviewSheetProps) {
  const query = useQuery({
    queryKey: ["admin", "listing-preview", listingId],
    queryFn: () => fetchAdminListing(listingId as string),
    enabled: open && Boolean(listingId),
    retry: false,
    staleTime: 60_000,
  });

  const listing = query.data;
  const title = listing?.title || fallback?.title || "Listing";
  const cover =
    listing?.coverImage ||
    listing?.media?.find((item) => item.type === "image")?.url ||
    fallback?.coverImage ||
    null;
  const price =
    formatPricing(listing?.pricing) ||
    (fallback?.pricing && typeof fallback.pricing.amount === "number"
      ? formatPricing({ amount: fallback.pricing.amount, unit: fallback.pricing.unit ?? undefined })
      : null);
  const sellerName = listing?.sellerDisplayName || fallback?.sellerName || null;
  const gallery = listing?.media?.filter((item) => item.type === "image").slice(0, 6) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-l border-border/70 bg-white p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
          <SheetTitle className="text-lg font-extrabold text-brand-forest">Listing details</SheetTitle>
          <SheetDescription>
            Preview without leaving Vetted chat. Close this panel to return to the conversation.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
            <div className="relative aspect-[16/10] bg-brand-forest/5">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-brand-forest/30">
                  <ImageIcon className="size-10" />
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-brand-forest">{title}</h2>
                {listing?.status ? (
                  <Badge variant="outline" className="border-brand-forest/15 bg-brand-forest/5 text-brand-forest">
                    {label(listing.status)}
                  </Badge>
                ) : null}
              </div>
              {price ? <p className="text-sm font-bold text-brand-forest">{price}</p> : null}
              {sellerName ? (
                <p className="text-sm text-muted-foreground">Seller · {sellerName}</p>
              ) : null}
              {listing?.location ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {listing.location}
                </p>
              ) : null}
            </div>
          </div>

          {query.isPending ? (
            <div className="flex min-h-24 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-brand-forest" />
            </div>
          ) : null}

          {query.isError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Full listing details could not be loaded. Showing what we know from this Vetted case.
            </p>
          ) : null}

          {listing?.description ? (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-brand-forest/90">
                {listing.description}
              </p>
            </div>
          ) : null}

          {gallery.length > 1 ? (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Gallery
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gallery.map((item) => (
                  <div key={item.id} className="aspect-square overflow-hidden rounded-xl bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="size-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {listingId ? (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Tag className="size-3" />
                App deep link
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                /listing/{listingId}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                This is the same path buyers open in the app. You’re viewing it here so you do not leave
                the Vetted chat desk.
              </p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
