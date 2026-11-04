import type { MetadataRoute } from 'next'
import { allSlugs, getPage } from '@/lib/content'
import { getPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/urls'

export const dynamic = 'force-static'

const EXCLUDE = new Set(['page-not-found', 'terms', 'privacy-policy'])

const PRIORITY: Record<string, number> = { index: 1, services: 0.9, contact: 0.9 }

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const posts = getPosts()
  const blog: MetadataRoute.Sitemap = posts.length
    ? [
        {
          url: `${siteUrl()}/blog`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        },
        ...posts.map((p) => ({
          url: `${siteUrl()}/blog/${p.slug}`,
          lastModified: new Date(p.publishedAt),
          changeFrequency: 'yearly' as const,
          priority: 0.6,
        })),
      ]
    : []

  const pages = allSlugs()
    .filter((slug) => !EXCLUDE.has(slug))
    // pages hidden from Google in the dashboard are left out of the sitemap too
    .filter((slug) => !(getPage(slug)?.meta.robots ?? '').includes('noindex'))
    .map((slug) => {
      const page = getPage(slug)
      return {
        url: `${siteUrl()}${page?.path === '/' ? '/' : page?.path ?? `/${slug}`}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: PRIORITY[slug] ?? (slug.startsWith('dentist-') ? 0.7 : 0.8),
      }
    })

  return [...pages, ...blog]
}
