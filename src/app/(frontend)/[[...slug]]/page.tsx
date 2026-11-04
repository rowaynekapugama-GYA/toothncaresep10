import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBody from '@/components/PageBody'
import { allSlugs, getPage } from '@/lib/content'
import { absolute, isPreview, siteUrl } from '@/lib/urls'
import { DEFAULTS } from '@/site.config'
import { getSeoDefaults } from '@/lib/seo'

export const dynamicParams = true

type Props = { params: Promise<{ slug?: string[] }> }

const HIDDEN = new Set<string>()

function slugFrom(parts?: string[]): string {
  if (!parts || parts.length === 0) return 'index'
  return parts.join('/')
}

export function generateStaticParams(): { slug?: string[] }[] {
  return allSlugs()
    .filter((s) => !HIDDEN.has(s))
    .map((s) => (s === 'index' ? { slug: [] } : { slug: [s] }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage(slugFrom((await params).slug))
  if (!page) return {}
  const { meta } = page
  const canonical = `${siteUrl()}${page.path === '/' ? '/' : page.path}`
  const seo = getSeoDefaults()
  const image = absolute(meta.ogImage || seo.defaultOgImage || DEFAULTS.ogImage)
  const noindex =
    isPreview() || !!seo.noindexSite || page.slug === 'page-not-found' || (meta.robots ?? '').includes('noindex')

  return {
    title: { absolute: meta.title || seo.defaultTitle || DEFAULTS.practiceName },
    description: meta.description || seo.defaultDescription,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: DEFAULTS.practiceName,
      locale: 'en_AU',
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      images: [image],
    },
  }
}

export default async function Page({ params }: Props) {
  const page = getPage(slugFrom((await params).slug))
  if (!page) notFound()
  return <PageBody page={page} />
}
