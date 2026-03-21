import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // DishIs Technologies Image Hosting CDN (Cloudflare + R2 + KV)
      { protocol: "https", hostname: "i.dishis.tech" },
      { protocol: "https", hostname: "i.api.dishis.tech" },
      // Google profile photos (for auth avatars)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // R2 public buckets (if used for direct uploads)
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["nyaree.in", "www.nyaree.in", "*.workers.dev", "localhost:3000"],
    },
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
      { source: "/login", destination: "/auth/login", permanent: false },
    ];
  },
};

export default nextConfig;
