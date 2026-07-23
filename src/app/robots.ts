import type { MetadataRoute } from "next";

import { getPublicAppSettings } from "@/lib/api/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicAppSettings();
  const origin = settings.links.webAppUrl.replace(/\/$/, "") || "https://kattegat.app";
  const host = origin.replace(/^https?:\/\//, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/kattegat-admin/",
          "/api/",
          "/account",
          "/account/",
          "/chat",
          "/chat/",
          "/login",
          "/download",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host,
  };
}
