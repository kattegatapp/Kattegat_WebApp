import { z } from "zod";

import { INPUT_LIMITS, safeEmailSchema, safeSingleLineField } from "@/lib/security/input";

/** UAE mobile without country code: 9 digits starting with 5 (e.g. 501234567). */
const uaeLocalMobileSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, "").replace(/^0+/, ""))
  .pipe(
    z
      .string()
      .regex(/^5\d{8}$/, "Enter a UAE mobile number (9 digits, e.g. 501234567)"),
  );

function normalizeUaePhone(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.startsWith("971") ? digits.slice(3) : digits;
  return local || undefined;
}

const waitlistSourceSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z
    .string()
    .max(INPUT_LIMITS.waitlistSource, "Source is too long")
    .regex(/^[a-z0-9._-]*$/, "Source contains invalid characters")
    .optional()
    .transform((value) => value || "direct"),
);

export const waitlistSchema = z
  .object({
    fullName: safeSingleLineField("Name", 80),
    email: safeEmailSchema,
    phone: z.preprocess(normalizeUaePhone, z.union([z.undefined(), uaeLocalMobileSchema])),
    instagramHandle: z
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        z
          .string()
          .min(1, "Instagram handle is required")
          .max(31, "Instagram handle is too long")
          .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Enter a valid Instagram handle"),
      ),
    linkedinUrl: z
      .string()
      .trim()
      .max(500, "URL is too long")
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine(
        (value) => !value || /^https?:\/\/([\w-]+\.)?linkedin\.com\//i.test(value),
        { message: "Enter a valid LinkedIn profile URL" },
      ),
    role: z.enum(["seller", "buyer"], {
      error: "Choose whether you are joining as a seller or a buyer",
    }),
    source: waitlistSourceSchema,
  })
  .strict();

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;

/** Draft state — role starts empty until the user picks one. */
export type WaitlistFormDraft = Omit<WaitlistFormValues, "role" | "phone"> & {
  role: "seller" | "buyer" | "";
  phone?: string;
};
