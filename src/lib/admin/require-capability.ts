import { NextResponse } from "next/server";

import { hasAnyCapability } from "@/lib/admin/capabilities";
import {
  adminApiUrl,
  requireAdminSession,
  unauthorizedAdminResponse,
} from "@/lib/admin/session";
import type { AdminSessionUser } from "@/lib/api/admin/staff";

/**
 * Ensure the current admin session holds at least one of the required capabilities.
 * Returns null when allowed, otherwise a NextResponse to return from the route.
 */
export async function requireAdminCapability(
  anyOf: readonly string[],
): Promise<NextResponse | null> {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  try {
    const response = await fetch(adminApiUrl("/auth/me"), {
      method: "GET",
      headers: { Authorization: `Bearer ${session}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (response.status === 401 || response.status === 403) {
      return unauthorizedAdminResponse();
    }
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Could not verify admin permissions.",
            code: "BACKEND_UNREACHABLE",
          },
        },
        { status: 502, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const body = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: AdminSessionUser;
    } | null;

    if (!body?.success || !body.data) {
      return unauthorizedAdminResponse();
    }

    if (!hasAnyCapability(body.data, anyOf)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You do not have the required access for this action.",
            code: "ADMIN_CAPABILITY_FORBIDDEN",
          },
        },
        { status: 403, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Could not verify admin permissions.",
          code: "BACKEND_UNREACHABLE",
        },
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
