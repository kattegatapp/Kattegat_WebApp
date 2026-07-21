import { z } from "zod";

export const billingCheckoutSchema = z
  .object({
    plan: z.enum(["pro_monthly", "pro_annual"]),
  })
  .strict();

export type BillingCheckoutValues = z.infer<typeof billingCheckoutSchema>;
