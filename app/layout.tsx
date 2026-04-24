// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { PageLoader } from "@/components/ui/PageLoader";

export const metadata: Metadata = {
  metadataBase: new URL("https://buynyaree.com"),
  title: {
    default: "Nyaree — Wear India. Own It. | Premium Kurtis & Tops",
    template: "%s | Nyaree",
  },
  description:
    "Discover handcrafted kurtis and trending tops at Nyaree. Made in India, designed for the modern Indian woman. Free shipping above ₹499. Easy returns.",
  keywords: [
    "kurti online", "women kurti", "cotton kurti", "printed kurti", "trendy tops",
    "Indian women fashion", "buy kurti online India", "Nyaree", "ethnic wear",
    "casual wear India", "made in India fashion",
  ],
  authors: [{ name: "Rishika Singh", url: "https://buynyaree.com" }],
  creator: "Nyaree",
  publisher: "Nyaree",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    siteName: "Nyaree",
    locale: "en_IN",
    url: "https://buynyaree.com",
    title: "Nyaree — Wear India. Own It.",
    description: "Premium handcrafted kurtis and trending tops for the modern Indian woman.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Nyaree Fashion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyaree — Wear India. Own It.",
    description: "Premium kurtis and trending tops. Made in India.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ],
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: "https://buynyaree.com" },
  // Google Search Console: verify via DNS TXT record instead of meta tag
  // Add GOOGLE_SITE_VERIFICATION to .env.local and use:
  // other: { "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION ?? "" },
};

export const viewport: Viewport = {
  themeColor: "#1A1208",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Playfair+Display:ital,wght@1,400;1,500&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Nyaree",
              url: "https://buynyaree.com",
              logo: "https://buynyaree.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-8368989758",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Parnala Extended Industrial Area",
                addressLocality: "Bahadurgarh",
                addressRegion: "Haryana",
                postalCode: "124507",
                addressCountry: "IN",
              },
              sameAs: [
                "https://instagram.com/buy_nyaree",
                "https://facebook.com/nyaree",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Nyaree",
              url: "https://buynyaree.com",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: "https://buynyaree.com/search?q={search_term_string}" },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        <div id="portal-root" />
        <PageLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
