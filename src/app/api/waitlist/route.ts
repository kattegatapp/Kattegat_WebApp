import { getPublicAppSettings, resolveBackendApiUrl } from "@/lib/api/settings";

const BACKEND_API_URL = resolveBackendApiUrl();

function errorResponse(message: string, status: number, code: string) {
  return Response.json(
    {
      success: false,
      error: { message, code },
    },
    { status },
  );
}

export async function POST(request: Request) {
  // Hard gate: closed waitlist or maintenance — reject before proxying.
  const settings = await getPublicAppSettings();
  if (settings.features.maintenanceMode) {
    return errorResponse(
      settings.features.maintenanceMessage || "Kattegat is temporarily unavailable.",
      503,
      "MAINTENANCE_MODE",
    );
  }
  if (!settings.features.waitlistEnabled) {
    return errorResponse(
      "The waitlist is closed.",
      404,
      "WAITLIST_DISABLED",
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse("Invalid waitlist submission.", 400, "INVALID_JSON");
  }

  let backendOrigin: string;

  try {
    backendOrigin = new URL(BACKEND_API_URL).origin;
  } catch {
    return errorResponse(
      "The waitlist backend URL is invalid. Set NEXT_PUBLIC_API_URL or KATTEGAT_API_URL to the backend server.",
      500,
      "BACKEND_URL_INVALID",
    );
  }

  const webAppOrigin = new URL(request.url).origin;

  if (webAppOrigin === backendOrigin) {
    return errorResponse(
      "The waitlist backend URL points back to the web app. Set NEXT_PUBLIC_API_URL or KATTEGAT_API_URL to the backend server.",
      500,
      "BACKEND_URL_LOOP",
    );
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return errorResponse(
        "The waitlist backend returned an unexpected response.",
        502,
        "WAITLIST_BACKEND_INVALID_RESPONSE",
      );
    }

    const body = await response.json();

    return Response.json(body, { status: response.status });
  } catch {
    return errorResponse(
      "Could not reach the waitlist backend. Please make sure the backend server is running.",
      502,
      "WAITLIST_BACKEND_UNAVAILABLE",
    );
  }
}

/** No other methods when waitlist is a write-only public endpoint. */
export function GET() {
  return errorResponse("Not found", 404, "NOT_FOUND");
}
