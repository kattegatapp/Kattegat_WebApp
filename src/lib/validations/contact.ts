import { z } from "zod";

import {
  safeEmailSchema,
  safeMessageField,
  safeOptionalSingleLineField,
  safeSingleLineField,
} from "@/lib/security/input";

export const contactSchema = z
  .object({
    fullName: safeSingleLineField("Name", 80),
    email: safeEmailSchema,
    phone: z
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        z
          .string()
          .max(30, "Phone number is too long")
          .regex(/^[+\d\s().-]*$/, "Enter a valid phone number")
          .optional(),
      )
      .transform((value) => value || undefined),
    company: safeOptionalSingleLineField(100),
    topic: z.enum(["hiring", "joining", "partnership", "support", "other"], {
      message: "Choose a topic",
    }),
    message: safeMessageField(20, "Tell us a bit more (at least 20 characters)"),
  })
  .strict();

export type ContactFormValues = z.infer<typeof contactSchema>;
export type ContactFormDraft = Omit<ContactFormValues, "topic"> & {
  topic: ContactFormValues["topic"] | "";
};
