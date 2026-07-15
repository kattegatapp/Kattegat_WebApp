import { NextResponse } from "next/server";

import {
  adminApiUrl,
  requireAdminSession,
  unauthorizedAdminResponse,
} from "@/lib/admin/session";
import packageJson from "../../../../../package.json";

type BackendProbe = {
  reachable: boolean;
  latencyMs: number | null;
  version: string | null;
  runtime: string | null;
  runtimeVersion: string | null;
  framework: string | null;
  language: string | null;
  database: string | null;
  cache: string | null;
  environment: string | null;
  uptimeSeconds: number | null;
  message: string | null;
};

function depVersion(name: keyof typeof packageJson.dependencies) {
  return packageJson.dependencies[name]?.replace(/^[\^~]/, "") ?? "—";
}

async function probeBackend(): Promise<BackendProbe> {
  const started = Date.now();
  const empty: BackendProbe = {
    reachable: false,
    latencyMs: null,
    version: null,
    runtime: null,
    runtimeVersion: null,
    framework: null,
    language: null,
    database: null,
    cache: null,
    environment: null,
    uptimeSeconds: null,
    message: null,
  };

  try {
    const response = await fetch(adminApiUrl("/test"), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const latencyMs = Date.now() - started;
    const body = (await response.json().catch(() => null)) as
      | {
          success?: boolean;
          data?: string | Record<string, unknown>;
        }
      | null;

    if (!response.ok || !body?.success) {
      return {
        ...empty,
        reachable: false,
        latencyMs,
        message: "Backend health check failed",
      };
    }

    if (typeof body.data === "string") {
      return {
        ...empty,
        reachable: true,
        latencyMs,
        message: body.data,
        runtime: "Node.js",
        framework: "Express",
        language: "TypeScript",
        database: "PostgreSQL (Supabase)",
        cache: "Upstash Redis",
      };
    }

    const data = body.data ?? {};
    return {
      reachable: true,
      latencyMs,
      version: typeof data.version === "string" ? data.version : null,
      runtime: typeof data.runtime === "string" ? data.runtime : "Node.js",
      runtimeVersion:
        typeof data.runtimeVersion === "string" ? data.runtimeVersion : null,
      framework: typeof data.framework === "string" ? data.framework : "Express",
      language: typeof data.language === "string" ? data.language : "TypeScript",
      database:
        typeof data.database === "string"
          ? data.database
          : "PostgreSQL (Supabase)",
      cache: typeof data.cache === "string" ? data.cache : "Upstash Redis",
      environment: typeof data.environment === "string" ? data.environment : null,
      uptimeSeconds:
        typeof data.uptimeSeconds === "number" ? data.uptimeSeconds : null,
      message: typeof data.status === "string" ? data.status : "ok",
    };
  } catch {
    return {
      ...empty,
      reachable: false,
      latencyMs: Date.now() - started,
      message: "Could not reach the API server",
    };
  }
}

async function assertValidAdminSession(
  token: string,
): Promise<"ok" | "unauthorized" | "unreachable"> {
  try {
    const response = await fetch(adminApiUrl("/auth/me"), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 401 || response.status === 403) {
      return "unauthorized";
    }
    if (!response.ok) return "unreachable";
    const body = (await response.json().catch(() => null)) as {
      success?: boolean;
    } | null;
    return body?.success ? "ok" : "unauthorized";
  } catch {
    return "unreachable";
  }
}

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const auth = await assertValidAdminSession(session);
  if (auth === "unauthorized") return unauthorizedAdminResponse();
  if (auth === "unreachable") {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Could not reach the Kattegat backend. Check NEXT_PUBLIC_API_URL and that the API is running.",
          code: "BACKEND_UNREACHABLE",
        },
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const started = Date.now();
  const backend = await probeBackend();
  const nextVersion = depVersion("next");
  const reactVersion = depVersion("react");

  return NextResponse.json(
    {
      success: true,
      data: {
        measuredAt: new Date().toISOString(),
        serverTookMs: Date.now() - started,
        web: {
          name: "Kattegat WebApp",
          version: packageJson.version,
          runtime: "Node.js",
          runtimeVersion: process.version,
          framework: "Next.js",
          frameworkVersion: nextVersion,
          language: "TypeScript",
          ui: "React",
          uiVersion: reactVersion,
          styling: "Tailwind CSS 4",
          components: "shadcn/ui",
          state: "TanStack Query",
          environment: process.env.NODE_ENV ?? "development",
        },
        backend,
        stack: [
          { label: "TypeScript", detail: "Primary language across web, API, and mobile" },
          { label: "Node.js", detail: backend.runtimeVersion ?? process.version },
          { label: "Next.js", detail: `App Router · ${nextVersion}` },
          { label: "Express", detail: "REST API server" },
          { label: "React", detail: reactVersion },
          { label: "PostgreSQL", detail: "Supabase · RLS" },
          { label: "Redis", detail: "Upstash cache" },
          { label: "Expo", detail: "React Native mobile client" },
        ],
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
