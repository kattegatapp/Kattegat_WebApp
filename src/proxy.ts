import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_INTERNAL_PATH,
  ADMIN_PORTAL_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/constants";
import { resolveBackendApiUrl } from "@/lib/api/settings";

function hasAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value?.trim();
  return Boolean(token);
}

function unauthorizedJson() {
  return NextResponse.json(
    {
      success: false,
      error: { message: "Admin session required", code: "ADMIN_SESSION_REQUIRED" },
    },
    { status: 401, headers: { "Cache-Control": "private, no-store" } },
  );
}

function isWaitlistOnlyPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/waitlist" || pathname.startsWith("/waitlist/");
}

/** Cached public settings probe for the waitlist lock (edge-friendly). */
async function isWaitlistModeEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveBackendApiUrl()}/api/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!response.ok) return false;
    const body = (await response.json()) as {
      success?: boolean;
      data?: { features?: { waitlistEnabled?: boolean; maintenanceMode?: boolean } };
    };
    if (!body.success || !body.data?.features) return false;
    // Maintenance already handled by pages; waitlist lock is for pre-launch only.
    return Boolean(body.data.features.waitlistEnabled);
  } catch {
    // If settings are unreachable, do not lock the whole site from the edge.
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never serve the internal filesystem route publicly.
  if (pathname === `/${ADMIN_INTERNAL_PATH}` || pathname.startsWith(`/${ADMIN_INTERNAL_PATH}/`)) {
    return new NextResponse(null, { status: 404 });
  }

  // Admin BFF APIs: require session except login.
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    const isLogin = pathname === "/api/admin/login";
    if (!isLogin && !hasAdminSession(request)) {
      return unauthorizedJson();
    }
    return NextResponse.next();
  }

  // Public unguessable portal → rewrite to internal app routes + page auth.
  if (pathname === `/${ADMIN_PORTAL_PATH}` || pathname.startsWith(`/${ADMIN_PORTAL_PATH}/`)) {
    const rest = pathname.slice(`/${ADMIN_PORTAL_PATH}`.length) || "";
    const isLogin = rest === "/login" || rest.startsWith("/login/");
    const authed = hasAdminSession(request);

    if (!isLogin && !authed) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${ADMIN_PORTAL_PATH}/login`;
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    // Always allow /login even when a cookie is present. A stale/forged cookie used
    // to redirect login → home and trap Session Expired ("Back to login") in a loop.
    // Valid sessions are still enforced by BFF Bearer checks on panel data routes.

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${ADMIN_INTERNAL_PATH}${rest}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Pre-launch lock: when waitlist registration is on, only `/`, `/waitlist`, and
  // the admin portal remain reachable. Deep links like /services redirect home.
  if (!isWaitlistOnlyPublicPath(pathname) && (await isWaitlistModeEnabled())) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kattegat-admin",
    "/kattegat-admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    /*
     * Match the configured public portal path. Keep this broad enough that
     * NEXT_PUBLIC_ADMIN_PORTAL_PATH changes still hit the proxy; the handler
     * filters to the exact segment.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand|api|.*\\..*).*)",
  ],
};
