import type { Metadata } from "next";

// The login pages are client components and so cannot export metadata
// themselves. This layout applies noindex to the whole /login subtree —
// robots.txt disallow alone does not prevent indexing of URLs discovered
// through external links.
export const metadata: Metadata = {
  title: "Login",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
