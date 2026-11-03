import { NextResponse } from 'next/server'
import { DEFAULTS } from '@/site.config'
import { getSettings, siteTokens } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SMTP2GO_ENDPOINT = 'https://api.smtp2go.com/v3/email/send'

/** Minimum seconds between the form rendering and being submitted. */
const MIN_FILL_SECONDS = 3

type Payload = {
  name?: string
  email?: string
  phone?: string
  preferredContact?: string
  /** The select on the form is named "preferred". */
  preferred?: string
  message?: string
  consent?: boolean
  sourcePage?: string
  /** Honeypot. Real people never see this field, so it must arrive empty. */
  website?: string
  /** Epoch milliseconds stamped when the form was rendered. */
  renderedAt?: number
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const clean = (v: unknown, max = 2000) =>
  typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : ''

const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )

/**
 * Site Settings first, then the environment, then the addresses compiled into
 * the site. A missing setting can never silently drop a lead.
 */
function recipients(): string[] {
  const fromSettings = (getSettings().enquiryRecipients as unknown as string[] | undefined) ?? []
  const clean = (list: string[]) => list.map((s) => String(s).trim()).filter(Boolean)
  const settings = clean(fromSettings)
  if (settings.length) return settings
  const fromEnv = clean((process.env.MAIL_TO || '').split(','))
  if (fromEnv.length) return fromEnv
  return [...DEFAULTS.enquiryRecipients]
}

export async function POST(req: Request) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not read that request.' }, { status: 400 })
  }

  // Spam checks. Both fail quietly with a success response so a bot learns nothing.
  if (clean(body.website)) return NextResponse.json({ ok: true })
  const elapsed = (Date.now() - Number(body.renderedAt || 0)) / 1000
  if (!body.renderedAt || elapsed < MIN_FILL_SECONDS) return NextResponse.json({ ok: true })

  const name = clean(body.name, 120)
  const email = clean(body.email, 160)
  const phone = clean(body.phone, 40)
  const message = clean(body.message, 4000)
  const preferredRaw = clean(body.preferredContact || body.preferred, 40).toLowerCase()
  const preferredContact = preferredRaw.startsWith('phone')
    ? 'phone'
    : preferredRaw.startsWith('email')
      ? 'email'
      : 'either'
  const sourcePage = clean(body.sourcePage, 200) || '/'

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Please tell us your name.'
  if (!email && !phone) errors.email = 'Please leave either an email address or a phone number.'
  if (email && !isEmail(email)) errors.email = 'That email address does not look right.'
  if (phone && phone.replace(/\D/g, '').length < 8) errors.phone = 'That phone number looks too short.'
  if (message.length < 5) errors.message = 'Please tell us a little about what you need.'
  if (!body.consent) errors.consent = 'Please tick the box so we know we can contact you.'

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  const apiKey = process.env.SMTP2GO_API_KEY
  const from = process.env.MAIL_FROM || 'website@toothncare.com.au'
  const to = recipients()

  const subject = `Website enquiry from ${name}`
  const lines = [
    `Name: ${name}`,
    `Email: ${email || 'not supplied'}`,
    `Phone: ${phone || 'not supplied'}`,
    `Preferred contact: ${preferredContact}`,
    `Sent from: ${sourcePage}`,
    '',
    message,
  ]
  const textBody = lines.join('\n')
  const htmlBody =
    `<p>${lines.slice(0, 5).map(escapeHtml).join('<br>')}</p>` +
    `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`

  let emailStatus: 'sent' | 'failed' = 'sent'
  let emailError = ''

  if (!apiKey) {
    emailStatus = 'failed'
    emailError = 'SMTP2GO_API_KEY is not set'
  } else {
    try {
      const res = await fetch(SMTP2GO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          sender: `${DEFAULTS.practiceName} Website <${from}>`,
          to,
          subject,
          text_body: textBody,
          html_body: htmlBody,
          custom_headers: email
            ? [{ header: 'Reply-To', value: `${name} <${email}>` }]
            : undefined,
        }),
      })
      const json = (await res.json()) as { data?: { succeeded?: number; error?: string } }
      if (!res.ok || !json?.data?.succeeded) {
        emailStatus = 'failed'
        emailError = json?.data?.error || `SMTP2GO responded ${res.status}`
      }
    } catch (err) {
      emailStatus = 'failed'
      emailError = err instanceof Error ? err.message : 'Network error'
    }
  }

  // Whatever happened above, record the enquiry, so a mail outage
  // never loses a lead. A database problem must not fail the request either.
  try {
    const { logEnquiry } = await import('@/lib/enquiries')
    await logEnquiry({
      name,
      email,
      phone,
      preferredContact,
      message,
      consent: true,
      sourcePage,
      emailStatus,
      emailError,
    })
  } catch (err) {
    // A database problem must never cost the practice a lead, so the send
    // result still goes back to the visitor. The reason is logged for GYA.
    console.error('enquiry could not be stored:', err instanceof Error ? err.message : err)
  }

  if (emailStatus === 'failed') {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Sorry, we could not send that just now. Please call us on '
          + `${siteTokens().phone} and we will help straight away.`,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
