import { apiFetch, apiFetchEnvelope } from "@/lib/api/client";

export type ContactSubmissionStatus = "new" | "in_progress" | "resolved" | "closed";
export type ContactSubmissionTopic = "hiring" | "joining" | "partnership" | "support" | "other";

export interface AdminContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string | null;
  topic: ContactSubmissionTopic;
  message: string;
  status: ContactSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

const TOPIC_LABELS: Record<ContactSubmissionTopic, string> = {
  hiring: "Hiring talent",
  joining: "Joining as seller",
  partnership: "Partnership / press",
  support: "Product support",
  other: "Other",
};

const STATUS_LABELS: Record<ContactSubmissionStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function contactTopicLabel(topic: ContactSubmissionTopic) {
  return TOPIC_LABELS[topic];
}

export function contactStatusLabel(status: ContactSubmissionStatus) {
  return STATUS_LABELS[status];
}

const TOPIC_STYLES: Record<ContactSubmissionTopic, string> = {
  hiring: "border-brand-mantis/35 bg-brand-mantis/12 text-brand-forest",
  joining: "border-brand-blue/25 bg-brand-blue/10 text-brand-blue",
  partnership: "border-violet-200 bg-violet-50 text-violet-800",
  support: "border-amber-200 bg-amber-50 text-amber-900",
  other: "border-brand-forest/15 bg-brand-forest/5 text-brand-forest/80",
};

const STATUS_STYLES: Record<ContactSubmissionStatus, string> = {
  new: "border-brand-mantis/30 bg-brand-mantis/10 text-brand-forest",
  in_progress: "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
  resolved: "border-brand-forest/15 bg-brand-forest/5 text-brand-forest",
  closed: "border-brand-forest/10 bg-muted text-muted-foreground",
};

export function contactTopicStyle(topic: ContactSubmissionTopic) {
  return TOPIC_STYLES[topic];
}

export function contactStatusStyle(status: ContactSubmissionStatus) {
  return STATUS_STYLES[status];
}

export async function fetchContactSubmissions(q = "", page = 1) {
  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (q.trim()) params.set("q", q.trim());
  return apiFetchEnvelope<AdminContactSubmission[]>(
    `/api/admin/contact-submissions?${params}`,
    undefined,
    { baseUrl: "" },
  );
}

export async function updateContactSubmissionStatus(
  submissionId: string,
  status: ContactSubmissionStatus,
) {
  return apiFetch<null>(
    `/api/admin/contact-submissions/${submissionId}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    { baseUrl: "" },
  );
}
