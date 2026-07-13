import { apiFetch } from "@/lib/api/client";

export type AdminRole = "super_admin" | "admin" | "ops_agent" | "finance" | "moderator";

export interface AdminSessionUser {
  id: string;
  email: string;
  bid: string | null;
  sid: string | null;
  originalRole: string;
  adminRole: AdminRole | null;
  adminCapabilities?: string[];
  extraCapabilities?: string[];
  status: string;
  phone?: string | null;
  username?: string | null;
  businessName?: string | null;
  avatarUrl?: string | null;
}

export interface AdminProfile {
  id: string;
  email: string;
  phone: string | null;
  username: string | null;
  businessName: string | null;
  avatarUrl: string | null;
  status: string;
  isAdmin?: boolean;
}

export type UpdateAdminProfileInput = {
  username?: string;
  phone?: string;
  businessName?: string;
  avatarUrl?: string;
};

export interface AdminStaffMember {
  userId: string;
  email: string;
  status: string;
  adminRole: AdminRole;
  extraCapabilities: string[];
  effectiveCapabilities: string[];
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface AdminAssignableCapability {
  key: string;
  label: string;
  description: string;
}

export interface AdminRoleCatalogItem {
  role: AdminRole;
  label: string;
  description: string;
  editable: boolean;
  capabilities: string[];
  permissionKeys: string[];
}

export interface AdminRoleCatalog {
  roles: AdminRoleCatalogItem[];
  assignableCapabilities: AdminAssignableCapability[];
}

export async function fetchAdminMe(): Promise<AdminSessionUser> {
  return apiFetch<AdminSessionUser>("/api/admin/me", undefined, { baseUrl: "" });
}

export async function fetchAdminProfile(): Promise<AdminProfile> {
  return apiFetch<AdminProfile>("/api/admin/profile", undefined, { baseUrl: "" });
}

export async function updateAdminProfile(input: UpdateAdminProfileInput): Promise<AdminProfile> {
  return apiFetch<AdminProfile>(
    "/api/admin/profile",
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function fetchAdminStaff(): Promise<AdminStaffMember[]> {
  return apiFetch<AdminStaffMember[]>("/api/admin/staff", undefined, { baseUrl: "" });
}

export async function fetchAdminRoleCatalog(): Promise<AdminRoleCatalog> {
  return apiFetch<AdminRoleCatalog>("/api/admin/staff/roles", undefined, { baseUrl: "" });
}

export async function updateAdminRolePermissions(
  role: AdminRole,
  capabilities: string[],
): Promise<AdminRoleCatalogItem> {
  return apiFetch<AdminRoleCatalogItem>(
    `/api/admin/staff/roles/${role}`,
    { method: "PUT", body: JSON.stringify({ capabilities }) },
    { baseUrl: "" },
  );
}

export async function createAdminStaff(input: {
  email: string;
  password: string;
  adminRole: AdminRole;
  extraCapabilities?: string[];
}): Promise<AdminStaffMember> {
  return apiFetch<AdminStaffMember>(
    "/api/admin/staff",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function updateAdminStaffRole(
  userId: string,
  input: { adminRole: AdminRole; extraCapabilities?: string[] },
): Promise<AdminStaffMember> {
  return apiFetch<AdminStaffMember>(
    `/api/admin/staff/${userId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}

export async function resetAdminStaffPassword(userId: string, password: string): Promise<null> {
  return apiFetch<null>(
    `/api/admin/staff/${userId}/password`,
    { method: "POST", body: JSON.stringify({ password }) },
    { baseUrl: "" },
  );
}

export async function deactivateAdminStaff(userId: string): Promise<null> {
  return apiFetch<null>(`/api/admin/staff/${userId}`, { method: "DELETE" }, { baseUrl: "" });
}

export async function changeOwnAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<null> {
  return apiFetch<null>(
    "/api/admin/password",
    { method: "POST", body: JSON.stringify(input) },
    { baseUrl: "" },
  );
}
