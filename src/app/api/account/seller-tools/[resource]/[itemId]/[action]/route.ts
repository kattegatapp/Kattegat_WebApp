import { NextRequest, NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { requireMemberSession } from "@/lib/auth/session";
import { billingApiUrl } from "@/lib/billing/session";

const ACTIONS = new Set(["send", "accept", "decline", "mark-paid"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; itemId: string; action: string }> },
) {
  const { resource, itemId, action } = await params;
  if (!["quotes", "invoices"].includes(resource) || action !== "document") {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const session = await requireMemberSession();
  if (session instanceof NextResponse) return session;
  const response = await fetch(
    billingApiUrl(`/seller-tools/${resource}/${itemId}/document`),
    { headers: { Authorization: `Bearer ${session}` }, cache: "no-store" },
  );
  if (!response.ok) {
    return NextResponse.json(
      { success: false, error: { message: "Could not download document" } },
      { status: response.status },
    );
  }
  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ?? `attachment; filename="kattegat-document.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; itemId: string; action: string }> },
) {
  const { resource, itemId, action } = await params;
  if (!["quotes", "invoices"].includes(resource) || !ACTIONS.has(action)) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  return proxyMemberBackend(`/seller-tools/${resource}/${itemId}/${action}`, {
    method: "POST",
    body: "{}",
  });
}
