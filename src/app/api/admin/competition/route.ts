import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET() { return proxyAdminBackend("/admin/competition"); }
export async function PATCH(request: NextRequest) { return proxyAdminBackend("/admin/competition", { method: "PATCH", body: await request.text() }); }
