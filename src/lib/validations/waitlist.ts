import { z } from "zod";

export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Enter your name").max(80, "Use 80 characters or less"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(32, "Use 32 characters or less").optional(),
  instagramHandle: z
    .string()
    .trim()
    .min(1, "Instagram handle is required")
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Enter a valid Instagram handle"),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/([\w-]+\.)?linkedin\.com\/.+/i.test(val), {
      message: "Enter a valid LinkedIn profile URL",
    }),
  role: z.enum(["seller", "buyer"]),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
