import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";
export async function GET(request: NextRequest) { const query = request.nextUrl.searchParams.toString(); return proxyAdminBackend(query ? `/admin/listings?${query}` : "/admin/listings"); }
