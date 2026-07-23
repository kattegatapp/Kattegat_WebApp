import { apiFetch } from "@/lib/api/client";
import type { AccountIdentity } from "@/features/account/types";

export type BookingAction = "start" | "submit_completion" | "confirm_completion" | "cancel";

export type AccountWorkItem = {
  contract: {
    id: string;
    requirementId: string;
    applicationId: string;
    buyerId: string;
    sellerId: string;
    scope: string;
    price: number;
    startsAt: string | null;
    endsAt: string | null;
    location: string | null;
    cancellationTerms: string;
    status: "pending_signatures" | "active" | "completed" | "cancelled";
    buyerAcceptedAt: string | null;
    sellerAcceptedAt: string | null;
    activatedAt: string | null;
    createdAt: string;
  };
  booking: {
    id: string;
    status: "confirmed" | "in_progress" | "seller_completed" | "completed" | "cancelled";
    sellerCompletedAt: string | null;
    buyerConfirmedAt: string | null;
    createdAt: string;
  } | null;
  requirement: { id: string; title: string; description: string };
  buyer: { id: string; name: string; avatarUrl: string | null };
  seller: { id: string; name: string; avatarUrl: string | null };
  viewerRole: "buyer" | "seller";
};

export function fetchAccountWork(identity: AccountIdentity) {
  return apiFetch<AccountWorkItem[]>(`/api/account/bookings?identity=${identity}`, undefined, {
    baseUrl: "",
  });
}

export function acceptAccountContract(contractId: string, identity: AccountIdentity) {
  return apiFetch<AccountWorkItem>(
    `/api/account/bookings/contracts/${contractId}/accept`,
    { method: "POST", body: JSON.stringify({ identity }) },
    { baseUrl: "" },
  );
}

export function transitionAccountBooking(
  bookingId: string,
  action: BookingAction,
  identity: AccountIdentity,
) {
  return apiFetch<AccountWorkItem>(
    `/api/account/bookings/${bookingId}/status`,
    { method: "PATCH", body: JSON.stringify({ action, identity }) },
    { baseUrl: "" },
  );
}

export function submitAccountBookingReview(input: {
  bookingId: string;
  sellerId: string;
  rating: number;
  text: string;
}) {
  return apiFetch<{ id: string; isVerified: boolean }>(
    "/api/account/reviews",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
