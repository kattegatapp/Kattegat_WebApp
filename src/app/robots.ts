import type { MetadataRoute } from "next";

import { getPublicAppSettings } from "@/lib/api/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicAppSettings();
  const origin = settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/kattegat-admin/", "/api/", "/download"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
