import { apiFetch } from "@/lib/api/client";
import { fallbackAppSettings, resolveBackendApiUrl, type PublicAppSettings } from "@/lib/api/settings";

/** Client-safe public settings fetch (attachment caps, feature flags). */
export async function fetchPublicAppSettingsClient(): Promise<PublicAppSettings> {
  try {
    return await apiFetch<PublicAppSettings>(
      "/api/settings",
      { cache: "no-store" },
      { baseUrl: resolveBackendApiUrl() },
    );
  } catch {
    return fallbackAppSettings;
  }
}
