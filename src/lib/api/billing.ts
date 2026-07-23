import { apiFetch } from "@/lib/api/client";

export type BillingPlan = "pro_monthly" | "pro_annual";

export interface BillingUser {
  id: string;
  email: string;
  sid: string | null;
  bid: string | null;
  businessName: string | null;
  username: string | null;
}

export async function fetchBillingMe(): Promise<BillingUser | null> {
  try {
    return await apiFetch<BillingUser>("/api/billing/me", undefined, { baseUrl: "" });
  } catch {
    return null;
  }
}

export async function loginForBilling(email: string, password: string) {
  return apiFetch<BillingUser>(
    "/api/billing/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { baseUrl: "" },
  );
}

export async function registerForBilling(input: {
  email: string;
  password: string;
  businessName?: string;
}) {
  return apiFetch<BillingUser>(
    "/api/billing/register",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        role: "seller",
        businessName: input.businessName,
      }),
    },
    { baseUrl: "" },
  );
}

export async function createBillingCheckoutSession(plan: BillingPlan) {
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return apiFetch<{ url: string }>(
    "/api/billing/checkout-session",
    {
      method: "POST",
      body: JSON.stringify({ plan }),
      headers: { "Idempotency-Key": idempotencyKey },
    },
    { baseUrl: "" },
  );
}

export async function createBillingPortalSession() {
  return apiFetch<{ url: string }>(
    "/api/billing/billing-portal",
    { method: "POST", body: JSON.stringify({}) },
    { baseUrl: "" },
  );
}

export async function logoutBilling() {
  return apiFetch<null>("/api/billing/logout", { method: "POST" }, { baseUrl: "" });
}

export interface PaymentHistoryItem {
  id: string;
  description: string;
  amount: number;
  status: "succeeded" | "failed" | "refunded" | "disputed";
  createdAt: string;
}

export async function fetchBillingHistory(): Promise<PaymentHistoryItem[]> {
  return apiFetch<PaymentHistoryItem[]>("/api/billing/history", undefined, { baseUrl: "" });
}
