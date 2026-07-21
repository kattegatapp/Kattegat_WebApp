import { apiFetch } from "@/lib/api/client";

export type PayoutStatus = "pending" | "processed" | "failed";

export interface AdminPayoutRequest {
  id: string;
  memberId: string;
  memberEmail: string | null;
  memberName: string | null;
  amount: number; // fils
  status: PayoutStatus;
  accountHolderName: string;
  iban: string;
  bankName: string;
  memberNote: string | null;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export const fetchPayouts = (status?: PayoutStatus | "all") => {
  const query = status && status !== "all" ? `?status=${status}` : "";
  return apiFetch<AdminPayoutRequest[]>(`/api/admin/payouts${query}`, undefined, { baseUrl: "" });
};

export const processPayout = (id: string) =>
  apiFetch<null>(`/api/admin/payouts/${id}/process`, { method: "POST" }, { baseUrl: "" });

export const rejectPayout = (id: string, reason: string) =>
  apiFetch<null>(
    `/api/admin/payouts/${id}/reject`,
    { method: "POST", body: JSON.stringify({ reason }) },
    { baseUrl: "" },
  );
