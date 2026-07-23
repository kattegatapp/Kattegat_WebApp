import { NextResponse } from "next/server";
import { billingApiUrl } from "@/lib/billing/session";
import { requireMemberSession } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ invoiceId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: RouteContext) {
  const { invoiceId } = await context.params;
  if (!UUID.test(invoiceId)) {
    return NextResponse.json({ success: false, error: { message: "Invalid invoice", code: "INVALID_ID" } }, { status: 400 });
  }
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;
  const response = await fetch(billingApiUrl(`/invoices/received/${invoiceId}/document`), {
    headers: { Authorization: `Bearer ${session}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ success: false, error: { message: "Could not download invoice", code: "INVOICE_DOWNLOAD_FAILED" } }, { status: response.status });
  }
  return new Response(await response.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("content-disposition") ?? `attachment; filename="kattegat-invoice.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
