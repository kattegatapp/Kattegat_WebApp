/** HttpOnly cookie holding the backend access JWT for admin BFF routes. */
export const ADMIN_SESSION_COOKIE = "kattegat_admin_access_token";

/** HttpOnly JSON metadata while staff are signed in as a member (admin cookie stays). */
export const IMPERSONATION_COOKIE = "kattegat_impersonation";

/**
 * Public URL segment for the admin portal (unguessable).
 * Set the same value in `.env` as `NEXT_PUBLIC_ADMIN_PORTAL_PATH`.
 * Internal App Router folder remains `/kattegat-admin` and is blocked publicly.
 */
export const ADMIN_PORTAL_PATH = (
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_PATH ?? "kg-ops-a8f3e91c7b2d"
)
  .replace(/^\/+|\/+$/g, "")
  .trim();

/** Internal filesystem route prefix — never expose this as a public URL. */
export const ADMIN_INTERNAL_PATH = "kattegat-admin";
