import { z } from "zod";

/** Shared maxlength caps — keep aligned with Zod schemas below. */
export const INPUT_LIMITS = {
  email: 254,
  password: 128,
  username: 30,
  businessName: 80,
  displayName: 80,
  company: 100,
  referralCode: 40,
  phone: 40,
  contactPhone: 30,
  instagramHandle: 30,
  linkedinUrl: 500,
  message: 2000,
  waitlistSource: 40,
  uaeMobileLocal: 9,
} as const;

/** Strip null bytes and C0 control characters (except tab/newline for messages). */
export function normalizeText(value: string, options?: { allowNewlines?: boolean }) {
  const withoutNull = value.normalize("NFKC").replace(/\u0000/g, "");
  if (options?.allowNewlines) {
    return withoutNull
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim();
  }
  return withoutNull.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

const MARKUP_OR_INJECTION =
  /<[^>]*>|javascript:|data:text\/html|vbscript:|on\w+\s*=|&#x0*0*3c;|&lt;script/i;

export function containsDangerousMarkup(value: string) {
  return MARKUP_OR_INJECTION.test(value);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function cleanSingleLine(value: string) {
  return escapeHtml(normalizeText(value));
}

const preprocessText =
  (options?: { allowNewlines?: boolean }) =>
  (value: unknown) =>
    typeof value === "string" ? normalizeText(value, options) : value;

export const safeEmailSchema = z.preprocess(
  preprocessText(),
  z
    .string()
    .min(3, "Enter a valid email")
    .max(254, "Email is too long")
    .email("Enter a valid email")
    .transform((email) => email.toLowerCase()),
);

export const safePasswordSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : value),
  z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .refine((password) => !/[\u0000-\u001F\u007F]/.test(password), {
      message: "Password contains invalid characters",
    }),
);

export const loginPasswordSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string()
    .min(1, "Enter your password")
    .max(128, "Password is too long")
    .refine((password) => !/[\u0000-\u001F\u007F]/.test(password), {
      message: "Password contains invalid characters",
    }),
);

export function safeSingleLineField(label: string, max: number) {
  return z.preprocess(
    preprocessText(),
    z
      .string()
      .min(1, `${label} is required`)
      .max(max, `Use ${max} characters or less`)
      .refine((value) => !containsDangerousMarkup(value), {
        message: `${label} contains invalid characters`,
      }),
  );
}

export function safeOptionalSingleLineField(max: number) {
  return z.preprocess(
    preprocessText(),
    z
      .string()
      .max(max, `Use ${max} characters or less`)
      .refine((value) => !value || !containsDangerousMarkup(value), {
        message: "Contains invalid characters",
      })
      .optional()
      .transform((value) => value || undefined),
  );
}

export const usernameSchema = z.preprocess(
  preprocessText(),
  z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[A-Za-z0-9_.]+$/,
      "Username may contain only letters, numbers, underscores, and periods",
    ),
);

export const phoneSchema = z.preprocess(
  preprocessText(),
  z
    .string()
    .max(40, "Phone number is too long")
    .regex(/^[+\d\s().-]*$/, "Enter a valid phone number")
    .optional()
    .transform((value) => value || undefined),
);

export const referralCodeSchema = z.preprocess(
  preprocessText(),
  z
    .string()
    .max(40, "Referral code is too long")
    .regex(/^[A-Za-z0-9_-]*$/, "Referral code contains invalid characters")
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
);

export const safeMessageSchema = z.preprocess(
  preprocessText({ allowNewlines: true }),
  z
    .string()
    .min(1)
    .max(2000, "Message is too long")
    .refine((value) => !containsDangerousMarkup(value), {
      message: "Message contains invalid characters",
    }),
);

export function safeMessageField(min: number, minMessage: string) {
  return z.preprocess(
    preprocessText({ allowNewlines: true }),
    z
      .string()
      .min(min, minMessage)
      .max(INPUT_LIMITS.message, "Message is too long")
      .refine((value) => !containsDangerousMarkup(value), {
        message: "Message contains invalid characters",
      }),
  );
}

export function safeOptionalMessageField(max: number) {
  return z.preprocess(
    preprocessText({ allowNewlines: true }),
    z
      .string()
      .max(max, `Use ${max} characters or less`)
      .refine((value) => !value || !containsDangerousMarkup(value), {
        message: "Contains invalid characters",
      })
      .optional()
      .transform((value) => value || undefined),
  );
}
