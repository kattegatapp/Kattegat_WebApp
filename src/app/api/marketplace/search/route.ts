import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { searchListings, type ListingSearchSort } from "@/lib/api/marketing";

const SORTS = new Set<ListingSearchSort>([
  "recommended",
  "top_rated",
  "newest",
  "price_asc",
  "price_desc",
]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sortRaw = params.get("sort") ?? "recommended";
  const sort = SORTS.has(sortRaw as ListingSearchSort)
    ? (sortRaw as ListingSearchSort)
    : "recommended";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.min(48, Math.max(1, Number(params.get("pageSize") ?? "24") || 24));

  try {
    const result = await searchListings({
      q: params.get("q")?.trim() || undefined,
      categoryId: params.get("categoryId")?.trim() || undefined,
      subcategoryId: params.get("subcategoryId")?.trim() || undefined,
      page,
      pageSize,
      sort,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.items,
        meta: { page: result.page, total: result.total },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Could not load marketplace listings", code: "MARKETPLACE_SEARCH_FAILED" },
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
