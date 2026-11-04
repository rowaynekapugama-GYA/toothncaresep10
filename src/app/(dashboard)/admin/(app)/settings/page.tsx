import { payloadClient, requireUser } from '@/dashboard/lib/server'
import { SettingsForm } from '@/dashboard/editors/SettingsForm'
import { mediaUrl } from '@/sitekit/sync'
import { mergeSettings } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Site Settings' }

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export default async function SettingsPage() {
  const u = await requireUser()
  const isAdmin = u.role === 'admin'
  const payload = await payloadClient()
  const g = await payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: true }) as Record<string, any>
  const seo = await payload.findGlobal({ slug: 'seo', depth: 1, overrideAccess: true }) as Record<string, any>
  // what the website uses today: the defaults with anything saved on top
  const m = mergeSettings(JSON.parse(JSON.stringify(g, (_k, v) => (v === null ? undefined : v)))) as Record<string, any>
  const contact = await payload.find({ collection: 'pages', where: { pageSlug: { equals: 'contact' } }, limit: 1, depth: 0, overrideAccess: true, select: { pageSlug: true } })
  return (
    <>
      <div className="pd-head"><div className="grow"><h1>Site Settings</h1><p className="pd-sub">Practice details and options that apply to the whole website.</p></div></div>
      <SettingsForm isAdmin={isAdmin} contactPageHref={contact.docs[0] ? `/admin/pages/${contact.docs[0].id}` : '/admin/pages'} initial={{
        practiceName: str(m.practiceName), phone: str(m.phone), email: str(m.email),
        address: { street: str(m.address?.street), suburb: str(m.address?.suburb), state: str(m.address?.state), postcode: str(m.address?.postcode) },
        bookingUrl: str(m.bookingUrl), mapUrl: str(m.mapUrl), directionsUrl: str(m.directionsUrl), mapEmbed: str(m.mapEmbed),
        socials: { facebook: str(m.socials?.facebook), instagram: str(m.socials?.instagram), twitter: str(m.socials?.twitter) },
        enquiryRecipients: isAdmin
          ? ((g.enquiryRecipients as { address?: string }[] | undefined)?.map((r) => str(r.address)).filter(Boolean) ?? [])
          : [],
        tracking: isAdmin ? { ga4: str(g.tracking?.ga4), metaPixel: str(g.tracking?.metaPixel) } : { ga4: '', metaPixel: '' },
        seo: {
          defaultTitle: str(seo.defaultTitle), defaultDescription: str(seo.defaultDescription),
          defaultOgImage: mediaUrl(seo.defaultOgImage) ?? '',
          defaultOgImageMedia: seo.defaultOgImage && typeof seo.defaultOgImage === 'object' ? seo.defaultOgImage.id : seo.defaultOgImage ?? null,
          noindexSite: !!seo.noindexSite,
        },
      }} />
    </>
  )
}
