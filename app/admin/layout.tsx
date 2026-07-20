import type React from "react"
import type { Metadata } from "next"
import AdminShell from "./AdminShell"

// This layout is a server component purely so it can export metadata — the
// interactive shell (auth guard, sidebar, dropdowns) lives in AdminShell.tsx
// and is unchanged. robots.txt disallow alone does not stop indexing of URLs
// discovered via external links, so the admin subtree needs a real noindex.
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
