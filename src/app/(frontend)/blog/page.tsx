import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogShell from '@/components/BlogShell'
import { formatDate, getPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/urls'
import { DEFAULTS } from '@/site.config'

export const dynamic = 'force-static'

export function generateMetadata(): Metadata {
  return {
    title: { absolute: `News and advice | ${DEFAULTS.practiceName}` },
    description: `Updates, advice and practice news from ${DEFAULTS.practiceName} in ${DEFAULTS.address.suburb}.`,
    alternates: { canonical: `${siteUrl()}/blog` },
  }
}

export default function BlogIndex() {
  const posts = getPosts()
  if (posts.length === 0) notFound()

  return (
    <BlogShell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      eyebrow="From the practice"
      heading="News and advice"
      lede="Updates from the team, and answers to the questions we hear most often."
    >
      <section className="pg">
        <div className="wrap">
          <div className="rel-grid blog-grid">
            {posts.map((post) => (
              <a className="rel-card rv in" key={post.slug} href={`/blog/${post.slug}`}>
                <b>{post.title}</b>
                <span>{post.excerpt}</span>
                <em>
                  {formatDate(post.publishedAt)} <span className="btn-arrow">&rarr;</span>
                </em>
              </a>
            ))}
          </div>
        </div>
      </section>
    </BlogShell>
  )
}
