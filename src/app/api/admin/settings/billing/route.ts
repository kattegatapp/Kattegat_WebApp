import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET() {
  return proxyAdminBackend("/admin/settings/billing");
}

export async function PATCH(request: Request) {
  const body = await request.text();
  return proxyAdminBackend("/admin/settings/billing", {
    method: "PATCH",
    body,
  });
}
