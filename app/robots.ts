// app/robots.ts
import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/auth/"] },
    ],
    sitemap: "https://nyaree.in/sitemap.xml",
    host: "https://nyaree.in",
  };
}
