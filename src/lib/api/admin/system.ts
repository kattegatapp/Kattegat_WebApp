import { apiFetch } from "@/lib/api/client";

export type AdminSystemInfo = {
  measuredAt: string;
  serverTookMs: number;
  web: {
    name: string;
    version: string;
    runtime: string;
    runtimeVersion: string;
    framework: string;
    frameworkVersion: string;
    language: string;
    ui: string;
    uiVersion: string;
    styling: string;
    components: string;
    state: string;
    environment: string;
  };
  backend: {
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
  stack: Array<{ label: string; detail: string }>;
};

export function fetchAdminSystemInfo() {
  return apiFetch<AdminSystemInfo>("/api/admin/system", undefined, { baseUrl: "" });
}
