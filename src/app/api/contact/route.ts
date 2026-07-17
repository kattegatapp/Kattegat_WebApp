import { resolveBackendApiUrl } from "@/lib/api/settings";
import { contactSchema } from "@/lib/validations/contact";

const BACKEND_API_URL = resolveBackendApiUrl();
const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const contactAttempts = new Map<string, { count: number; resetsAt: number }>();

function errorResponse(message: string, status: number, code: string) {
  return Response.json(
    { success: false, error: { message, code } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function requestIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = contactAttempts.get(ip);
  if (!current || current.resetsAt <= now) {
    contactAttempts.set(ip, { count: 1, resetsAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanSingleLine(value: string) {
  return escapeHtml(value.replace(/[\u0000-\u001F\u007F]+/g, " ").trim());
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return errorResponse("Content-Type must be application/json.", 415, "UNSUPPORTED_MEDIA_TYPE");
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return errorResponse("Cross-origin submissions are not allowed.", 403, "ORIGIN_REJECTED");
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BODY_BYTES) {
    return errorResponse("Support request is too large.", 413, "PAYLOAD_TOO_LARGE");
  }

  if (isRateLimited(requestIp(request))) {
    return Response.json(
      { success: false, error: { message: "Too many requests. Please try again later.", code: "RATE_LIMITED" } },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "600" } },
    );
  }

  let payload: unknown;

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return errorResponse("Support request is too large.", 413, "PAYLOAD_TOO_LARGE");
    }
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid support request.", 400, "INVALID_JSON");
  }

  // Hidden honeypot: acknowledge bots without forwarding their submission.
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    typeof payload.website === "string" &&
    payload.website.trim()
  ) {
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse("Please check the form and try again.", 400, "VALIDATION_ERROR");
  }

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
