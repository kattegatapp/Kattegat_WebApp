import { apiFetch } from "@/lib/api/client";
import type { AdminLoginValues } from "@/lib/validations/admin";
import type { PublicAppSettings } from "@/lib/api/settings";

export interface AdminSettings extends PublicAppSettings {
  updatedBy: string | null;
}

interface AdminLoginResult {
  user: {
    id: string;
    email: string;
    adminRole: string | null;
    status: string;
  };
}

export async function clearAdminToken() {
  await apiFetch<null>("/api/admin/logout", { method: "POST" }, { baseUrl: "" });
}

export async function loginAdmin(values: AdminLoginValues): Promise<AdminLoginResult> {
  const result = await apiFetch<AdminLoginResult>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(values),
  }, { baseUrl: "" });
  return result;
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/admin/settings", undefined, { baseUrl: "" });
}

export async function updateAdminSettings(input: Partial<AdminSettings>): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  }, { baseUrl: "" });
}
