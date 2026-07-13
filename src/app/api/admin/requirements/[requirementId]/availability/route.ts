import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";
export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/requirements/[requirementId]/availability">) { const { requirementId } = await context.params; return proxyAdminBackend(`/admin/requirements/${requirementId}/availability`, { method: "PATCH", body: await request.text() }); }
