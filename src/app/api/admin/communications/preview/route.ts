import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";
export async function POST(request: NextRequest) { return proxyAdminBackend("/admin/communications/preview", { method: "POST", body: await request.text() }); }
