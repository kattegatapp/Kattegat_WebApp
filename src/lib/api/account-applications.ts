import { apiFetch } from "@/lib/api/client";

export type ApplicationStatus =
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "awarded"
  | "declined"
  | "withdrawn";

export type AccountApplication = {
  id: string;
  requirementId: string;
  sellerId: string;
  pitch: string;
  listingRef: string | null;
  quote: number | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type MyApplication = AccountApplication & {
  requirement: {
    id: string;
    title: string;
    status: string;
    jobType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    location: string;
    endsAt: string | null;
  };
};

export type ReceivedApplication = AccountApplication & {
  requirement: {
    id: string;
    title: string;
    status: string;
  };
  seller: {
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    tier: string;
    aggregateRating: number;
    reviewCount: number;
  };
};

export async function fetchMyApplications() {
  return apiFetch<MyApplication[]>("/api/account/applications/mine", undefined, { baseUrl: "" });
}

export async function fetchReceivedApplications() {
  return apiFetch<ReceivedApplication[]>("/api/account/applications/received", undefined, {
    baseUrl: "",
  });
}

export async function fetchRequirementApplications(requirementId: string) {
  return apiFetch<AccountApplication[]>(
    `/api/account/requirements/${requirementId}/applications`,
    undefined,
    { baseUrl: "" },
  );
}

export async function applyToRequirement(
  requirementId: string,
  input: { pitch: string; listingRef?: string; quote?: number },
) {
  return apiFetch<AccountApplication>(
    `/api/account/requirements/${requirementId}/applications`,
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function shortlistApplication(applicationId: string) {
  return apiFetch<AccountApplication>(
    `/api/account/applications/${applicationId}`,
    { method: "PATCH", body: JSON.stringify({ status: "shortlisted" }) },
    { baseUrl: "" },
  );
}

export async function declineApplication(applicationId: string) {
  return apiFetch<AccountApplication>(
    `/api/account/applications/${applicationId}`,
    { method: "PATCH", body: JSON.stringify({ status: "declined" }) },
    { baseUrl: "" },
  );
}

export async function awardApplication(applicationId: string) {
  return apiFetch<AccountApplication>(
    `/api/account/applications/${applicationId}/award`,
    { method: "POST", body: JSON.stringify({}) },
    { baseUrl: "" },
  );
}
