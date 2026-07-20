import { proxySellerBackend } from "@/lib/billing/session";

export async function GET() {
  return proxySellerBackend("/payments/history");
}
