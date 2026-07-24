import { z } from "zod";

import type { ListingFieldDefinition } from "@/lib/api/catalog";
import { PRICING_MODEL_TYPES, type PricingBlock } from "@/lib/pricing-blocks";
import {
  containsDangerousMarkup,
  normalizeText,
  safeOptionalMessageField,
  safeOptionalSingleLineField,
  safeSingleLineField,
} from "@/lib/security/input";

const uuid = z.string().uuid("Select a valid option");

const schemaFieldsValueSchema = z.record(z.string(), z.unknown()).optional();

const pricingBlockBodySchema = z.object({
  modelType: z.enum(PRICING_MODEL_TYPES),
  amountAed: z.number().int().positive().nullable().optional(),
  unitLabel: z.string().max(80).nullable().optional(),
  isFromPrice: z.boolean().optional(),
  sellerSharePct: z.number().int().min(1).max(99).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
});

export const createListingFormSchema = z.object({
  categoryId: uuid,
  subcategoryId: uuid,
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
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
  pricingBlocks?: PricingBlock[];
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
};

export function toCreateListingPayload(
  values: CreateListingParsed,
  schemaFields: Record<string, unknown>,
  pricingBlocks: PricingBlock[],
): CreateListingPayload {
  return {
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId,
    title: values.title,
    description: values.description,
    location: values.location,
    pricingBlocks,
    schemaFields: Object.keys(schemaFields).length ? schemaFields : undefined,
    isConfidential: values.isConfidential || undefined,
  };
}

export const updateListingFormSchema = z.object({
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
  isConfidential: z.boolean().optional(),
});

export type UpdateListingFormValues = z.input<typeof updateListingFormSchema>;
export type UpdateListingParsed = z.output<typeof updateListingFormSchema>;
export type UpdateListingPayload = {
  title?: string;
  description?: string;
  location?: string;
  pricingBlocks?: PricingBlock[];
  schemaFields?: Record<string, unknown>;
  isConfidential?: boolean;
};

export type ListingDiffSource = {
  title: string;
  description?: string | null;
  location?: string | null;
  pricingBlocks?: PricingBlock[] | null;
  schemaFields?: Record<string, unknown> | null;
  isConfidential?: boolean;
};

/** Only changed keys — avoids accidental re-review on live listings (backend CONTENT_FIELDS rule). */
export function buildUpdateListingPayload(
  values: UpdateListingParsed,
  existing: ListingDiffSource,
  schemaFields: Record<string, unknown>,
  pricingBlocks: PricingBlock[],
): UpdateListingPayload {
  const payload: UpdateListingPayload = {};
  const trimmedDescription = values.description ?? "";
  const trimmedLocation = values.location ?? "";

  if (values.title !== existing.title) payload.title = values.title;
  if (trimmedDescription !== (existing.description ?? "")) {
    payload.description = trimmedDescription || undefined;
  }
  if (trimmedLocation !== (existing.location ?? "")) {
    payload.location = trimmedLocation || undefined;
  }
  if (JSON.stringify(pricingBlocks) !== JSON.stringify(existing.pricingBlocks ?? [])) {
    payload.pricingBlocks = pricingBlocks;
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
  pricingBlocks: z.array(pricingBlockBodySchema).max(12).optional(),
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
