import { apiFetchEnvelope } from "@/lib/api/client";
import { resolveBackendApiUrl } from "@/lib/api/settings";

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
};

export async function getListingFieldSchema(categoryId: string): Promise<ListingFieldSchema> {
  if (!categoryId) {
    return { categoryId: "", fields: [] };
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
    };
  } catch {
    return { categoryId, fields: [] };
  }
}
