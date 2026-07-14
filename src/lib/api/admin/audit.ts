import { apiFetchEnvelope } from "@/lib/api/client";

export interface AdminAuditLog {
  id: string;
  action: string;
  category: string | null;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;
  resourceRole: string | null;
  summary: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminAuditLogPage {
  items: AdminAuditLog[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminAuditLogFilters {
  q?: string;
  action?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAdminAuditLogs(
  filters: AdminAuditLogFilters = {},
): Promise<AdminAuditLogPage> {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.action && filters.action !== "all") params.set("action", filters.action);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 25));

  const envelope = await apiFetchEnvelope<AdminAuditLog[] | { items: AdminAuditLog[] }>(
    `/api/admin/audit-logs?${params.toString()}`,
    undefined,
    { baseUrl: "" },
  );
  const items = Array.isArray(envelope.data) ? envelope.data : envelope.data.items ?? [];
  return {
    items,
    page: envelope.meta?.page ?? filters.page ?? 1,
    pageSize: filters.pageSize ?? 25,
    total: envelope.meta?.total ?? items.length,
  };
}
