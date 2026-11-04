'use client'
/**
 * Practice details and the options that apply to the whole website. Only the
 * settings the website actually uses are shown here, so nothing changed on this
 * screen is silently ignored.
 */
import React, { useState } from 'react'
import { api } from '../lib/client'
import { Notice, TextArea, TextInput, Toggle, useUnsavedWarning } from '../ui/fields'
import { ImageSlot } from '../ui/MediaPicker'
import { PublishButton } from '../ui/PublishButton'
import { useToast } from '../ui/Toast'
import { Icon } from '../ui/icons'

export type SettingsState = {
  practiceName: string
  phone: string
  email: string
  address: { street: string; suburb: string; state: string; postcode: string }
  bookingUrl: string
  mapUrl: string
  directionsUrl: string
  mapEmbed: string
  socials: { facebook: string; instagram: string; twitter: string }
  enquiryRecipients: string[]
  tracking: { ga4: string; metaPixel: string }
  seo: { defaultTitle: string; defaultDescription: string; defaultOgImage: string; defaultOgImageMedia: number | string | null; noindexSite: boolean }
}

function Panel({ id, title, intro, children }: { id: string; title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="panel" id={id}>
      <h2>{title}</h2>
      {intro ? <p className="help" style={{ marginTop: -6, marginBottom: 14 }}>{intro}</p> : null}
      {children}
    </section>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SettingsForm({ initial, isAdmin, contactPageHref }: { initial: SettingsState; isAdmin: boolean; contactPageHref: string }) {
  const toast = useToast()
  const [s, setS] = useState<SettingsState>(initial)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  useUnsavedWarning(dirty)
  const set = (patch: Partial<SettingsState>) => { setS((x) => ({ ...x, ...patch })); setDirty(true) }
  const setA = (patch: Partial<SettingsState['address']>) => set({ address: { ...s.address, ...patch } })
  const setSoc = (patch: Partial<SettingsState['socials']>) => set({ socials: { ...s.socials, ...patch } })
  const setT = (patch: Partial<SettingsState['tracking']>) => set({ tracking: { ...s.tracking, ...patch } })
  const setSeo = (patch: Partial<SettingsState['seo']>) => set({ seo: { ...s.seo, ...patch } })

  async function save() {
    if (!s.practiceName.trim()) { toast('Please fill in the practice name.', 'bad'); return }
    if (!s.phone.trim()) { toast('Please fill in the phone number.', 'bad'); return }
    if (s.email && !EMAIL.test(s.email.trim())) { toast('The email address does not look right.', 'bad'); return }
    const bad = s.enquiryRecipients.filter((e) => e.trim() && !EMAIL.test(e.trim()))
    if (bad.length) { toast(`This enquiry address does not look right: ${bad[0]}`, 'bad'); return }
    setBusy(true)
    try {
      const settings: Record<string, unknown> = {
        practiceName: s.practiceName.trim(),
        phone: s.phone.trim(),
        email: s.email.trim(),
        address: s.address,
        bookingUrl: s.bookingUrl.trim(),
        mapUrl: s.mapUrl.trim(),
        directionsUrl: s.directionsUrl.trim(),
        socials: s.socials,
      }
      if (isAdmin) {
        settings.mapEmbed = s.mapEmbed.trim()
        settings.enquiryRecipients = s.enquiryRecipients.map((a) => a.trim()).filter(Boolean).map((address) => ({ address }))
        settings.tracking = { ga4: s.tracking.ga4.trim(), metaPixel: s.tracking.metaPixel.trim() }
      }
      await api('/api/globals/site-settings?depth=0', { method: 'POST', body: settings })
      await api('/api/globals/seo?depth=0', {
        method: 'POST',
        body: {
          defaultTitle: s.seo.defaultTitle, defaultDescription: s.seo.defaultDescription,
          defaultOgImage: s.seo.defaultOgImageMedia ?? null,
          ...(isAdmin ? { noindexSite: s.seo.noindexSite } : {}),
        },
      })
      setDirty(false)
      toast('Settings saved. Press Publish website to put them live.', 'good')
    } catch (e) {
      toast((e as Error).message, 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cols">
      <div>
        <Panel id="practice" title="Practice details" intro="Used everywhere these details appear: the header and footer, the contact page, the call buttons, the map and the information Google reads. Change them once here.">
          <TextInput label="Practice name" value={s.practiceName} onChange={(v) => set({ practiceName: v })} />
          <div className="grid-2">
            <TextInput label="Phone number" value={s.phone} onChange={(v) => set({ phone: v })} help="Written the way it should appear, for example 02 4933 4667." />
            <TextInput label="Email address" type="email" value={s.email} onChange={(v) => set({ email: v })} />
          </div>
          <TextInput label="Street address" value={s.address.street} onChange={(v) => setA({ street: v })} />
          <div className="grid-3">
            <TextInput label="Suburb" value={s.address.suburb} onChange={(v) => setA({ suburb: v })} />
            <TextInput label="State" value={s.address.state} onChange={(v) => setA({ state: v })} />
            <TextInput label="Postcode" value={s.address.postcode} onChange={(v) => setA({ postcode: v })} />
          </div>
          <TextInput label="Online booking link" value={s.bookingUrl} onChange={(v) => set({ bookingUrl: v })} help="Every Book Online button on the website goes here." />
          <TextInput label="Google Maps link" value={s.mapUrl} onChange={(v) => set({ mapUrl: v })} />
          <TextInput label="Directions link" value={s.directionsUrl} onChange={(v) => set({ directionsUrl: v })} />
          {isAdmin ? <TextInput label="Map shown on the pages (GYA only)" value={s.mapEmbed} onChange={(v) => set({ mapEmbed: v })} help="The Google Maps embed address. Leave it alone unless the practice moves." /> : null}
        </Panel>

        <Panel id="hours" title="Opening hours">
          <Notice tone="info" icon={Icon.info()}>
            <p>Opening hours are written in the footer of every page and on the <a href={contactPageHref}>Contact page</a>. Open any page, click the hours in the footer and type the new ones: the footer is the same on every page, so one change updates all of them. Then change them on the Contact page the same way.</p>
          </Notice>
        </Panel>

        <Panel id="social" title="Social links" intro="The icons in the footer link to these.">
          <TextInput label="Facebook" value={s.socials.facebook} onChange={(v) => setSoc({ facebook: v })} />
          <TextInput label="Instagram" value={s.socials.instagram} onChange={(v) => setSoc({ instagram: v })} />
          <TextInput label="X (Twitter)" value={s.socials.twitter} onChange={(v) => setSoc({ twitter: v })} />
        </Panel>

        <Panel id="seo" title="Search engine defaults" intro="Used by any page or post that does not set its own. Each page's own title and description are on its SEO tab.">
          <TextInput label="Default title" value={s.seo.defaultTitle} onChange={(v) => setSeo({ defaultTitle: v })} />
          <TextArea label="Default description" value={s.seo.defaultDescription} onChange={(v) => setSeo({ defaultDescription: v })} />
          <ImageSlot label="Default share image" value={s.seo.defaultOgImage} original={initial.seo.defaultOgImage || undefined}
            onChange={(v) => setSeo({ defaultOgImage: v.media ? v.value : initial.seo.defaultOgImage, defaultOgImageMedia: v.media })} />
          {isAdmin ? (
            <Toggle label="Hide the whole website from Google (GYA only)" checked={s.seo.noindexSite} onChange={(v) => setSeo({ noindexSite: v })}
              help="Only before go live. Every page is marked noindex and robots.txt asks search engines to stay away." />
          ) : null}
        </Panel>

        {isAdmin ? (
          <>
            <Panel id="enquiries" title="Who receives enquiries (GYA only)" intro="Every message sent through the website is emailed to all of these and kept under Enquiries. If the list is empty, the addresses built into the website are used.">
              {s.enquiryRecipients.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="input" aria-label={`Recipient ${i + 1}`} value={r}
                    onChange={(e) => set({ enquiryRecipients: s.enquiryRecipients.map((x, n) => (n === i ? e.target.value : x)) })} />
                  <button className="btn small danger" onClick={() => set({ enquiryRecipients: s.enquiryRecipients.filter((_x, n) => n !== i) })}>{Icon.trash()} Remove</button>
                </div>
              ))}
              <button className="btn small" onClick={() => set({ enquiryRecipients: [...s.enquiryRecipients, ''] })}>{Icon.plus()} Add an address</button>
            </Panel>
            <Panel id="tracking" title="Tracking (GYA only)" intro="Leave empty to switch tracking off. Nothing runs on preview deployments.">
              <div className="grid-2">
                <TextInput label="Google Analytics 4 measurement ID" value={s.tracking.ga4} onChange={(v) => setT({ ga4: v })} placeholder="G-XXXXXXXXXX" />
                <TextInput label="Meta Pixel ID" value={s.tracking.metaPixel} onChange={(v) => setT({ metaPixel: v })} />
              </div>
            </Panel>
          </>
        ) : null}
      </div>

      <div className="sticky">
        <div className="panel">
          <h2 style={{ marginBottom: 8 }}>Save</h2>
          <p className={dirty ? '' : 'help'} style={{ color: dirty ? 'var(--pd-warn)' : undefined, fontWeight: dirty ? 600 : 400 }}>{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <div className="actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <button className="btn primary" disabled={!dirty || busy} onClick={save}>{busy ? 'Saving...' : 'Save settings'}</button>
            <PublishButton />
          </div>
          <p className="help" style={{ marginTop: 10 }}>Changes go live on the whole website the next time you press Publish website.</p>
        </div>
      </div>
    </div>
  )
}
