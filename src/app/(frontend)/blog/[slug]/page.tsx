import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogShell from '@/components/BlogShell'
import { applyTokens, siteTokens } from '@/lib/site'
import { formatDate, getPost, getPosts } from '@/lib/blog'
import { absolute, isPreview, siteUrl } from '@/lib/urls'
import { DEFAULTS } from '@/site.config'

export const dynamic = 'force-static'
export const dynamicParams = false

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  const url = `${siteUrl()}/blog/${post.slug}`
  const image = absolute(post.meta.ogImage || post.featuredImage || DEFAULTS.ogImage)
  return {
    title: { absolute: post.meta.title || `${post.title} | ${DEFAULTS.practiceName}` },
    description: post.meta.description || post.excerpt,
    alternates: { canonical: url },
    robots: isPreview() || post.meta.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url,
      siteName: DEFAULTS.practiceName,
      locale: 'en_AU',
      title: post.meta.title || post.title,
      description: post.meta.description || post.excerpt,
      images: [{ url: image }],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const post = getPost((await params).slug)
  if (!post) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta.description || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: absolute(post.featuredImage || DEFAULTS.ogImage),
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: post.author || DEFAULTS.practiceName },
    publisher: {
      '@type': 'Organization',
      name: DEFAULTS.practiceName,
      logo: { '@type': 'ImageObject', url: absolute(DEFAULTS.logo) },
    },
  }

  return (
    <BlogShell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]}
      eyebrow={post.category || 'From the practice'}
      heading={post.title}
      lede={post.excerpt}
      image={post.featuredImage}
      imageAlt={post.featuredImageAlt}
    >
      <section className="pg">
        <div className="wrap">
          <p className="post-meta rv in">
            {formatDate(post.publishedAt)}
            {post.author ? ` - ${post.author}` : ''}
          </p>
          <div
            className="post-body rv in"
            dangerouslySetInnerHTML={{ __html: applyTokens(post.body ?? '', siteTokens()) }}
          />
          <a className="post-back" href="/blog">
            <span aria-hidden="true">&larr;</span> All posts
          </a>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </BlogShell>
  )
}
