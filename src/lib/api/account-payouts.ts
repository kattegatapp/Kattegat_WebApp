import { apiFetch } from "@/lib/api/client";

export type PayoutStatus = "pending" | "processed" | "failed";

export type MemberPayoutRequest = {
  id: string;
  amount: number;
  status: PayoutStatus;
  accountHolderName: string;
  iban: string;
  bankName: string;
  memberNote: string | null;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
};

export type CreateMemberPayoutPayload = {
  amountFils: number;
  accountHolderName: string;
  iban: string;
  bankName: string;
  memberNote?: string;
};

/** Server-authoritative withdrawal math (integer fils). */
export type WithdrawalBalanceSnapshot = {
  availableFils: number;
  walletPendingFils: number;
  reservedFils: number;
  paidOutFils: number;
  totalEarnedFils: number;
};

export async function fetchMyPayouts() {
  return apiFetch<MemberPayoutRequest[]>("/api/account/payouts", undefined, { baseUrl: "" });
}

export async function fetchAvailableWithdrawalBalance() {
  return apiFetch<WithdrawalBalanceSnapshot>("/api/account/payouts/available-balance", undefined, {
    baseUrl: "",
  });
}

export async function createPayoutRequest(payload: CreateMemberPayoutPayload) {
  return apiFetch<MemberPayoutRequest>(
    "/api/account/payouts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { baseUrl: "" },
  );
}
