import { proxyAdminBackend } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET() {
  return proxyAdminBackend("/admin/overview");
}
