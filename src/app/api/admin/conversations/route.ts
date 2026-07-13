import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: Request) {
  return proxyAdminBackend("/admin/conversations", { method: "POST", body: await request.text() });
}
