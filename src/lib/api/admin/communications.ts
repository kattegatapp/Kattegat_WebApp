import { apiFetch } from "@/lib/api/client";

export type CommunicationAudience = "all_users" | "buyers" | "sellers" | "pro_sellers" | "waitlist" | "founding_members" | "vetted_members" | "user_status";
export type CommunicationUserStatus = "active" | "suspended" | "banned" | "pending_verification" | "deleted";
export type CommunicationChannel = "push" | "email";
export type AudienceInput = { audience: CommunicationAudience; userStatus?: CommunicationUserStatus };
export type SendCommunicationInput = AudienceInput & { channels: CommunicationChannel[]; title: string; body: string; deepLink?: string };

export const previewCommunicationAudience = (input: AudienceInput) => apiFetch<{ total: number; emailReachable: number; pushReachable: number }>("/api/admin/communications/preview", { method: "POST", body: JSON.stringify(input) }, { baseUrl: "" });
export const sendAdminCommunication = (input: SendCommunicationInput) => apiFetch<{ targeted: number; emailSent: number; emailFailed: number; audience: CommunicationAudience; channels: CommunicationChannel[] }>("/api/admin/communications/send", { method: "POST", body: JSON.stringify(input) }, { baseUrl: "" });
