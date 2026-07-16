import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => value || undefined),
  company: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
  topic: z.enum(["hiring", "joining", "partnership", "support", "other"], {
    message: "Choose a topic",
  }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more (at least 20 characters)")
    .max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type ContactFormDraft = Omit<ContactFormValues, "topic"> & {
  topic: ContactFormValues["topic"] | "";
};
