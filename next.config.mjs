import { withPayload } from '@payloadcms/next/withPayload'
import { readFileSync } from 'node:fs'

const redirects = JSON.parse(readFileSync(new URL('./content/redirects.json', import.meta.url), 'utf8'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    // Vercel image optimisation is capped account wide, so the repo ships
    // pre-compressed webp and serves it as is
    unoptimized: true,
  },
  async redirects() {
    return redirects.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: r.type !== 'temporary',
    }))
  },
  async headers() {
    return [
      {
        // preview deployments must never be indexed
        source: '/:path*',
        has: [{ type: 'host', value: '(.*)\\.vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
