export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; total: number };
}

interface ApiFailure {
  success: false;
  error: { message: string; code: string };
}

export class ApiRequestError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface ApiFetchOptions {
  baseUrl?: string;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  const envelope = await apiFetchEnvelope<T>(path, init, options);
  return envelope.data;
}

export async function apiFetchEnvelope<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<{ data: T; meta?: { page: number; total: number } }> {
  const baseUrl = options?.baseUrl ?? API_URL;
  let res: Response;

  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: init?.credentials ?? "same-origin",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the Kattegat API. Please check that the backend is running.",
      "NETWORK_ERROR",
      0,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new ApiRequestError(
      "The Kattegat API returned an unexpected response. Please check the backend URL.",
      "INVALID_RESPONSE",
      res.status,
    );
  }

  const body = (await res.json()) as ApiSuccess<T> | ApiFailure;

  if (!body.success) {
    throw new ApiRequestError(body.error.message, body.error.code, res.status);
  }

  return { data: body.data, meta: body.meta };
}
