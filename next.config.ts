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
    "192.168.30.15",
    "192.168.30.*",
    "localhost",
    "192.168.30.13",
    "192.168.30.8"
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/api/contact",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
  // Admin and waitlist APIs are Next.js BFF routes under `src/app/api/*`.
  // Do not rewrite `/api/*` to the Express backend — that bypasses cookie→Bearer
  // session proxying and breaks approve/reject (dynamic route handlers).
};

export default nextConfig;
