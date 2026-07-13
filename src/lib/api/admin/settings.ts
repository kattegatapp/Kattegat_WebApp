import { apiFetch } from "@/lib/api/client";
import type { PublicAppSettings } from "@/lib/api/settings";

export interface AdminSettings extends PublicAppSettings {
  updatedBy: string | null;
}

/** Matches backend `updateAppSettingsSchema` — section-level deep partial PATCH. */
export type UpdateAdminSettingsInput = {
  brand?: Partial<AdminSettings["brand"]>;
  metadata?: Partial<AdminSettings["metadata"]>;
  links?: Partial<AdminSettings["links"]>;
  features?: Partial<AdminSettings["features"]>;
  operations?: Partial<AdminSettings["operations"]>;
};

export async function fetchAdminSettings(): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/admin/settings", undefined, { baseUrl: "" });
}

export async function updateAdminSettings(input: UpdateAdminSettingsInput): Promise<AdminSettings> {
  return apiFetch<AdminSettings>(
    "/api/admin/settings",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    { baseUrl: "" },
  );
}

export interface EmailConfigurationStatus {
  configured: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
  passwordConfigured: boolean;
  missingVariables: string[];
}

export async function fetchEmailConfiguration(): Promise<EmailConfigurationStatus> {
  return apiFetch<EmailConfigurationStatus>("/api/admin/settings/email", undefined, { baseUrl: "" });
}

export async function sendTestEmail(recipient: string): Promise<{ delivered: boolean; recipient: string }> {
  return apiFetch(
    "/api/admin/settings/email/test",
    { method: "POST", body: JSON.stringify({ recipient }) },
    { baseUrl: "" },
  );
}
