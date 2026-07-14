import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type ModerationTargetType = "review" | "listing" | "requirement" | "message";
export type ModerationAction = "approved" | "hidden" | "removed";

export interface AdminModerationReport {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  reportedBy: string | null;
  reason: string | null;
  action: ModerationAction | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export async function fetchModerationReports(page = 1, status: "pending" | "resolved" = "pending") {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    status,
  });
  const response = await apiFetchEnvelope<AdminModerationReport[]>(
    `/api/admin/moderation?${params}`,
    undefined,
    { baseUrl: "" },
  );
  const items = Array.isArray(response.data) ? response.data : [];
  return {
    items,
    page: response.meta?.page ?? page,
    pageSize: 20,
    total: response.meta?.total ?? items.length,
  };
}

export const resolveModerationReport = (
  reportId: string,
  action: ModerationAction,
  reason?: string,
) =>
  apiFetch<AdminModerationReport>(
    `/api/admin/moderation/${reportId}/resolve`,
    {
      method: "POST",
      body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
    },
    { baseUrl: "" },
  );
