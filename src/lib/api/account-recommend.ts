import { apiFetch } from "@/lib/api/client";

export type RecommendLeadStatus =
  | "submitted"
  | "in_progress"
  | "confirmed"
  | "completed"
  | "not_proceeding";

export type RecommendLead = {
  id: string;
  recommenderId: string;
  clientName: string;
  inquiry: string;
  clientPhone: string;
  clientEmail: string;
  status: RecommendLeadStatus;
  rewardAmountFils: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmitRecommendLeadInput = {
  clientName: string;
  inquiry: string;
  clientPhone: string;
  clientEmail: string;
};

export async function fetchRecommendLeads(filters: { status?: RecommendLeadStatus; q?: string } = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.q?.trim()) query.set("q", filters.q.trim());
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiFetch<RecommendLead[]>(`/api/account/recommend/leads${suffix}`, undefined, { baseUrl: "" });
}

export async function submitRecommendLead(input: SubmitRecommendLeadInput) {
  return apiFetch<RecommendLead>(
    "/api/account/recommend/leads",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
