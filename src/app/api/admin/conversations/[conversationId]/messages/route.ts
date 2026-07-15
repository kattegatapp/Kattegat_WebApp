import { requireAdminCapability } from "@/lib/admin/require-capability";
import { proxyAdminBackend } from "@/lib/admin/session";
import { NextResponse } from "next/server";
import { validateChatMessageInput } from "@/lib/sanitize/chat-message";

export async function GET(
  _request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  const denied = await requireAdminCapability(["chat.admin"]);
  if (denied) return denied;

  const { conversationId } = await context.params;
  return proxyAdminBackend(
    `/admin/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  const denied = await requireAdminCapability(["chat.admin"]);
  if (denied) return denied;

  const { conversationId } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body", code: "INVALID_BODY" } },
      { status: 400 },
    );
  }

  const body =
    payload && typeof payload === "object" && "body" in payload
      ? String((payload as { body?: unknown }).body ?? "")
      : "";
  const type =
    payload && typeof payload === "object" && "type" in payload
      ? String((payload as { type?: unknown }).type ?? "text")
      : "text";

  if (type !== "text" && type !== "image") {
    return NextResponse.json(
      { success: false, error: { message: "Unsupported message type", code: "MESSAGE_UNSAFE" } },
      { status: 400 },
    );
  }

  if (type === "text") {
    const validated = validateChatMessageInput(body);
    if (!validated.ok) {
      return NextResponse.json(
        { success: false, error: { message: validated.error, code: "MESSAGE_UNSAFE" } },
        { status: 400 },
      );
    }
    return proxyAdminBackend(
      `/admin/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ body: validated.value, type: "text" }),
      },
    );
  }

  try {
    const url = new URL(body.trim());
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("bad url");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Image must use a valid HTTPS URL", code: "MESSAGE_UNSAFE" } },
      { status: 400 },
    );
  }

  return proxyAdminBackend(
    `/admin/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body: body.trim(), type: "image" }),
    },
  );
}
