import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";
export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/listings/[listingId]/availability">) { const { listingId } = await context.params; return proxyAdminBackend(`/admin/listings/${listingId}/availability`, { method: "PATCH", body: await request.text() }); }
