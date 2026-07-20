import { proxyAdminBackend } from "@/lib/admin/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return proxyAdminBackend(`/admin/payments${query ? `?${query}` : ""}`);
}
