import type { NextRequest } from "next/server";

import { proxySellerBackend } from "@/lib/billing/session";
import { parseSecureJson } from "@/lib/security/request";
import { billingCheckoutSchema } from "@/lib/validations/billing";

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, billingCheckoutSchema, {
    maxBytes: 512,
    checkOrigin: true,
  });
  if (!parsed.ok) return parsed.response;

  return proxySellerBackend("/payments/checkout-session", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
