import type { MetadataRoute } from 'next'
import { isPreview, siteUrl } from '@/lib/urls'
import { getSeoDefaults } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  if (isPreview() || getSeoDefaults().noindexSite) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/cms', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
