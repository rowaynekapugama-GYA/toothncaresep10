import { payloadClient, requireUser } from '@/dashboard/lib/server'
import { PagesList } from '@/dashboard/editors/Lists'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pages' }

const MAIN = new Set(['index', 'about', 'services', 'contact', 'our-team', 'our-clinic', 'our-technology', 'new-patients',
  'payment-options', 'offers', 'emergency', 'faq', 'nervous-patients', 'areas-we-serve', 'conditions-we-treat', 'envision-your-smile'])
const LEGAL = new Set(['privacy-policy', 'terms', 'sitemap', 'page-not-found'])
const TEAM = new Set(['dr-navneet-karan', 'dr-nisheeth-agrawal', 'zoe-xu'])

function groupOf(slug: string): string {
  if (MAIN.has(slug)) return 'Main pages'
  if (LEGAL.has(slug)) return 'Legal and practice information'
  if (TEAM.has(slug)) return 'Team'
  if (slug.startsWith('dentist-')) return 'Suburb pages'
  return 'Treatments and services'
}

export default async function Pages() {
  await requireUser()
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'pages', limit: 1000, depth: 0, overrideAccess: true, pagination: false,
    where: { isChrome: { not_equals: true } },
    select: { title: true, path: true, pageSlug: true, meta: true, updatedAt: true },
  })
  const rows = res.docs.map((d) => {
    const slug = String(d.pageSlug)
    return {
      id: d.id,
      label: String(d.title),
      url: slug === 'page-not-found' ? '' : String(d.path || ''),
      group: groupOf(slug),
      noindex: !!(d.meta as { noindex?: boolean } | undefined)?.noindex,
      updatedAt: String(d.updatedAt),
    }
  })
  rows.sort((a, b) => (a.url === '/' ? -1 : b.url === '/' ? 1 : a.label.localeCompare(b.label)))
  return (
    <>
      <div className="pd-head"><div className="grow"><h1>Pages</h1><p className="pd-sub">Every page of the website. Open one to change its wording, photos, section order and SEO.</p></div></div>
      {!rows.length ? <p className="empty">The dashboard has no pages yet. GYA loads them with Import on the Dashboard.</p> : <PagesList rows={rows} />}
    </>
  )
}
