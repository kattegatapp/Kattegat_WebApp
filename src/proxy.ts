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

const WAITLIST_PUBLIC_PATHS = [
  "/",
  "/waitlist",
  "/terms-of-service",
  "/privacy-policy",
  "/delete-account",
  "/contact",
  "/support",
  "/faq",
  // SEO / marketplace discovery — must stay crawlable even during waitlist.
  "/search",
  "/services",
  "/about",
  "/how-it-works",
  "/plans",
  "/billing",
  "/as-user",
  "/login",
  "/register",
  "/account",
  "/account/setup",
  "/chat",
  "/r",
  "/listing",
  "/requirement",
  "/seller",
  "/category",
  "/dubai",
  "/download",
] as const;

function isWaitlistPublicPath(pathname: string) {
  return WAITLIST_PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath ||
      (publicPath !== "/" && pathname.startsWith(`${publicPath}/`)),
  );
}

/** Cached public settings probe for the waitlist lock (edge-friendly). */
async function isWaitlistModeEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveBackendApiUrl()}/api/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    // Fail closed: unreachable/invalid settings keep the public site locked.
    if (!response.ok) return true;
    const body = (await response.json()) as {
      success?: boolean;
      data?: { features?: { waitlistEnabled?: boolean; maintenanceMode?: boolean } };
    };
    if (!body.success || !body.data?.features) return true;
    // Maintenance already handled by pages; waitlist lock is for pre-launch only.
    return Boolean(body.data.features.waitlistEnabled);
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Platform association files + SEO metadata routes must always bypass waitlist.
  if (
    pathname === "/.well-known" ||
    pathname.startsWith("/.well-known/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

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

  // Pre-launch lock: legal disclosures, account deletion, and support must stay
  // publicly reachable for users and app-store review, even before launch.
  if (!isWaitlistPublicPath(pathname) && (await isWaitlistModeEnabled())) {
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
     * Also allow metadata routes (sitemap.xml / robots.txt) through without
     * treating the dotted path as a static file exclusion only.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand|api|\\.well-known|.*\\..*).*)",
    "/sitemap.xml",
    "/robots.txt",
  ],
};
