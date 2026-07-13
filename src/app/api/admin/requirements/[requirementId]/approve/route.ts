import { proxyAdminBackend } from "@/lib/admin/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ requirementId: string }> },
) {
  const { requirementId } = await params;
  return proxyAdminBackend(`/admin/requirements/${requirementId}/approve`, { method: "POST" });
}
