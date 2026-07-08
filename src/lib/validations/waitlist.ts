import { z } from "zod";

export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Enter your name").max(80, "Use 80 characters or less"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(32, "Use 32 characters or less").optional(),
  role: z.enum(["seller", "buyer"]),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
