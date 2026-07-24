import { proxyAdminBackend } from "@/lib/admin/session";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ requirementId: string }> },
) {
  const { requirementId } = await context.params;
  return proxyAdminBackend(`/admin/requirements/${requirementId}`, {
    method: "DELETE",
  });
}
