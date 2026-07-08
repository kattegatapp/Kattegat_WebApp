import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Enter your admin email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
