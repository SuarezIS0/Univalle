import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Turbopack (Next.js 16)
  turbopack: {},
  // Deshabilitar source maps en desarrollo para reducir memoria
  productionBrowserSourceMaps: false,
};

export default nextConfig;
