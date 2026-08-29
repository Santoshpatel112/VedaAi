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
  // Empty turbopack config suppresses the webpack/turbopack conflict warning.
  // PDF.js worker handling is done at runtime in pdf-question-extractor.ts.
  turbopack: {},
} as NextConfig;

export default nextConfig;
