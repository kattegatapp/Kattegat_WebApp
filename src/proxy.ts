import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_INTERNAL_PATH,
  ADMIN_PORTAL_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/constants";
import { resolveBackendApiUrl } from "@/lib/api/settings";

const WAITLIST_BYPASS_PATHS = [
  "/waitlist",
  "/terms-of-service",
  "/privacy-policy",
  "/delete-account",
  "/contact",
  "/support",
  "/faq",
  "/download",
] as const;

function bypassesWaitlist(pathname: string) {
  return WAITLIST_BYPASS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** The waitlist switch is a pre-launch access gate; short caching keeps admin changes responsive. */
async function isWaitlistModeEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveBackendApiUrl()}/api/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!response.ok) return false;
    const body = (await response.json()) as {
      success?: boolean;
      data?: { features?: { waitlistEnabled?: boolean } };
    };
    return body.success === true && body.data?.features?.waitlistEnabled === true;
  } catch {
    // A settings outage must not accidentally lock every public route behind waitlist.
    return false;
  }
}

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

  if (!bypassesWaitlist(pathname) && (await isWaitlistModeEnabled())) {
    const waitlistUrl = request.nextUrl.clone();
    waitlistUrl.pathname = "/waitlist";
    waitlistUrl.search = "";
    return NextResponse.redirect(waitlistUrl);
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
