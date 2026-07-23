import { apiFetch } from "@/lib/api/client";

export type SellerClient = {
  id: string; name: string; contact: string; email: string | null; phone: string | null;
  quoteCount: number; invoiceCount: number; bookingCount: number;
};
export type SellerQuote = {
  id: string; clientRef: string; client: { name: string };
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  subtotal: number; discount: number; vat: number; vatRate?: number; total: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired"; createdAt: string;
};
export type SellerInvoice = {
  id: string; number: string; clientName: string; total: number;
  status: "unpaid" | "paid" | "overdue"; dueDate: string | null; sentAt: string | null;
};
const base = "/api/account/seller-tools";
export const fetchSellerClients = () => apiFetch<SellerClient[]>(`${base}/clients`, undefined, { baseUrl: "" });
export const createSellerClient = (input: { name: string; email?: string; phone?: string }) => apiFetch<SellerClient>(`${base}/clients`, { method: "POST", body: JSON.stringify(input) }, { baseUrl: "" });
export const fetchSellerQuotes = () => apiFetch<SellerQuote[]>(`${base}/quotes`, undefined, { baseUrl: "" });
export type CreateSellerQuoteInput = {
  // Either a Client Book entry (clientRef) or a live conversation (conversationId) must be
  // given — the backend resolves/creates the Client Book entry from the conversation's buyer
  // when quoting straight out of a chat thread, mirroring the mobile "Quote" chat action.
  clientRef?: string;
  conversationId?: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  discount: number;
};
export const createSellerQuote = (input: CreateSellerQuoteInput) => apiFetch<SellerQuote>(`${base}/quotes`, { method: "POST", body: JSON.stringify(input) }, { baseUrl: "" });
export const quoteAction = (id: string, action: "send" | "accept" | "decline") => apiFetch<SellerQuote>(`${base}/quotes/${id}/${action}`, { method: "POST", body: "{}" }, { baseUrl: "" });
export const fetchSellerInvoices = () => apiFetch<SellerInvoice[]>(`${base}/invoices`, undefined, { baseUrl: "" });
export const invoiceAction = (id: string, action: "send" | "mark-paid") => apiFetch<SellerInvoice>(`${base}/invoices/${id}/${action}`, { method: "POST", body: "{}" }, { baseUrl: "" });
