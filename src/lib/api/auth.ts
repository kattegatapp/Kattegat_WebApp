import { ApiRequestError, apiFetch } from "@/lib/api/client";

export type MemberUser = {
  id: string;
  email: string;
  sid: string | null;
  bid: string | null;
  businessName: string | null;
  username: string | null;
};

export async function fetchMemberMe(): Promise<MemberUser | null> {
  try {
    return await apiFetch<MemberUser>("/api/auth/me", undefined, { baseUrl: "" });
  } catch {
    return null;
  }
}

export async function loginMember(email: string, password: string) {
  return apiFetch<MemberUser>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    { baseUrl: "" },
  );
}

export type RegisterMemberResult = {
  user: MemberUser | null;
  requiresEmailConfirmation: boolean;
};

export async function registerMember(input: {
  email: string;
  password: string;
  role: "buyer" | "seller";
  businessName?: string;
  referralCode?: string;
}): Promise<RegisterMemberResult> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      role: input.role,
      businessName: input.businessName,
      referralCode: input.referralCode,
    }),
  });

  const body = (await res.json()) as
    | {
        success: true;
        data: MemberUser | null;
        meta?: { requiresEmailConfirmation?: boolean };
      }
    | { success: false; error: { message: string; code: string } };

  if (!body.success) {
    const confirmationRequired =
      body.error.code === "CONFIRMATION_REQUIRED" ||
      res.status === 202 ||
      body.error.message.toLowerCase().includes("email confirmation");
    if (confirmationRequired) {
      return { user: null, requiresEmailConfirmation: true };
    }
    throw new ApiRequestError(body.error.message, body.error.code, res.status);
  }

  return {
    user: body.data,
    requiresEmailConfirmation: Boolean(body.meta?.requiresEmailConfirmation),
  };
}

export async function logoutMember() {
  return apiFetch<null>("/api/auth/logout", { method: "POST" }, { baseUrl: "" });
}

export async function changeMemberPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch<null>(
    "/api/auth/change-password",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
