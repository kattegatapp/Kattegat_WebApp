import { z } from "zod";

import {
  containsDangerousMarkup,
  normalizeText,
  safeMessageField,
  safeSingleLineField,
} from "@/lib/security/input";

const jobTypeSchema = z.enum(["full_time", "part_time", "gig", "one_off_event"]);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .optional()
  .or(z.literal("").transform(() => undefined));

function optionalBudgetFils() {
  return z
    .string()
    .optional()
    .transform((value) => (value ?? "").trim())
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Enter a valid amount in AED",
    })
    .transform((value) => (value ? Math.round(Number(value) * 100) : undefined));
}

export const JOB_TYPE_OPTIONS = [
  { value: "gig", label: "Gig" },
  { value: "one_off_event", label: "One-off event" },
  { value: "part_time", label: "Part time" },
  { value: "full_time", label: "Full time" },
] as const;

export const requirementFormSchema = z
  .object({
    title: safeSingleLineField("Title", 120).pipe(z.string().min(3, "Title must be at least 3 characters")),
    jobType: jobTypeSchema,
    description: safeMessageField(1, "Description is required").pipe(
      z.string().max(5000, "Description must be 5,000 characters or fewer"),
    ),
    location: safeSingleLineField("Location", 120),
    budgetMinAed: optionalBudgetFils(),
    budgetMaxAed: optionalBudgetFils(),
    startsAt: isoDate,
    endsAt: isoDate,
  })
  .superRefine((values, ctx) => {
    if (
      values.budgetMinAed != null &&
      values.budgetMaxAed != null &&
      values.budgetMinAed > values.budgetMaxAed
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["budgetMaxAed"],
        message: "Maximum budget must be at least the minimum",
      });
    }
    if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be on or after the start date",
      });
    }
  });

export type RequirementFormValues = z.input<typeof requirementFormSchema>;
export type RequirementParsed = z.output<typeof requirementFormSchema>;

export type RequirementPayload = {
  title: string;
  jobType: z.infer<typeof jobTypeSchema>;
  description: string;
  location: string;
  budgetMin?: number;
  budgetMax?: number;
  startsAt?: string;
  endsAt?: string;
  attachments?: string[];
};

export function toRequirementPayload(
  values: RequirementParsed,
  attachments: string[],
): RequirementPayload {
  return {
    title: values.title,
    jobType: values.jobType,
    description: values.description,
    location: values.location,
    budgetMin: values.budgetMinAed,
    budgetMax: values.budgetMaxAed,
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    attachments: attachments.length ? attachments : undefined,
  };
}

export type RequirementDiffSource = {
  title: string;
  jobType: string;
  description: string;
  location: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  attachments?: string[];
};

export function buildUpdateRequirementPayload(
  values: RequirementParsed,
  existing: RequirementDiffSource,
  attachments: string[],
): Partial<RequirementPayload> {
  const payload: Partial<RequirementPayload> = {};

  if (values.title !== existing.title) payload.title = values.title;
  if (values.description !== existing.description) payload.description = values.description;
  if (values.location !== existing.location) payload.location = values.location;
  if (values.jobType !== existing.jobType) payload.jobType = values.jobType;

  const nextStarts = values.startsAt || undefined;
  const existingStarts = existing.startsAt?.slice(0, 10) || undefined;
  if (nextStarts !== existingStarts) payload.startsAt = nextStarts;

  const nextEnds = values.endsAt || undefined;
  const existingEnds = existing.endsAt?.slice(0, 10) || undefined;
  if (nextEnds !== existingEnds) payload.endsAt = nextEnds;

  const nextMin = values.budgetMinAed;
  const existingMin = existing.budgetMin ?? undefined;
  if (nextMin !== existingMin) payload.budgetMin = nextMin;

  const nextMax = values.budgetMaxAed;
  const existingMax = existing.budgetMax ?? undefined;
  if (nextMax !== existingMax) payload.budgetMax = nextMax;

  const existingAttachments = existing.attachments ?? [];
  if (JSON.stringify(attachments) !== JSON.stringify(existingAttachments)) {
    payload.attachments = attachments;
  }

  return payload;
}

export const requirementBodySchema = z.object({
  title: z
    .string()
    .transform((value) => normalizeText(value))
    .pipe(z.string().min(3).max(120))
    .refine((value) => !containsDangerousMarkup(value), { message: "Title contains invalid characters" }),
  jobType: jobTypeSchema,
  description: z
    .string()
    .transform((value) => normalizeText(value, { allowNewlines: true }))
    .pipe(z.string().min(1).max(5000))
    .refine((value) => !containsDangerousMarkup(value), {
      message: "Description contains invalid characters",
    }),
  location: z
    .string()
    .transform((value) => normalizeText(value))
    .pipe(z.string().min(1).max(120))
    .refine((value) => !containsDangerousMarkup(value), {
      message: "Location contains invalid characters",
    }),
  budgetMin: z.number().int().nonnegative().optional(),
  budgetMax: z.number().int().nonnegative().optional(),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  attachments: z.array(z.string().url()).max(20).optional(),
});

export const updateRequirementBodySchema = requirementBodySchema.partial();
