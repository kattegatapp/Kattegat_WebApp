import { proxySellerBackend } from "@/lib/billing/session";

export async function GET() {
  const response = await proxySellerBackend("/auth/me");
  return response;
}
