import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type RecommendLeadStatus = "submitted" | "in_progress" | "confirmed" | "completed" | "not_proceeding";
export interface AdminRecommendLead {
  id: string; recommenderId: string; recommenderName: string; recommenderContact: string;
  clientName: string; inquiry: string; clientPhone: string; clientEmail: string;
  status: RecommendLeadStatus; createdAt: string; updatedAt: string;
}
export type FoundingStatus = "submitted" | "under_review" | "accepted" | "rejected" | "waitlisted";
export interface AdminFoundingApplication {
  id: string; applicantId: string; applicantName: string | null; categoryName: string | null;
  whyYou: string; audienceReach: string | null; status: FoundingStatus; createdAt: string;
}
export interface AdminManagedUser {
  id: string; bid: string | null; sid: string | null; originalRole: string; email: string;
  phone: string | null; username: string | null; businessName: string | null; avatarUrl: string | null; status: string; createdAt: string;
}
export interface AdminUserDetail extends AdminManagedUser {
  sellerProfile: { tier: string; displayName: string | null; aggregateRating: number; reviewCount: number; bio: string | null; socialLinks: Record<string, string>; tags: string[]; customSlug: string | null; vatRegistered: boolean } | null;
  buyerProfile: { bid: string } | null;
  adminProfile: { adminRole: string } | null;
}
interface AdminConversation { id: string; status: "open" | "closed"; }
export interface AdminWaitlistEntry {
  id: string; fullName: string; email: string; phone: string | null; instagramHandle: string;
  linkedinUrl: string | null; role: "seller" | "buyer"; source: string; createdAt: string;
}
export interface PendingIdentityVerification {
  sellerId: string; sellerDisplayName: string | null; sellerAvatarUrl: string | null;
  documentUrl: string | null; documentBackUrl: string | null; submittedAt: string | null;
}
export interface IdentityVerificationQueue {
  items: PendingIdentityVerification[]; page: number; pageSize: number; total: number;
}

export const fetchRecommendLeads = () => apiFetch<AdminRecommendLead[]>("/api/admin/recommend-leads", undefined, { baseUrl: "" });
export const updateRecommendLead = (id: string, status: RecommendLeadStatus) => apiFetch<AdminRecommendLead>(`/api/admin/recommend-leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, { baseUrl: "" });
export const fetchFoundingApplications = () => apiFetch<AdminFoundingApplication[]>("/api/admin/founding-members", undefined, { baseUrl: "" });
export const reviewFoundingApplication = (id: string, decision: "under_review" | "accepted" | "rejected" | "waitlisted") => apiFetch<null>(`/api/admin/founding-members/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }, { baseUrl: "" });
export async function fetchManagedUsers(q = "", page = 1, filters?: { status?: string; role?: string }) {
  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (q.trim()) params.set("q", q.trim());
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.role && filters.role !== "all") params.set("role", filters.role);
  return apiFetchEnvelope<AdminManagedUser[]>(`/api/admin/users?${params}`, undefined, { baseUrl: "" });
}
export type AdminUserUpdate = { status?: string; username?: string; phone?: string; businessName?: string; avatarUrl?: string | null; sellerProfile?: { displayName?: string; bio?: string | null; socialLinks?: Record<string, string>; tags?: string[]; customSlug?: string | null; tier?: string; vatRegistered?: boolean } };
export const updateManagedUser = (id: string, input: AdminUserUpdate) => {
  const payload = { ...input };
  if (!payload.username?.trim()) delete payload.username;
  return apiFetch<AdminManagedUser>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, { baseUrl: "" });
};
export const fetchManagedUser = (id: string) => apiFetch<AdminUserDetail>(`/api/admin/users/${id}`, undefined, { baseUrl: "" });
export async function messageManagedUser(id: string, role: "buyer" | "seller", body: string, imageUrl?: string) {
  const conversation = await apiFetch<AdminConversation>("/api/admin/conversations", { method: "POST", body: JSON.stringify({ counterpartyId: id, counterpartyRole: role }) }, { baseUrl: "" });
  if (body.trim()) await apiFetch(`/api/admin/conversations/${conversation.id}/messages`, { method: "POST", body: JSON.stringify({ body, type: "text" }) }, { baseUrl: "" });
  if (imageUrl?.trim()) return apiFetch(`/api/admin/conversations/${conversation.id}/messages`, { method: "POST", body: JSON.stringify({ body: imageUrl.trim(), type: "image" }) }, { baseUrl: "" });
  return null;
}
export async function fetchWaitlist(q = "", page = 1) {
  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (q.trim()) params.set("q", q.trim());
  return apiFetchEnvelope<AdminWaitlistEntry[]>(`/api/admin/waitlist?${params}`, undefined, { baseUrl: "" });
}
export async function fetchIdentityVerifications(page = 1): Promise<IdentityVerificationQueue> {
  const response = await apiFetchEnvelope<PendingIdentityVerification[]>(`/api/admin/identity-verifications?page=${page}&pageSize=20`, undefined, { baseUrl: "" });
  const items = Array.isArray(response.data) ? response.data : [];
  return { items, page: response.meta?.page ?? page, pageSize: 20, total: response.meta?.total ?? items.length };
}
export const approveIdentityVerification = (sellerId: string) => apiFetch<null>(`/api/admin/identity-verifications/${sellerId}/approve`, { method: "POST" }, { baseUrl: "" });
export const rejectIdentityVerification = (sellerId: string, reason: string) => apiFetch<null>(`/api/admin/identity-verifications/${sellerId}/reject`, { method: "POST", body: JSON.stringify({ reason }) }, { baseUrl: "" });
