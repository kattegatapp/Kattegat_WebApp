import { proxyAdminBackend } from "@/lib/admin/session";

export async function PUT(
  request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await context.params;
  const body = await request.text();
  return proxyAdminBackend(`/admin/categories/${categoryId}/listing-fields`, {
    method: "PUT",
    body,
  });
}
