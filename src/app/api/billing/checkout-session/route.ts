import type { NextRequest } from "next/server";
import { proxySellerBackend } from "@/lib/billing/session";

export async function POST(request: NextRequest) {
  return proxySellerBackend("/payments/checkout-session", {
    method: "POST",
    body: await request.text(),
  });
}
