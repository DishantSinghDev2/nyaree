// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",  // admin
          "/api/",        // API routes
          "/auth/error",  // auth error page
        ],
      },
      {
        // Block AI crawlers from scraping product data
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    sitemap: "https://buynyaree.com/sitemap.xml",
    host: "https://buynyaree.com",
  };
}
