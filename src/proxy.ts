import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_INTERNAL_PATH,
  ADMIN_PORTAL_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/constants";

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
    { status: 401 },
  );
}

export function proxy(request: NextRequest) {
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

    if (isLogin && authed) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${ADMIN_PORTAL_PATH}`;
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${ADMIN_INTERNAL_PATH}${rest}`;
    return NextResponse.rewrite(rewriteUrl);
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
