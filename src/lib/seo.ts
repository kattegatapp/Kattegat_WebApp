import { getPublicAppSettings } from "@/lib/api/settings";

export async function getSiteOrigin() {
  const settings = await getPublicAppSettings();
  return settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";
}

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
