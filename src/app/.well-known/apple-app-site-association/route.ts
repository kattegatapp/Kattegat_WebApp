import { NextResponse } from "next/server";

/**
 * Apple App Site Association for Universal Links + webcredentials (passkeys).
 * Set APPLE_TEAM_ID in the web deploy env (10-character Apple Team ID).
 */
export async function GET() {
  const teamId = (process.env.APPLE_TEAM_ID ?? "").trim();
  const appId = teamId ? `${teamId}.ios.kattegat.mobile` : "TEAMID.ios.kattegat.mobile";

  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: appId,
          paths: [
            "/listing/*",
            "/seller/*",
            "/category/*",
            "/search",
            "/search/*",
            "/download",
            "/download/*",
          ],
        },
      ],
    },
    webcredentials: {
      apps: [appId],
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
