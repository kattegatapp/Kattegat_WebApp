import { proxySellerBackend } from "@/lib/billing/session";
import { assertSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  return proxySellerBackend("/payments/billing-portal", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
