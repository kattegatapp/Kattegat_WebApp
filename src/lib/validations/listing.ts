import { z } from "zod";

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

export const createListingFormSchema = z.object({
  categoryId: uuid,
  subcategoryId: uuid,
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
  priceAed: optionalAedToFils(),
});

export type CreateListingFormValues = z.input<typeof createListingFormSchema>;
export type CreateListingPayload = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description?: string;
  location?: string;
  pricing?: { amount: number };
};

export function toCreateListingPayload(values: CreateListingFormValues): CreateListingPayload {
  const parsed = createListingFormSchema.parse(values);
  return {
    categoryId: parsed.categoryId,
    subcategoryId: parsed.subcategoryId,
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    pricing: parsed.priceAed != null ? { amount: parsed.priceAed } : undefined,
  };
}

export const updateListingFormSchema = z.object({
  title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
  description: safeOptionalMessageField(5000),
  location: safeOptionalSingleLineField(120),
  priceAed: optionalAedToFils(),
});

export type UpdateListingFormValues = z.input<typeof updateListingFormSchema>;
export type UpdateListingPayload = {
  title?: string;
  description?: string;
  location?: string;
  pricing?: { amount: number };
};

export function toUpdateListingPayload(values: UpdateListingFormValues): UpdateListingPayload {
  const parsed = updateListingFormSchema.parse(values);
  return {
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    pricing: parsed.priceAed != null ? { amount: parsed.priceAed } : undefined,
  };
}

/** Server-side body check before proxying create. */
export const createListingBodySchema = z
  .object({
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
  })
  .strict();

export const updateListingBodySchema = createListingBodySchema.partial();
