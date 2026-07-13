import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(request: NextRequest) {
  return proxyAdminBackend(`/admin/founding-members${request.nextUrl.search}`);
}
