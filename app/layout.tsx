import type React from "react";
import type { Metadata } from "next";
import { Jost, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DynamicMetadata } from "@/components/DynamicMetadata";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { DynamicGoogleAnalytics } from "@/components/DynamicGoogleAnalytics";
import { cn } from "@/lib/utils";
import { SITE_URL, DEFAULT_OG_IMAGE, getSiteSettings } from "@/lib/site-config";

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-jost",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  // siteName / siteTagline / favicon come from the admin Settings record, the
  // same values DynamicMetadata used to apply client-side. Resolving them here
  // means they reach the server-rendered HTML without stomping per-page titles.
  const settings = await getSiteSettings();

  return {
  title: {
    template: `%s | ${settings.siteName}`,
    default: `${settings.siteName} | ${settings.siteTagline}`,
  },
  description:
    "Rayzor Industrial Packaging Pvt Ltd is the leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags in Madurai, Tamil Nadu.",
  generator: "Next.js",
  icons: {
    icon: [{ url: settings.favicon || "/favicon.ico", sizes: "any" }],
    apple: settings.favicon || undefined,
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(SITE_URL),
  // No `alternates.canonical` here on purpose: a canonical set on the root
  // layout is inherited by every route that doesn't override it, which made
  // pages without their own metadata self-canonicalize to "/".
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${settings.siteName} | ${settings.siteTagline}`,
    description:
      "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
    url: SITE_URL,
    siteName: settings.siteName,
    type: "website",
    locale: "en_IN",
    images: [settings.logo || DEFAULT_OG_IMAGE.url],
  },
  twitter: {
    card: "summary_large_image",
    title: `${settings.siteName} | ${settings.siteTagline}`,
    description:
      "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
    images: [settings.logo || DEFAULT_OG_IMAGE.url],
  },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(jost.variable, ibmPlexMono.variable)}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1689cf" />
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <DynamicMetadata />
        {children}
        <FloatingContactButtons />
        <Toaster />
        <Analytics />
        <DynamicGoogleAnalytics />
      </body>
    </html>
  );
}
