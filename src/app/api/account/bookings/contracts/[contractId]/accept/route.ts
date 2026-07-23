import { NextResponse } from "next/server";
import { proxyMemberBackend } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ contractId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDENTITIES = new Set(["buyer", "seller"]);

export async function POST(request: Request, context: RouteContext) {
  const { contractId } = await context.params;
  const body = (await request.json().catch(() => null)) as { identity?: string } | null;
  if (!UUID.test(contractId) || !body?.identity || !IDENTITIES.has(body.identity)) {
    return NextResponse.json({ success: false, error: { message: "Invalid contract", code: "INVALID_ID" } }, { status: 400 });
  }
  return proxyMemberBackend(`/bookings/contracts/${contractId}/accept`, {
    method: "POST",
    body: JSON.stringify({ identity: body.identity }),
  });
}
