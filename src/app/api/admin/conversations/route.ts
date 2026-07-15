import { proxyAdminBackend } from "@/lib/admin/session";
import { requireAdminCapability } from "@/lib/admin/require-capability";

export async function POST(request: Request) {
  const denied = await requireAdminCapability(["chat.admin"]);
  if (denied) return denied;
  return proxyAdminBackend("/admin/conversations", { method: "POST", body: await request.text() });
}
