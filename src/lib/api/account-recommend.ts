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

export async function fetchRecommendLeads() {
  return apiFetch<RecommendLead[]>("/api/account/recommend/leads", undefined, { baseUrl: "" });
}

export async function submitRecommendLead(input: SubmitRecommendLeadInput) {
  return apiFetch<RecommendLead>(
    "/api/account/recommend/leads",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
