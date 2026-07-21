import { z } from "zod";

import {
  phoneSchema,
  safeOptionalMessageField,
  safeOptionalSingleLineField,
  safeSingleLineField,
  usernameSchema,
} from "@/lib/security/input";

export { usernameSchema };

export const profileDetailsSchema = z
  .object({
    username: usernameSchema,
    phone: phoneSchema,
    businessName: safeOptionalSingleLineField(80),
  })
  .strict();

export type ProfileDetailsValues = z.infer<typeof profileDetailsSchema>;

export const profileDetailsWithBusinessSchema = z
  .object({
    username: usernameSchema,
    phone: phoneSchema,
    businessName: safeSingleLineField("Business name", 80),
  })
  .strict();

export const sellerSetupSchema = z
  .object({
    displayName: safeSingleLineField("Display name", 80),
    bio: safeOptionalMessageField(2000),
  })
  .strict();

export type SellerSetupValues = z.infer<typeof sellerSetupSchema>;

export const updateAccountProfileSchema = z
  .object({
    username: usernameSchema.optional(),
    phone: phoneSchema,
    businessName: safeOptionalSingleLineField(80),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field is required",
  });

export const updateSellerProfileSchema = z
  .object({
    displayName: safeSingleLineField("Display name", 80).optional(),
    bio: safeOptionalMessageField(2000),
  })
  .strict()
  .refine((value) => value.displayName !== undefined || value.bio !== undefined, {
    message: "At least one field is required",
  });
