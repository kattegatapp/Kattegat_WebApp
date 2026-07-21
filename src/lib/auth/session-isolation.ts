import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { adminSessionCookieOptions } from "@/lib/admin/session";
import { MEMBER_SESSION_COOKIE, memberSessionCookieOptions } from "@/lib/auth/session";
import { isStaffAccount } from "@/lib/auth/member-gate";

export async function clearAdminSessionCookie() {
  (await cookies()).set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  });
}

export async function clearMemberSessionCookie() {
  (await cookies()).set(MEMBER_SESSION_COOKIE, "", memberSessionCookieOptions(0));
}

type BackendAuthUser = Record<string, unknown> & {
  id?: string;
  email?: string;
  adminRole?: string | null;
  isAdmin?: boolean;
};

/** Reject staff credentials on member login/register flows. */
export function staffMemberLoginError(user: BackendAuthUser | null | undefined) {
  if (!user) return null;
  const adminRole = typeof user.adminRole === "string" ? user.adminRole : null;
  if (isStaffAccount({ isAdmin: Boolean(user.isAdmin), adminRole })) {
    return {
      message: "Staff accounts must sign in through the admin portal, not the member login.",
      code: "ADMIN_PORTAL_REQUIRED",
    };
  }
  return null;
}
