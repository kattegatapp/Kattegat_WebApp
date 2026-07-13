import { apiFetch } from "@/lib/api/client";

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
    termsUrl: null,
    privacyUrl: null,
    supportWhatsappUrl: null,
    instagramUrl: null,
    linkedinUrl: null,
  },
  features: {
    maintenanceMode: false,
    maintenanceMessage: "Kattegat is temporarily offline for scheduled maintenance. Please check back shortly.",
    waitlistEnabled: true,
    buyerSignupEnabled: true,
    sellerSignupEnabled: true,
    referralsEnabled: true,
    recommendationsEnabled: true,
    paymentsEnabled: true,
    chatEnabled: true,
    contactAgentEnabled: true,
    identityVerificationRequired: true,
    listingModerationEnabled: true,
    requirementModerationEnabled: true,
    featuredPlacementEnabled: true,
    pushNotificationsEnabled: true,
    emailNotificationsEnabled: true,
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
  },
  updatedAt: new Date(0).toISOString(),
};

export async function getPublicAppSettings(): Promise<PublicAppSettings> {
  try {
    return await apiFetch<PublicAppSettings>("/api/settings", { cache: "no-store" });
  } catch {
    return fallbackAppSettings;
  }
}
