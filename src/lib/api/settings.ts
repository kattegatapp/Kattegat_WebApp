import { apiFetch, ApiRequestError } from "@/lib/api/client";

export interface PublicAppSettings {
  brand: {
    siteName: string;
    legalName: string;
    tagline: string;
    market: string;
    supportEmail: string;
    supportPhone: string | null;
    chatLogoUrl: string | null;
  };
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogImageUrl: string | null;
  };
  links: {
    webAppUrl: string;
    mobileAppUrl: string | null;
    appStoreUrl: string | null;
    playStoreUrl: string | null;
    termsUrl: string | null;
    privacyUrl: string | null;
    supportWhatsappUrl: string | null;
    instagramUrl: string | null;
    linkedinUrl: string | null;
  };
  features: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    waitlistEnabled: boolean;
    buyerSignupEnabled: boolean;
    sellerSignupEnabled: boolean;
    referralsEnabled: boolean;
    recommendationsEnabled: boolean;
    paymentsEnabled: boolean;
    reviewsEnabled: boolean;
    chatEnabled: boolean;
    contactAgentEnabled: boolean;
    identityVerificationRequired: boolean;
    listingModerationEnabled: boolean;
    requirementModerationEnabled: boolean;
    featuredPlacementEnabled: boolean;
    pushNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    freeAccessMode: boolean;
  };
  operations: {
    defaultCurrency: string;
    defaultCountry: string;
    defaultCity: string;
    timezone: string;
    minimumAppVersion: string | null;
    minimumSupportedBuildNumber: number | null;
    latestAppVersion: string | null;
    /** When true, clients below minimum version must upgrade. */
    forceUpgrade: boolean;
    maxListingPhotosDefault: number;
    maxVideoLinksDefault: number;
    maxRequirementAttachments: number;
    commissionRate: number;
    platformFee: number;
    allowedCountries: string[];
    blockedEmailDomains: string[];
    /** Discovery ranking weights — White Glove / Premium / Starter only. */
    rankingWeightFeatured: number;
    rankingWeightReviews: number;
    rankingWeightProPriority: number;
    rankingWeightRecency: number;
    rankingWeightNewcomer: number;
    rankingNewcomerDays: number;
  };
  updatedAt: string;
}

export const fallbackAppSettings: PublicAppSettings = {
  brand: {
    siteName: "Kattegat",
    legalName: "Kattegat",
    tagline: "Trusted connections for premium services",
    market: "Dubai",
    supportEmail: "support@kattegat.app",
    supportPhone: null,
    chatLogoUrl: null,
  },
  metadata: {
    title: "Kattegat | Dubai Events & Hospitality Talent Marketplace",
    description:
      "Join Kattegat, Dubai's direct marketplace for events and hospitality talent. Find talent, get booked, and skip the middlemen.",
    keywords: ["Kattegat", "Dubai", "events", "services", "marketplace"],
    ogImageUrl: "/opengraph-image.png",
  },
  links: {
    webAppUrl: "https://kattegat.app",
    mobileAppUrl: null,
    appStoreUrl: null,
    playStoreUrl: null,
    termsUrl: "http://kattegat.app/terms-of-service",
    privacyUrl: "http://kattegat.app/privacy-policy",
    supportWhatsappUrl: null,
    instagramUrl: null,
    linkedinUrl: null,
  },
  // Fail closed: when settings cannot be loaded, never invent "open" for public gates.
  features: {
    maintenanceMode: true,
    maintenanceMessage:
      "Kattegat is temporarily unavailable. Please try again shortly.",
    waitlistEnabled: false,
    buyerSignupEnabled: false,
    sellerSignupEnabled: false,
    referralsEnabled: false,
    recommendationsEnabled: false,
    paymentsEnabled: false,
    reviewsEnabled: false,
    chatEnabled: false,
    contactAgentEnabled: false,
    identityVerificationRequired: true,
    listingModerationEnabled: true,
    requirementModerationEnabled: true,
    featuredPlacementEnabled: false,
    pushNotificationsEnabled: false,
    emailNotificationsEnabled: false,
    freeAccessMode: false,
  },
  operations: {
    defaultCurrency: "AED",
    defaultCountry: "United Arab Emirates",
    defaultCity: "Dubai",
    timezone: "Asia/Dubai",
    minimumAppVersion: null,
    minimumSupportedBuildNumber: null,
    latestAppVersion: null,
    forceUpgrade: false,
    maxListingPhotosDefault: 12,
    maxVideoLinksDefault: 3,
    maxRequirementAttachments: 10,
    commissionRate: 0,
    platformFee: 0,
    allowedCountries: ["United Arab Emirates"],
    blockedEmailDomains: [],
    rankingWeightFeatured: 100,
    rankingWeightReviews: 40,
    rankingWeightProPriority: 30,
    rankingWeightRecency: 20,
    rankingWeightNewcomer: 10,
    rankingNewcomerDays: 30,
  },
  updatedAt: new Date(0).toISOString(),
};

export function resolveBackendApiUrl(): string {
  const configured = (
    process.env.KATTEGAT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  )
    .trim()
    .replace(/\/$/, "");

  const isProdRuntime =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  // Never call localhost from a hosted web deploy — that fails closed into the
  // maintenance screen even when the real API has waitlist/maintenance open.
  if (configured && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
    return configured;
  }

  if (isProdRuntime) {
    return "https://api.kattegat.app";
  }

  return configured || "http://localhost:3000";
}

const reportedSettingsFailures = new Set<string>();

function reportSettingsFailure(backendUrl: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof ApiRequestError ? error.code : "UNKNOWN_ERROR";
  const status = error instanceof ApiRequestError ? error.status : undefined;
  const detail = `[settings] ${code}${status ? ` (${status})` : ""}: ${message} Backend: ${backendUrl}. Using fallback settings.`;

  if (process.env.NODE_ENV === "production") {
    console.error(detail);
    return;
  }

  // A stopped local API is an expected development condition. Keep it visible
  // without promoting a successfully handled fallback into Next's error overlay.
  const failureKey = `${backendUrl}:${code}`;
  if (!reportedSettingsFailures.has(failureKey)) {
    reportedSettingsFailures.add(failureKey);
    console.warn(detail);
  }
}

export async function getPublicAppSettings(): Promise<PublicAppSettings> {
  const backendUrl = resolveBackendApiUrl();

  try {
    return await apiFetch<PublicAppSettings>(
      "/api/settings",
      { cache: "no-store" },
      { baseUrl: backendUrl },
    );
  } catch (error) {
    reportSettingsFailure(backendUrl, error);
    return fallbackAppSettings;
  }
}
