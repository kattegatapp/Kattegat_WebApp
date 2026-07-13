import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: Request, context: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await context.params;
  return proxyAdminBackend(`/admin/identity-verifications/${encodeURIComponent(sellerId)}/reject`, {
    method: "POST",
    body: await request.text(),
  });
}
