import { apiFetch } from "@/lib/api/client";

export type AccountInvoice = {
  id: string;
  sellerId: string;
  quoteRef: string | null;
  bookingId: string | null;
  clientRef: string;
  clientName: string;
  number: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  currency: string;
  status: "unpaid" | "paid" | "overdue";
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

/** Invoices sent to this buyer — the seller-only Seller Tools endpoints never accept a
 * buyer's own id, this is the buyer's own read path. */
export function fetchAccountReceivedInvoices() {
  return apiFetch<AccountInvoice[]>("/api/account/invoices/received", undefined, { baseUrl: "" });
}

/** Creates a Stripe Checkout Session for paying this invoice online — the alternative to
 * the seller manually marking it paid once they've received payment some other way. */
export function createAccountInvoiceCheckoutSession(invoiceId: string) {
  return apiFetch<{ url: string }>(
    `/api/account/invoices/received/${invoiceId}/checkout-session`,
    { method: "POST", body: JSON.stringify({}) },
    { baseUrl: "" },
  );
}
