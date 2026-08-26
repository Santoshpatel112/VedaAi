import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow large PDF/image uploads (up to 50MB) for Server Actions
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Allow large bodies through proxy/middleware layer
    proxyClientMaxBodySize: "50mb",
  },
} as NextConfig;

export default nextConfig;
