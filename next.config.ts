import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.30.8", "192.168.30.12", "65.75.202.125", "kattegat.app", "www.kattegat.app","api.kattegat.app","192.168.30.11"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3001/:path*',
      },
    ];
  },
};

export default nextConfig;