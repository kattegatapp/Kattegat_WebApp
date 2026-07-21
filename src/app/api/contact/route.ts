import { type NextRequest } from "next/server";

import { resolveBackendApiUrl } from "@/lib/api/settings";
import { cleanSingleLine, escapeHtml } from "@/lib/security/input";
import { parseSecureJson, requestIp } from "@/lib/security/request";
import { contactSchema } from "@/lib/validations/contact";

const BACKEND_API_URL = resolveBackendApiUrl();

function errorResponse(message: string, status: number, code: string) {
  return Response.json(
    { success: false, error: { message, code } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const parsed = await parseSecureJson(request, contactSchema, {
    maxBytes: 12_000,
    rateLimit: {
      key: `contact:${requestIp(request)}`,
      windowMs: 10 * 60 * 1000,
      max: 5,
    },
  });
  if (!parsed.ok) return parsed.response;

  try {
    const backendOrigin = new URL(BACKEND_API_URL).origin;
    if (backendOrigin === new URL(request.url).origin) {
      return errorResponse("Support service is not configured.", 503, "BACKEND_URL_LOOP");
    }

    const safePayload = {
      ...parsed.data,
      fullName: cleanSingleLine(parsed.data.fullName),
      email: cleanSingleLine(parsed.data.email),
      phone: parsed.data.phone ? cleanSingleLine(parsed.data.phone) : undefined,
      company: parsed.data.company ? cleanSingleLine(parsed.data.company) : undefined,
      message: escapeHtml(parsed.data.message.replace(/\u0000/g, "")),
    };

    const response = await fetch(`${BACKEND_API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safePayload),
      cache: "no-store",
    });
    const backendContentType = response.headers.get("content-type") ?? "";
    if (!backendContentType.includes("application/json")) {
      return errorResponse("Support service returned an invalid response.", 502, "INVALID_RESPONSE");
    }

    const backendBody = (await response.json()) as { success?: boolean };
    if (!response.ok || !backendBody.success) {
      return errorResponse("We could not send your message. Please try again.", 502, "DELIVERY_FAILED");
    }

    return Response.json(
      { success: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return errorResponse("Support is temporarily unavailable. Please email us directly.", 502, "SUPPORT_UNAVAILABLE");
  }
}

export function GET() {
  return errorResponse("Not found", 404, "NOT_FOUND");
}
