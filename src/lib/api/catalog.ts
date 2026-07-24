import { apiFetchEnvelope } from "@/lib/api/client";
import { resolveBackendApiUrl } from "@/lib/api/settings";
import type { PricingModelType } from "@/lib/pricing-blocks";

export type ListingFieldDefinition = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean" | "date";
  required: boolean;
  options?: string[];
};

export type ListingFieldSchema = {
  categoryId: string;
  fields: ListingFieldDefinition[];
  pricingDefaults: PricingModelType[];
};

export async function getListingFieldSchema(categoryId: string): Promise<ListingFieldSchema> {
  if (!categoryId) {
    return { categoryId: "", fields: [], pricingDefaults: [] };
  }
  try {
    const { data } = await apiFetchEnvelope<ListingFieldSchema>(
      `/api/catalog/categories/${categoryId}/listing-fields`,
      { cache: "no-store" },
      { baseUrl: resolveBackendApiUrl() },
    );
    return {
      categoryId: data.categoryId ?? categoryId,
      fields: data.fields ?? [],
      pricingDefaults: data.pricingDefaults ?? [],
    };
  } catch {
    return { categoryId, fields: [], pricingDefaults: [] };
  }
}
