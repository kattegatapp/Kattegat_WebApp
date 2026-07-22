import { validateChatMessageInput } from "@/lib/sanitize/chat-message";
import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type RecommendLeadStatus = "submitted" | "in_progress" | "confirmed" | "completed" | "not_proceeding";
export interface AdminRecommendLead {
  id: string; recommenderId: string; recommenderName: string; recommenderContact: string;
  clientName: string; inquiry: string; clientPhone: string; clientEmail: string;
  status: RecommendLeadStatus; rewardAmountFils: number | null; createdAt: string; updatedAt: string;
}
export type FoundingStatus = "submitted" | "under_review" | "accepted" | "rejected" | "waitlisted";
export type ContactAgentRequestStatus = "new" | "in_progress" | "contacted" | "resolved" | "closed";
export interface AdminContactAgentRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  sellerId: string;
  sellerName: string;
  listingId: string | null;
  listingTitle: string | null;
  listingCoverImage?: string | null;
  listingPricing?: { amount?: number; unit?: string | null } | null;
  message: string;
  status: ContactAgentRequestStatus;
  assignedTo: string | null;
  assignedName: string | null;
  adminNote: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Max of case update + related chat activity — drives WhatsApp-style inbox order. */
  lastActivityAt?: string;
  lastMessagePreview?: string | null;
  /** Last message in related threads came from the buyer or seller. */
  awaitingReply?: boolean;
  /** status === new — never worked by ops yet. */
  isNewInquiry?: boolean;
  /** Counterparty messages since the last admin reply (WhatsApp-style badge). */
  unreadCount?: number;
}
export interface AdminFoundingApplication {
  id: string; applicantId: string; applicantName: string | null; categoryName: string | null;
  whyYou: string; audienceReach: string | null; status: FoundingStatus; createdAt: string;
}
export type AdminCompetitionStatus = "upcoming" | "live" | "paused" | "ended" | "cancelled";
export interface AdminCompetitionParticipant {
  userId: string; name: string; email: string; acceptedAt: string; eligible: boolean;
  disqualificationReason: string | null; referralCount: number; rank: number | null;
}
export interface AdminCompetition {
  id: string; documentId: string; termsVersion: string; title: string; startsAt: string; endsAt: string;
  prizePoolAed: number; status: AdminCompetitionStatus; participantCount: number;
  prizes: Array<{ place: 1 | 2 | 3; amountAed: number; minimumActiveReferrals: number }>;
  participants: AdminCompetitionParticipant[];
}
export type AdminCompetitionUpdate = {
  title?: string; status?: AdminCompetitionStatus; startsAt?: string; endsAt?: string;
  documentId?: string; termsVersion?: string; firstPrizeAed?: number; secondPrizeAed?: number;
  thirdPrizeAed?: number; firstThreshold?: number; secondThreshold?: number; thirdThreshold?: number;
};
export type VettedApplicationStatus = "submitted" | "under_review" | "accepted" | "denied" | "waitlisted";
export type VettedReviewDecision = "under_review" | "accepted" | "denied" | "waitlisted";
export interface AdminVettedApplication {
  id: string;
  memberId: string;
  memberName: string | null;
  categoryName: string | null;
  need: string;
  budget: number | null;
  contactPreference: string | null;
  status: VettedApplicationStatus;
  createdAt: string;
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

export const fetchRecommendLeads = (filters: { status?: RecommendLeadStatus; q?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.q?.trim()) query.set("q", filters.q.trim());
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiFetch<AdminRecommendLead[]>(`/api/admin/recommend-leads${suffix}`, undefined, { baseUrl: "" });
};
export const updateRecommendLead = (id: string, status: RecommendLeadStatus, amountFils?: number) => apiFetch<AdminRecommendLead>(`/api/admin/recommend-leads/${id}`, { method: "PATCH", body: JSON.stringify({ status, amountFils }) }, { baseUrl: "" });
export const fetchFoundingApplications = () => apiFetch<AdminFoundingApplication[]>("/api/admin/founding-members", undefined, { baseUrl: "" });
export const reviewFoundingApplication = (id: string, decision: "under_review" | "accepted" | "rejected" | "waitlisted") => apiFetch<null>(`/api/admin/founding-members/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }, { baseUrl: "" });
export const fetchAdminCompetition = () => apiFetch<AdminCompetition>("/api/admin/competition", undefined, { baseUrl: "" });
export const updateAdminCompetition = (input: AdminCompetitionUpdate) => apiFetch<AdminCompetition>("/api/admin/competition", { method: "PATCH", body: JSON.stringify(input) }, { baseUrl: "" });
export const updateAdminCompetitionParticipant = (userId: string, eligible: boolean, reason?: string) => apiFetch<{ userId: string; eligible: boolean }>(`/api/admin/competition/participants/${userId}`, { method: "PATCH", body: JSON.stringify({ eligible, reason }) }, { baseUrl: "" });
export const fetchVettedApplications = (status?: VettedApplicationStatus | "all") => {
  const query = status && status !== "all" ? `?status=${status}` : "";
  return apiFetch<AdminVettedApplication[]>(`/api/admin/vetted${query}`, undefined, { baseUrl: "" });
};
export const reviewVettedApplication = (id: string, decision: VettedReviewDecision) =>
  apiFetch<null>(`/api/admin/vetted/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }, { baseUrl: "" });
export const fetchContactAgentRequests = (status = "all") =>
  apiFetch<AdminContactAgentRequest[]>(
    `/api/admin/contact-agent-requests${status === "all" ? "" : `?status=${status}`}`,
    undefined,
    { baseUrl: "" },
  );

export const updateContactAgentRequest = (
  id: string,
  input: {
    status?: Exclude<ContactAgentRequestStatus, "new">;
    adminNote?: string;
    assignedTo?: string | null;
  },
) =>
  apiFetch<{ id: string; status: ContactAgentRequestStatus; assignedTo?: string | null; deleted?: boolean }>(
    `/api/admin/contact-agent-requests/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );

/** Bumps case activity so the inbox re-sorts this chat to the top. */
export const touchContactAgentRequest = (id: string) =>
  apiFetch<{ id: string; updatedAt: string }>(
    `/api/admin/contact-agent-requests/${id}/touch`,
    { method: "POST", body: "{}" },
    { baseUrl: "" },
  );
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

export type AdminDirectConversation = {
  id: string;
  buyerId?: string | null;
  sellerId?: string | null;
  adminId?: string | null;
  status?: "open" | "closed";
};

export const openAdminUserConversation = (counterpartyId: string, role: "buyer" | "seller") =>
  apiFetch<AdminDirectConversation>(
    "/api/admin/conversations",
    { method: "POST", body: JSON.stringify({ counterpartyId, counterpartyRole: role }) },
    { baseUrl: "" },
  );

export async function messageManagedUser(id: string, role: "buyer" | "seller", body: string, imageUrl?: string) {
  const conversation = await openAdminUserConversation(id, role);
  if (body.trim()) {
    const validated = validateChatMessageInput(body);
    if (!validated.ok) throw new Error(validated.error);
    await apiFetch(
      `/api/admin/conversations/${conversation.id}/messages`,
      { method: "POST", body: JSON.stringify({ body: validated.value, type: "text" }) },
      { baseUrl: "" },
    );
  }
  if (imageUrl?.trim()) {
    return apiFetch(
      `/api/admin/conversations/${conversation.id}/messages`,
      { method: "POST", body: JSON.stringify({ body: imageUrl.trim(), type: "image" }) },
      { baseUrl: "" },
    );
  }
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
