import { ADMIN_PORTAL_PATH } from "@/lib/admin/constants";

/** Build a public admin portal href, e.g. `adminPath("/settings/brand")`. */
export function adminPath(subpath = ""): string {
  const normalized = subpath
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return normalized ? `/${ADMIN_PORTAL_PATH}/${normalized}` : `/${ADMIN_PORTAL_PATH}`;
}

export const ADMIN_LOGIN_PATH = adminPath("/login");
