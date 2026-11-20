import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBody from '@/components/PageBody'
import { allSlugs, getPage, isHiddenPage } from '@/lib/content'
import { absolute, isPreview, siteUrl } from '@/lib/urls'
import { DEFAULTS } from '@/site.config'
import { getSeoDefaults } from '@/lib/seo'
import { siteTokens } from '@/lib/site'
import { applyTokens } from '@/lib/tokens'
import { applyGoLiveText } from '@/lib/golive'

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
  const slug = slugFrom((await params).slug)
  const page = isHiddenPage(slug) ? null : getPage(slug)
  if (!page) return {}
  // titles and descriptions can hold {{site:...}} placeholders (role titles from src/team.config.ts)
  const tokens = siteTokens()
  // and the go-live switches (src/golive.config.ts) leave out offers that are switched off
  const t = (s: string | undefined) => (s ? applyGoLiveText(applyTokens(s, tokens)) : s)
  const meta = { ...page.meta, title: t(page.meta.title), description: t(page.meta.description), ogTitle: t(page.meta.ogTitle), ogDescription: t(page.meta.ogDescription) }
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
  const slug = slugFrom((await params).slug)
  // a page kept off the website until it is switched on (src/team.config.ts) is not found
  const page = isHiddenPage(slug) ? null : getPage(slug)
  if (!page) notFound()
  return <PageBody page={page} />
}
