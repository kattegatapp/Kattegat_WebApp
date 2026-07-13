import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await context.params;
  return proxyAdminBackend(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, { method: "POST", body: await request.text() });
}
