import type React from "react";
import type { Metadata } from "next";
import { Jost, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DynamicMetadata } from "@/components/DynamicMetadata";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { cn } from "@/lib/utils";

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

export const metadata: Metadata = {
  title: "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions & LDPE Films",
  description:
    "Rayzor Industrial Packaging Pvt Ltd is the leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags in Madurai, Tamil Nadu.",
  generator: "Next.js",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://www.rayzorpack.com"),
  openGraph: {
    title: "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions",
    description:
      "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
    url: "https://www.rayzorpack.com",
    siteName: "Rayzor Industrial Packaging Pvt Ltd",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions",
    description:
      "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
  },
};

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
      </body>
    </html>
  );
}
