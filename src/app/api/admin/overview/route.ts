import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET() {
  return proxyAdminBackend("/admin/overview");
}
