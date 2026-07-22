import { apiFetch } from "@/lib/api/client";

export type IdentityVerificationStatus = "not_submitted" | "pending" | "verified" | "rejected";

export type IdentityVerificationStatusResult = {
  status: IdentityVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
};

export type IdentityDocumentUploadResult = {
  secureUrl: string;
  publicId: string;
};

export async function fetchIdentityVerificationStatus() {
  return apiFetch<IdentityVerificationStatusResult>(
    "/api/account/identity-verification",
    undefined,
    { baseUrl: "" },
  );
}

export async function submitIdentityVerification(payload: {
  documentUrl: string;
  documentBackUrl: string;
}) {
  return apiFetch<IdentityVerificationStatusResult>(
    "/api/account/identity-verification",
    { method: "POST", body: JSON.stringify(payload) },
    { baseUrl: "" },
  );
}

export async function uploadIdentityDocument(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  const fileBase64 = btoa(binary);

  const raw = await apiFetch<Record<string, unknown>>(
    "/api/account/identity-verification/document",
    {
      method: "POST",
      body: JSON.stringify({
        fileBase64,
        mimeType: file.type || "image/jpeg",
      }),
    },
    { baseUrl: "" },
  );

  const nested =
    raw.data && typeof raw.data === "object" ? (raw.data as Record<string, unknown>) : undefined;
  const upload =
    raw.upload && typeof raw.upload === "object" ? (raw.upload as Record<string, unknown>) : undefined;
  const candidates = [raw, nested, upload].filter(Boolean) as Record<string, unknown>[];
  const secureUrl = firstString(candidates, [
    "secureUrl",
    "secure_url",
    "documentUrl",
    "document_url",
    "url",
  ]);
  const publicId = firstString(candidates, ["publicId", "public_id"]) ?? "";

  if (!secureUrl || !secureUrl.startsWith("https://")) {
    throw new Error("The server did not return a valid document upload URL.");
  }

  return { secureUrl, publicId } satisfies IdentityDocumentUploadResult;
}

function firstString(objects: Record<string, unknown>[], keys: string[]) {
  for (const object of objects) {
    for (const key of keys) {
      const value = object[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return undefined;
}
