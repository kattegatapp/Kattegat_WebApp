import {
  getCatalogCategories,
  searchListings,
} from "@/lib/api/marketing";
import type { AccountHomeFeed } from "@/lib/api/account-home";
import { loadOpenRequirements } from "@/lib/api/account-requirements.server";

export async function loadAccountHomeFeed(): Promise<AccountHomeFeed> {
  const [categories, listingPage, requirementPage] = await Promise.all([
    getCatalogCategories(),
    searchListings({ sort: "recommended", pageSize: 4 }),
    loadOpenRequirements(1, 4),
  ]);

  return {
    categories: categories.slice(0, 8),
    listings: listingPage.items,
    listingsTotal: listingPage.total,
    requirements: requirementPage.items,
    requirementsTotal: requirementPage.total,
  };
}
