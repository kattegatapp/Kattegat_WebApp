import { z } from "zod";

import {
  loginPasswordSchema,
  referralCodeSchema,
  safeEmailSchema,
  safeOptionalSingleLineField,
} from "@/lib/security/input";

/** Register password rules — aligned with mobile signup strength checks (min 8 for web/backend). */
export const registerPasswordSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[0-9]/, "Add a number")
    .regex(/[^A-Za-z0-9]/, "Add a special character (e.g. ! @ # $)")
    .max(128, "Password must be at most 128 characters")
    .refine((password) => !/[\u0000-\u001F\u007F]/.test(password), {
      message: "Password contains invalid characters",
    }),
);

export const memberLoginSchema = z
  .object({
    email: safeEmailSchema,
    password: loginPasswordSchema,
  })
  .strict();

export type MemberLoginValues = z.infer<typeof memberLoginSchema>;

/** API/BFF payload — no confirmPassword field. */
export const memberRegisterSchema = z
  .object({
    email: safeEmailSchema,
    password: registerPasswordSchema,
    role: z.enum(["buyer", "seller"]),
    businessName: safeOptionalSingleLineField(80),
    referralCode: referralCodeSchema,
  })
  .strict();

export type MemberRegisterValues = z.infer<typeof memberRegisterSchema>;

/** Client register form — includes confirm password. */
export const memberRegisterFormSchema = z
  .object({
    email: safeEmailSchema,
    password: registerPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["buyer", "seller"]),
    businessName: safeOptionalSingleLineField(80),
    referralCode: referralCodeSchema,
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type MemberRegisterFormValues = z.infer<typeof memberRegisterFormSchema>;

/** Seller-only billing checkout registration. */
export const billingRegisterSchema = z
  .object({
    email: safeEmailSchema,
    password: registerPasswordSchema,
    role: z.literal("seller"),
    businessName: safeOptionalSingleLineField(80),
  })
  .strict();

export const memberChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type MemberChangePasswordValues = z.infer<typeof memberChangePasswordSchema>;
