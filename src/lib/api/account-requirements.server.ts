import { billingApiUrl } from "@/lib/billing/session";

import { normalizeOpenRequirements, type RequirementRow } from "@/lib/api/account-requirements";

/** Server — admin-approved open requirements (same catalog the admin panel publishes). */
export async function loadOpenRequirements(page = 1, pageSize = 24) {
  try {
    const response = await fetch(
      billingApiUrl(`/requirements?page=${page}&pageSize=${pageSize}`),
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
      return { items: [], total: 0 };
    }
    return {
      items: normalizeOpenRequirements(payload.data as RequirementRow[]),
      total: payload.meta?.total ?? payload.data.length,
    };
  } catch {
    return { items: [], total: 0 };
  }
}
