import { apiFetch } from "@/lib/api/client";
import type { AdminLoginValues } from "@/lib/validations/admin";

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
  return apiFetch<AdminLoginResult>(
    "/api/admin/login",
    {
      method: "POST",
      body: JSON.stringify(values),
    },
    { baseUrl: "" },
  );
}
