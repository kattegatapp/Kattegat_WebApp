import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";

export function jsonError(message: string, status: number, code: string) {
  return NextResponse.json(
    { success: false, error: { message, code } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function allowedOriginsForRequest(request: Request) {
  const origins = new Set<string>();
  origins.add(new URL(request.url).origin);

  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");

  for (const candidate of [forwardedHost, host]) {
    if (!candidate) continue;
    const normalizedHost = candidate.split(",")[0]?.trim();
    if (!normalizedHost) continue;
    origins.add(`${forwardedProto}://${normalizedHost}`);
    origins.add(`http://${normalizedHost}`);
    origins.add(`https://${normalizedHost}`);
  }

  return origins;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (allowedOriginsForRequest(request).has(origin)) return null;
  return jsonError("Cross-origin submissions are not allowed.", 403, "ORIGIN_REJECTED");
}

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
};

const buckets = new Map<string, { count: number; resetsAt: number }>();

export function isRateLimited({ key, windowMs, max }: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > max;
}

export function rateLimitResponse(retryAfterSeconds = 600) {
  return NextResponse.json(
    {
      success: false,
      error: { message: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
    },
    {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfterSeconds) },
    },
  );
}

type ParseJsonOptions = {
  maxBytes?: number;
  requireJsonContentType?: boolean;
  checkOrigin?: boolean;
  rateLimit?: RateLimitOptions;
};

export async function parseSecureJson<T>(
  request: NextRequest,
  schema: ZodType<T>,
  options: ParseJsonOptions = {},
) {
  const {
    maxBytes = 8_192,
    requireJsonContentType = true,
    checkOrigin = true,
    rateLimit,
  } = options;

  if (checkOrigin) {
    const originError = assertSameOrigin(request);
    if (originError) return { ok: false as const, response: originError };
  }

  if (rateLimit && isRateLimited(rateLimit)) {
    return { ok: false as const, response: rateLimitResponse(Math.ceil(rateLimit.windowMs / 1000)) };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (requireJsonContentType && !contentType.toLowerCase().startsWith("application/json")) {
    return {
      ok: false as const,
      response: jsonError("Content-Type must be application/json.", 415, "UNSUPPORTED_MEDIA_TYPE"),
    };
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > maxBytes) {
    return { ok: false as const, response: jsonError("Request is too large.", 413, "PAYLOAD_TOO_LARGE") };
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
      return { ok: false as const, response: jsonError("Request is too large.", 413, "PAYLOAD_TOO_LARGE") };
    }
    payload = JSON.parse(rawBody);
  } catch {
    return { ok: false as const, response: jsonError("Invalid JSON body.", 400, "INVALID_JSON") };
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false as const, response: jsonError("Invalid request body.", 400, "INVALID_BODY") };
  }

  // Honeypot — bots get a silent success.
  if (
    "website" in payload &&
    typeof (payload as { website?: unknown }).website === "string" &&
    (payload as { website: string }).website.trim()
  ) {
    return { ok: false as const, response: NextResponse.json({ success: true }) };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: jsonError("Please check the form and try again.", 400, "VALIDATION_ERROR"),
    };
  }

  return { ok: true as const, data: parsed.data };
}
