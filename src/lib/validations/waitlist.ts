import { z } from "zod";

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

export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Enter your name").max(80, "Use 80 characters or less"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined))
    .pipe(z.union([z.undefined(), uaeLocalMobileSchema])),
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
  role: z.enum(["seller", "buyer"], {
    error: "Choose whether you are joining as a seller or a buyer",
  }),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;

/** Draft state — role starts empty until the user picks one. */
export type WaitlistFormDraft = Omit<WaitlistFormValues, "role" | "phone"> & {
  role: "seller" | "buyer" | "";
  phone?: string;
};
