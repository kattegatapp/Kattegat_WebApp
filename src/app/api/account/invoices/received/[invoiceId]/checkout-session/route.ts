import { NextResponse } from "next/server";
import { proxyMemberBackend } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ invoiceId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(_request: Request, context: RouteContext) {
  const { invoiceId } = await context.params;
  if (!UUID.test(invoiceId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid invoice", code: "INVALID_ID" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/invoices/received/${invoiceId}/checkout-session`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
