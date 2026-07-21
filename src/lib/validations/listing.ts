import { z } from "zod";

import type { ListingFieldDefinition } from "@/lib/api/catalog";
import {
  containsDangerousMarkup,
  normalizeText,
  safeOptionalMessageField,
  safeOptionalSingleLineField,
  safeSingleLineField,
} from "@/lib/security/input";

const uuid = z.string().uuid("Select a valid option");

function optionalAedToFils() {
  return z
    .string()
    .optional()
    .transform((value) => (value ?? "").trim())
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Enter a valid price in AED",
    })
    .transform((value) => (value ? Math.round(Number(value) * 100) : undefined));
}

const schemaFieldsValueSchema = z.record(z.string(), z.unknown()).optional();

export const createListingFormSchema = z.object({
  categoryId: uuid,
  subcategoryId: uuid,
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
  priceAed: optionalAedToFils(),
  isConfidential: z.boolean().optional(),
});

export type CreateListingFormValues = z.input<typeof createListingFormSchema>;
export type CreateListingParsed = z.output<typeof createListingFormSchema>;
export type CreateListingPayload = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description?: string;
  location?: string;
  pricing?: { amount: number };
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
};

export function toCreateListingPayload(
  values: CreateListingParsed,
  schemaFields: Record<string, unknown>,
): CreateListingPayload {
  return {
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId,
    title: values.title,
    description: values.description,
    location: values.location,
    pricing: values.priceAed != null ? { amount: values.priceAed } : undefined,
    schemaFields: Object.keys(schemaFields).length ? schemaFields : undefined,
    isConfidential: values.isConfidential || undefined,
  };
}

export const updateListingFormSchema = z.object({
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
  priceAed: optionalAedToFils(),
  isConfidential: z.boolean().optional(),
});

export type UpdateListingFormValues = z.input<typeof updateListingFormSchema>;
export type UpdateListingParsed = z.output<typeof updateListingFormSchema>;
export type UpdateListingPayload = {
  title?: string;
  description?: string;
  location?: string;
  pricing?: { amount: number };
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
};

export type ListingDiffSource = {
  title: string;
  description?: string | null;
  location?: string | null;
  pricing?: { amount?: number; unit?: string } | Record<string, unknown> | null;
  schemaFields?: Record<string, unknown> | null;
  isConfidential?: boolean;
};

function pricingAmount(pricing: ListingDiffSource["pricing"]): number | undefined {
  if (!pricing || typeof pricing !== "object") return undefined;
  const amount = "amount" in pricing ? pricing.amount : undefined;
  return typeof amount === "number" && Number.isFinite(amount) ? amount : undefined;
}

/** Only changed keys — avoids accidental re-review on live listings (backend CONTENT_FIELDS rule). */
export function buildUpdateListingPayload(
  values: UpdateListingParsed,
  existing: ListingDiffSource,
  schemaFields: Record<string, unknown>,
): UpdateListingPayload {
  const payload: UpdateListingPayload = {};
  const trimmedDescription = values.description ?? "";
  const trimmedLocation = values.location ?? "";
  const newPricing = values.priceAed != null ? { amount: values.priceAed } : undefined;
  const existingPricingJson = JSON.stringify(
    pricingAmount(existing.pricing) != null ? { amount: pricingAmount(existing.pricing) } : {},
  );
  const newPricingJson = JSON.stringify(newPricing ?? {});

  if (values.title !== existing.title) payload.title = values.title;
  if (trimmedDescription !== (existing.description ?? "")) {
    payload.description = trimmedDescription || undefined;
  }
  if (trimmedLocation !== (existing.location ?? "")) {
    payload.location = trimmedLocation || undefined;
  }
  if (newPricingJson !== existingPricingJson) {
    payload.pricing = newPricing;
  }
  if (JSON.stringify(schemaFields) !== JSON.stringify(existing.schemaFields ?? {})) {
    payload.schemaFields = schemaFields;
  }
  if (values.isConfidential !== undefined && values.isConfidential !== Boolean(existing.isConfidential)) {
    payload.isConfidential = values.isConfidential;
  }

  return payload;
}

export function validateListingSchemaFields(
  fields: ListingFieldDefinition[],
  values: Record<string, unknown>,
): string | null {
  for (const field of fields) {
    if (!field.required) continue;
    const value = values[field.key];
    if (value === undefined || value === null || value === "") {
      return `${field.label} is required`;
    }
    if (field.type === "multiselect" && (!Array.isArray(value) || value.length === 0)) {
      return `${field.label} is required`;
    }
  }
  return null;
}

/** Server-side body check before proxying create. */
export const createListingBodySchema = z.object({
  categoryId: uuid,
  subcategoryId: uuid,
  title: z
    .string()
    .transform((value) => normalizeText(value))
    .pipe(z.string().min(3).max(120))
    .refine((value) => !containsDangerousMarkup(value), { message: "Title contains invalid characters" }),
  description: z
    .string()
    .max(5000)
    .optional()
    .transform((value) => (value ? normalizeText(value, { allowNewlines: true }) : undefined)),
  location: z
    .string()
    .max(120)
    .optional()
    .transform((value) => (value ? normalizeText(value) : undefined)),
  pricing: z.object({ amount: z.number().int().nonnegative() }).partial().optional(),
  schemaFields: schemaFieldsValueSchema,
  isConfidential: z.boolean().optional(),
});

export const updateListingBodySchema = createListingBodySchema.partial();

export const addListingMediaBodySchema = z
  .object({
    type: z.enum(["photo", "video_link"]),
    url: z.string().url(),
  })
  .strict();
