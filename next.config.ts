import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.dishis.tech" },
      { protocol: "https", hostname: "i.api.dishis.tech" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["buynyaree.com", "www.buynyaree.com", "*.workers.dev", "localhost:3000"],
    },
  },

  serverExternalPackages: ["mongoose"],

  // ── Webpack: silence optional MongoDB peer dep warnings ────────────────────
  // These packages (kerberos, snappy, aws4, etc.) are optional and not needed.
  // Without this, Next.js shows "Module not found" warnings for them.
  webpack(config, { isServer }) {
    if (isServer) {
      // Tell webpack to treat these as empty modules (they're optional in mongodb)
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        // MongoDB optional dependencies — not needed for basic usage
        "kerberos",
        "mongodb-client-encryption",
        "@mongodb-js/zstd",
        "@aws-sdk/credential-providers",
        "snappy",
        "socks",
        "aws4",
        "nock",
      ];
    }

    // Also handle them via resolve.fallback for client-side bundles
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        child_process: false,
      };
    }

    return config;
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
