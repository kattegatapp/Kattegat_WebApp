import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(_request: Request, context: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await context.params;
  return proxyAdminBackend(`/admin/identity-verifications/${encodeURIComponent(sellerId)}/approve`, { method: "POST" });
}
