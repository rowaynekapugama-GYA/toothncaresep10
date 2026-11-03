import type { ReactElement, ReactNode } from 'react'
import RawPart from '@/components/RawPart'
import EnquiryScript from '@/components/EnquiryScript'
import StickyBar from '@/components/StickyBar'
import { getChrome, isEmptySlot, type Page } from '@/lib/content'
import { rewriteJsonLd } from '@/lib/jsonld'
import { siteTokens } from '@/lib/site'
import { applyTokens } from '@/lib/tokens'

function PageStyles({ slug }: { slug: string }): ReactElement {
  // the order matches the two inline style blocks the approved build shipped,
  // so the cascade resolves exactly as it did there
  return (
    <>
      <link rel="stylesheet" href="/styles/globals.css" precedence="site" />
      <link rel="stylesheet" href={`/styles/pages/${slug}.a.css`} precedence="site" />
      <link rel="stylesheet" href="/styles/common.css" precedence="site" />
      <link rel="stylesheet" href={`/styles/pages/${slug}.b.css`} precedence="site" />
      {/* loaded last so the phone and tablet fixes win */}
      <link rel="stylesheet" href="/styles/mobile-fixes.css" precedence="site" />
    </>
  )
}

export default function PageBody({ page }: { page: Page }): ReactElement {
  const { parts } = getChrome()
  const ov = page.chromeOverrides ?? {}
  const tokens = siteTokens()
  const hasForm = page.sections.some((s) => s.template.includes('id="enquiryForm"'))
  const out: ReactNode[] = []

  for (const step of page.order) {
    if (step === 'jsonLd') continue

    if (step.startsWith('section:')) {
      const section = page.sections[Number(step.slice(8))]
      if (!section || isEmptySlot(section)) continue
      out.push(<RawPart key={section.key} part={section} tokens={tokens} />)
      continue
    }

    if (step.startsWith('script:')) {
      const i = Number(step.slice(7))
      const script = page.bodyScripts[i]
      if (!script) continue
      out.push(
        script.src ? (
          <script key={`s-${i}`} type={script.type ?? undefined} src={script.src} async />
        ) : (
          <script key={`s-${i}`} dangerouslySetInnerHTML={{ __html: script.inline ?? '' }} />
        ),
      )
      continue
    }

    const part = parts[step]
    if (part) out.push(<RawPart key={step} part={part} overrides={ov[step]} tokens={tokens} />)
    if (step === 'stickyCall') out.push(<StickyBar key="sticky-bar" tokens={tokens} />)
  }

  return (
    <>
      <PageStyles slug={page.slug} />
      {out}
      {hasForm ? <EnquiryScript tokens={tokens} /> : null}
      {page.jsonLd.map((block, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: rewriteJsonLd(applyTokens(block, tokens)) }}
        />
      ))}
    </>
  )
}
