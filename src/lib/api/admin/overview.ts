import { apiFetch } from "@/lib/api/client";

export interface AdminOverviewKpis {
  waitlistTotal: number;
  waitlistToday: number;
  usersTotal: number;
  usersActive: number;
  sellersTotal: number;
  buyersTotal: number;

  listingsTotal: number;
  listingsDraft: number;
  pendingListings: number;
  listingsLive: number;
  listingsRejected: number;
  listingsUnpublished: number;

  requirementsTotal: number;
  pendingRequirements: number;
  requirementsOpen: number;
  requirementsShortlisting: number;
  requirementsAwarded: number;
  requirementsClosed: number;
  requirementsExpired: number;
  requirementsRejected: number;

  pendingIdentityVerifications: number;
  pendingModerationReports: number;
  foundingQueue: number;
  vettedQueue: number;
  /** Open Contact Agent / middleman chat cases (new + in progress + contacted). */
  vettedChatsQueue: number;
  foundingMembersTotal: number;
  vettedMembersTotal: number;
  premiumSellersTotal: number;
  recommendedLeadsQueue: number;
  staffTotal: number;
}

export interface AdminOverviewGates {
  waitlistEnabled: boolean;
  maintenanceMode: boolean;
  freeAccessMode: boolean;
  paymentsEnabled: boolean;
  reviewsEnabled: boolean;
  referralsEnabled: boolean;
  listingModerationEnabled: boolean;
  identityVerificationRequired: boolean;
}

export interface AdminOverviewAttentionItem {
  key: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "high";
}

export interface DeviceAnalyticsBucket {
  name: string;
  devices: number;
  accesses: number;
}

export interface DeviceAnalyticsSummary {
  totalDevices: number;
  totalAccesses: number;
  byDeviceType: DeviceAnalyticsBucket[];
  byOperatingSystem: DeviceAnalyticsBucket[];
  byBrowser: DeviceAnalyticsBucket[];
}

export interface AdminOverview {
  generatedAt: string;
  kpis: AdminOverviewKpis;
  gates: AdminOverviewGates;
  attention: AdminOverviewAttentionItem[];
  devices: DeviceAnalyticsSummary;
}

/** Matches DB enums: listing_status / requirement_status */
export const LISTING_STATUS_KPI_KEYS = [
  "listingsDraft",
  "pendingListings",
  "listingsLive",
  "listingsRejected",
  "listingsUnpublished",
] as const satisfies ReadonlyArray<keyof AdminOverviewKpis>;

export const REQUIREMENT_STATUS_KPI_KEYS = [
  "pendingRequirements",
  "requirementsOpen",
  "requirementsShortlisting",
  "requirementsAwarded",
  "requirementsClosed",
  "requirementsExpired",
  "requirementsRejected",
] as const satisfies ReadonlyArray<keyof AdminOverviewKpis>;

const KPI_DEFAULTS: AdminOverviewKpis = {
  waitlistTotal: 0,
  waitlistToday: 0,
  usersTotal: 0,
  usersActive: 0,
  sellersTotal: 0,
  buyersTotal: 0,
  listingsTotal: 0,
  listingsDraft: 0,
  pendingListings: 0,
  listingsLive: 0,
  listingsRejected: 0,
  listingsUnpublished: 0,
  requirementsTotal: 0,
  pendingRequirements: 0,
  requirementsOpen: 0,
  requirementsShortlisting: 0,
  requirementsAwarded: 0,
  requirementsClosed: 0,
  requirementsExpired: 0,
  requirementsRejected: 0,
  pendingIdentityVerifications: 0,
  pendingModerationReports: 0,
  foundingQueue: 0,
  vettedQueue: 0,
  vettedChatsQueue: 0,
  foundingMembersTotal: 0,
  vettedMembersTotal: 0,
  premiumSellersTotal: 0,
  recommendedLeadsQueue: 0,
  staffTotal: 0,
};

function safeCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}

export function normalizeAdminOverviewKpis(
  input: Partial<AdminOverviewKpis> | null | undefined,
): AdminOverviewKpis {
  const raw = input ?? {};
  const next = { ...KPI_DEFAULTS };

  for (const key of Object.keys(KPI_DEFAULTS) as Array<keyof AdminOverviewKpis>) {
    next[key] = safeCount(raw[key]);
  }

  // If totals are missing but status buckets exist, derive them from DB enum buckets.
  if (!Number.isFinite(Number(raw.listingsTotal))) {
    next.listingsTotal = LISTING_STATUS_KPI_KEYS.reduce((sum, key) => sum + next[key], 0);
  }
  if (!Number.isFinite(Number(raw.requirementsTotal))) {
    next.requirementsTotal = REQUIREMENT_STATUS_KPI_KEYS.reduce((sum, key) => sum + next[key], 0);
  }

  return next;
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const data = await apiFetch<AdminOverview>("/api/admin/overview", undefined, { baseUrl: "" });
  return {
    ...data,
    kpis: normalizeAdminOverviewKpis(data.kpis),
    attention: (data.attention ?? []).map((item) => ({
      ...item,
      count: safeCount(item.count),
    })),
    devices: data.devices ?? {
      totalDevices: 0,
      totalAccesses: 0,
      byDeviceType: [],
      byOperatingSystem: [],
      byBrowser: [],
    },
  };
}
