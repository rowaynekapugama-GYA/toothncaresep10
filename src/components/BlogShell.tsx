import type { ReactNode } from 'react'
import RawPart from '@/components/RawPart'
import { getChrome } from '@/lib/content'
import StickyBar from '@/components/StickyBar'
import { siteTokens } from '@/lib/site'

type Crumb = { label: string; href?: string }

const Chevron = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="m9 5 7 7-7 7" />
  </svg>
)

/**
 * The blog reuses the header, footer and hero styling of the rest of the
 * site so a post never looks like it came from somewhere else.
 */
export default function BlogShell({
  crumbs,
  eyebrow,
  heading,
  lede,
  image,
  imageAlt,
  children,
}: {
  crumbs: Crumb[]
  eyebrow: string
  heading: string
  lede?: string
  image?: string | null
  imageAlt?: string
  children: ReactNode
}) {
  const { parts } = getChrome()
  const tokens = siteTokens()

  return (
    <>
      <link rel="stylesheet" href="/styles/globals.css" precedence="site" />
      <link rel="stylesheet" href="/styles/pages/about.a.css" precedence="site" />
      <link rel="stylesheet" href="/styles/common.css" precedence="site" />
      <link rel="stylesheet" href="/styles/pages/about.b.css" precedence="site" />
      <link rel="stylesheet" href="/styles/blog.css" precedence="site" />
      <link rel="stylesheet" href="/styles/mobile-fixes.css" precedence="site" />

      <RawPart part={parts.progress} tokens={tokens} />
      <RawPart part={parts.stickyCall} tokens={tokens} />
      <StickyBar tokens={tokens} />
      <RawPart part={parts.header} tokens={tokens} />
      <RawPart part={parts.mobileMenu} tokens={tokens} />

      <nav className="crumbs" aria-label="Breadcrumb">
        <div className="wrap">
          {crumbs.map((c, i) => (
            <span key={c.label} style={{ display: 'contents' }}>
              {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
              {i < crumbs.length - 1 ? <Chevron /> : null}
            </span>
          ))}
        </div>
      </nav>

      <section className={`p-hero${image ? ' has-img' : ''}`} id="top">
        <div className="hero-fx" aria-hidden="true">
          <i className="glow" />
          <i className="glow-r" />
        </div>
        {image ? (
          <div className="p-hero-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt || ''} width={1600} height={900} />
          </div>
        ) : null}
        <div className="wrap">
          <span className="eyebrow rv in">{eyebrow}</span>
          <h1 className="rv in">{heading}</h1>
          {lede ? <p className="lede rv in">{lede}</p> : null}
        </div>
      </section>

      {children}

      <RawPart part={parts.footer} tokens={tokens} />
    </>
  )
}
