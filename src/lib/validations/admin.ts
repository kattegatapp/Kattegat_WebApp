import { z } from "zod";

import { loginPasswordSchema, safeEmailSchema, safePasswordSchema } from "@/lib/security/input";

export const adminLoginSchema = z
  .object({
    email: safeEmailSchema,
    password: safePasswordSchema,
  })
  .strict();

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const adminLoginPasswordSchema = z
  .object({
    email: safeEmailSchema,
    password: loginPasswordSchema,
  })
  .strict();
