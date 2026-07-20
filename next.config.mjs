/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    // Cloudinary is the only remote image host. Three cloud names are in play:
    // the current account plus two historical ones still referenced by URLs
    // already stored in the database.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Some components request quality={90}; Next 16 requires every quality used
    // to be declared here or it warns and falls back.
    qualities: [75, 90],
  },

  async redirects() {
    return [
      {
        // Google indexes the www host, so the apex is a duplicate of every
        // page. A 301 collapses the two into one origin and stops link equity
        // being split across them. Matching on `host` means localhost and
        // preview deploys are unaffected.
        source: '/:path*',
        has: [{ type: 'host', value: 'rayzorpack.com' }],
        destination: 'https://www.rayzorpack.com/:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ]

    return [
      {
        // Baseline security headers on every response.
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Admin panel and API responses must never be cached — they are
        // per-user and change constantly.
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        // Public pages: allow a CDN to serve a cached copy while revalidating in
        // the background. Previously `no-store` on `/(.*)` applied here and to
        // /_next/static, forcing every visitor to re-download the whole bundle
        // and blocking edge caching entirely.
        source: '/((?!admin|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

export default nextConfig
