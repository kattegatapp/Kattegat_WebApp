const BACKEND_API_URL = (
  process.env.KATTEGAT_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

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
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For":
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "",
      },
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
