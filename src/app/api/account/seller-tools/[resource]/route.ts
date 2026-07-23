import { NextRequest, NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

const ALLOWED = new Set(["quotes", "invoices", "clients"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!ALLOWED.has(resource)) return NextResponse.json({ success: false }, { status: 404 });
  return proxyMemberBackend(`/seller-tools/${resource}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!ALLOWED.has(resource)) return NextResponse.json({ success: false }, { status: 404 });
  return proxyMemberBackend(`/seller-tools/${resource}`, {
    method: "POST",
    body: await request.text(),
  });
}
