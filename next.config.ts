import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Init CF bindings in local dev so getCloudflareContext() works
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // No edge runtime — use Node.js runtime for full CF Workers compat
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: { allowedOrigins: ["nyaree.in", "*.workers.dev"] },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
