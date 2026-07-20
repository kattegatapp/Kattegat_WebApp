import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type StripeBillingMode = "test" | "live";

export interface BillingProfileStatus {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  secretKeyPreview: string | null;
}

export interface BillingConfigurationStatus {
  mode: StripeBillingMode;
  configured: boolean;
  missingFields: string[];
  test: BillingProfileStatus;
  live: BillingProfileStatus;
  webhookUrl: string;
  envFallbackActive: boolean;
  proPricingConfigured: boolean;
  proMonthlyPriceFils: number | null;
  proAnnualPriceFils: number | null;
}

export type UpdateBillingConfigurationInput = {
  mode?: StripeBillingMode;
  test?: {
    secretKey?: string;
    webhookSecret?: string;
  };
  live?: {
    secretKey?: string;
    webhookSecret?: string;
  };
};

export async function fetchBillingConfiguration(): Promise<BillingConfigurationStatus> {
  return apiFetch<BillingConfigurationStatus>("/api/admin/settings/billing", undefined, {
    baseUrl: "",
  });
}

export async function updateBillingConfiguration(
  input: UpdateBillingConfigurationInput,
): Promise<BillingConfigurationStatus> {
  return apiFetch<BillingConfigurationStatus>(
    "/api/admin/settings/billing",
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export interface AdminPaymentListItem {
  id: string;
  userId: string;
  userEmail: string | null;
  businessName: string | null;
  description: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "refunded" | "disputed";
  createdAt: string;
}

export async function fetchAdminPayments(q: string, page: number) {
  const params = new URLSearchParams({ page: String(page), limit: "25" });
  if (q.trim()) params.set("q", q.trim());
  return apiFetchEnvelope<AdminPaymentListItem[]>(`/api/admin/payments?${params}`, undefined, {
    baseUrl: "",
  });
}
