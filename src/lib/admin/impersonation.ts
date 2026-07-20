import { cookies } from "next/headers";

import { IMPERSONATION_COOKIE } from "@/lib/admin/constants";

export type ImpersonationState = {
  targetUserId: string;
  targetEmail: string;
  targetLabel: string;
  startedAt: string;
};

export async function readImpersonationState(): Promise<ImpersonationState | null> {
  const raw = (await cookies()).get(IMPERSONATION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ImpersonationState;
    if (!parsed?.targetUserId || !parsed?.targetLabel) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function impersonationCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
