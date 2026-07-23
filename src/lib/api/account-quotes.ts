import { apiFetch } from "@/lib/api/client";

export type AccountQuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type AccountQuote = {
  id: string;
  sellerId: string;
  buyerId: string | null;
  clientRef: string;
  client: { id: string; name: string; email: string | null; phone: string | null };
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  discount: number;
  vat: number;
  vatRate: number;
  total: number;
  currency: string;
  status: AccountQuoteStatus;
  requirementId: string | null;
  conversationId: string | null;
  expiresAt: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

export function fetchAccountReceivedQuotes() {
  return apiFetch<AccountQuote[]>("/api/account/quotes/received", undefined, { baseUrl: "" });
}

export function respondToAccountQuote(quoteId: string, response: "accept" | "decline") {
  return apiFetch<AccountQuote>(
    `/api/account/quotes/${quoteId}/respond`,
    { method: "POST", body: JSON.stringify({ response }) },
    { baseUrl: "" },
  );
}
