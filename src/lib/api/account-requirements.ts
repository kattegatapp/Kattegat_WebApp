import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";
import type { RequirementPayload } from "@/lib/validations/requirement";

export type AccountRequirement = {
  id: string;
  buyerId?: string;
  title: string;
  description: string;
  location: string;
  budgetMin: number | null;
  budgetMax: number | null;
  jobType: string;
  status?: string;
  rejectionReason?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  viewCount: number;
};

export type RequirementRow = {
  id: string;
  buyerId?: string;
  title?: string;
  description?: string;
  location?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  jobType: string;
  status?: string;
  createdAt: string;
  viewCount?: number;
};

export function normalizeOpenRequirements(data: RequirementRow[]) {
  return data.map((item) => ({
    id: item.id,
    buyerId: item.buyerId,
    title: item.title?.trim() || "Open requirement",
    description: item.description?.trim() || "",
    location: item.location?.trim() || "UAE",
    budgetMin: item.budgetMin ?? null,
    budgetMax: item.budgetMax ?? null,
    jobType: item.jobType,
    status: item.status,
    createdAt: item.createdAt,
    viewCount: item.viewCount ?? 0,
  }));
}

/** Client — admin-approved open requirements via account BFF. */
export async function fetchOpenRequirements(page = 1, pageSize = 24) {
  try {
    const { data, meta } = await apiFetchEnvelope<RequirementRow[]>(
      `/api/account/requirements?page=${page}&pageSize=${pageSize}`,
      { cache: "no-store" },
      { baseUrl: "" },
    );
    return {
      items: normalizeOpenRequirements(data),
      total: meta?.total ?? data.length,
    };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function fetchMyRequirements() {
  return apiFetch<AccountRequirement[]>("/api/account/requirements/mine", undefined, { baseUrl: "" });
}

export async function fetchMyRequirement(requirementId: string) {
  return apiFetch<AccountRequirement>(`/api/account/requirements/${requirementId}`, undefined, {
    baseUrl: "",
  });
}

export async function createAccountRequirement(payload: RequirementPayload) {
  return apiFetch<AccountRequirement>(
    "/api/account/requirements/mine",
    { method: "POST", body: JSON.stringify(payload) },
    { baseUrl: "" },
  );
}

export async function updateAccountRequirement(requirementId: string, payload: Partial<RequirementPayload>) {
  return apiFetch<AccountRequirement>(
    `/api/account/requirements/${requirementId}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    { baseUrl: "" },
  );
}

export function requirementEditable(status?: string) {
  return status !== "awarded" && status !== "closed";
}
