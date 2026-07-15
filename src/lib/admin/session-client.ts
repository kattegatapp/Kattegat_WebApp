"use client";

import { clearAdminToken } from "@/lib/api/admin";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";

/**
 * Clears the httpOnly admin cookie, then sends the user to login.
 * Required for Session Expired / "Back to login" — a stale cookie alone makes
 * the edge proxy redirect /login → home, trapping the user in a loop.
 */
export async function goToAdminLogin(navigate: (path: string) => void) {
  try {
    await clearAdminToken();
  } catch {
    // Cookie-clearing logout always runs server-side even when /auth/logout fails;
    // still navigate so a dead UI session is not stuck.
  }
  navigate(ADMIN_LOGIN_PATH);
}
