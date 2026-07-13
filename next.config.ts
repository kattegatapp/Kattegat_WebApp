import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.30.8",
    "192.168.30.12",
    "65.75.202.125",
    "kattegat.app",
    "www.kattegat.app",
    "api.kattegat.app",
    "192.168.30.11",
    "192.168.30.9",
    "192.168.30.15"
  ],
  // Admin and waitlist APIs are Next.js BFF routes under `src/app/api/*`.
  // Do not rewrite `/api/*` to the Express backend — that bypasses cookie→Bearer
  // session proxying and breaks approve/reject (dynamic route handlers).
};

export default nextConfig;
