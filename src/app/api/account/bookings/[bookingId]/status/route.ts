import { NextResponse } from "next/server";
import { proxyMemberBackend } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ bookingId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONS = new Set(["start", "submit_completion", "confirm_completion", "cancel"]);

export async function PATCH(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  if (!UUID.test(bookingId) || !body?.action || !ACTIONS.has(body.action)) {
    return NextResponse.json({ success: false, error: { message: "Invalid booking action", code: "VALIDATION_ERROR" } }, { status: 400 });
  }
  return proxyMemberBackend(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ action: body.action }),
  });
}
