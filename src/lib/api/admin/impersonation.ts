import { apiFetch } from "@/lib/api/client";
import type { AdminUserDetail } from "@/lib/api/admin/growth";

export type ImpersonationLoginResult = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  user: AdminUserDetail;
  redirectTo: string;
};

export async function impersonateManagedUser(userId: string) {
  return apiFetch<ImpersonationLoginResult>(`/api/admin/users/${userId}/impersonate`, {
    method: "POST",
    body: "{}",
  }, { baseUrl: "" });
}

export async function exitImpersonation() {
  return apiFetch<{ redirectTo: string }>("/api/impersonation/exit", {
    method: "POST",
    body: "{}",
  }, { baseUrl: "" });
}

export async function fetchImpersonationStatus() {
  return apiFetch<ImpersonationState | null>("/api/impersonation/status", undefined, {
    baseUrl: "",
  });
}

export type ImpersonationState = {
  targetUserId: string;
  targetEmail: string;
  targetLabel: string;
  startedAt: string;
};
