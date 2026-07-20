import type { NextRequest } from "next/server";
import { proxyAdminBackend } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await context.params;
  return proxyAdminBackend(`/admin/contact-submissions/${submissionId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
