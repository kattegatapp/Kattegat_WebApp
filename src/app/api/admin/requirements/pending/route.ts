import type { NextRequest } from "next/server";

import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/admin/requirements/pending?${query}` : "/admin/requirements/pending";
  return proxyAdminBackend(path);
}
