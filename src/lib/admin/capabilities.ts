/**
 * Admin capability keys — must stay aligned with
 * Kattegat_Backend/src/modules/admin/admin.capabilities.ts
 */
export const ADMIN_CAPABILITIES = [
  "staff.manage",
  "staff.reset_password",
  "settings.read",
  "settings.write",
  "pricing.read",
  "pricing.write",
  "catalog.write",
  "moderation.write",
  "users.read",
  "users.write",
  "growth.write",
  "feature_flags.write",
  "chat.admin",
] as const;

export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number];

export type AdminAccessSubject = {
  adminRole?: string | null;
  adminCapabilities?: string[] | null;
};

export function isSuperAdmin(subject: AdminAccessSubject | null | undefined): boolean {
  return subject?.adminRole === "super_admin";
}

export function hasAnyCapability(
  subject: AdminAccessSubject | null | undefined,
  required: readonly string[],
): boolean {
  if (!required.length) return true;
  if (isSuperAdmin(subject)) return true;
  const held = new Set(subject?.adminCapabilities ?? []);
  return required.some((capability) => held.has(capability));
}

export function hasAllCapabilities(
  subject: AdminAccessSubject | null | undefined,
  required: readonly string[],
): boolean {
  if (!required.length) return true;
  if (isSuperAdmin(subject)) return true;
  const held = new Set(subject?.adminCapabilities ?? []);
  return required.every((capability) => held.has(capability));
}

/** Friendly copy for API / capability failures shown in the admin panel. */
export function formatAdminAccessError(error: unknown, fallback = "Something went wrong."): string {
  if (!error) return fallback;

  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const code = String((error as { code?: string }).code ?? "");
    const message = String((error as { message?: string }).message ?? "");
    const status = "status" in error ? Number((error as { status?: number }).status) : 0;

    if (
      code === "ADMIN_CAPABILITY_FORBIDDEN" ||
      code === "ADMIN_ONLY" ||
      status === 403 ||
      /missing required permission/i.test(message)
    ) {
      return "You do not have access to this. Ask an owner to update your job permissions in Control Room.";
    }

    if (status === 401 || code === "UNAUTHORIZED") {
      return "Your session expired. Please sign in again.";
    }

    if (message.trim()) return message;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
