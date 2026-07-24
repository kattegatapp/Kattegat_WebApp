import { apiFetch } from "@/lib/api/client";
import type { ListingFieldDefinition, ListingFieldSchema } from "@/lib/api/catalog";
import type { PricingModelType } from "@/lib/pricing-blocks";

export type AdminListingFieldSchema = ListingFieldSchema;

export type ReplaceListingFieldSchemaInput = {
  fields: ListingFieldDefinition[];
  pricingDefaults?: PricingModelType[];
};

export async function updateCategoryListingFieldSchema(
  categoryId: string,
  input: ReplaceListingFieldSchemaInput,
): Promise<AdminListingFieldSchema> {
  return apiFetch<AdminListingFieldSchema>(
    `/api/admin/categories/${categoryId}/listing-fields`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    { baseUrl: "" },
  );
}
