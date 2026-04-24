import type { NextConfig } from "next";

const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://api-gateway:8080";;

const nextConfig: NextConfig = {
  turbopack: {},
  productionBrowserSourceMaps: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${GATEWAY_URL}/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
