import fs from 'node:fs'
import path from 'node:path'
import { DEFAULTS } from '@/site.config'
import { hasBlog } from '@/lib/blog'
import { teamTokens } from '@/team.config'
import { supportTeamTokens, type SupportMember } from '@/lib/supportTeam'

export type SiteSettings = typeof DEFAULTS & Record<string, unknown>

let cache: SiteSettings | null = null

/** The client defaults with whatever the dashboard saved on top. One level merge, arrays replaced wholesale. */
export function mergeSettings(saved: Record<string, unknown>): SiteSettings {
  const merged: Record<string, unknown> = { ...DEFAULTS }
  for (const [k, v] of Object.entries(saved)) {
    if (v === null || v === undefined || v === '') continue
    const base = (DEFAULTS as Record<string, unknown>)[k]
    merged[k] =
      base && typeof base === 'object' && !Array.isArray(base) && typeof v === 'object' && !Array.isArray(v)
        ? { ...(base as object), ...(v as object) }
        : v
  }
  return merged as SiteSettings
}

/**
 * Site Settings as the build sees them: the client defaults with whatever the
 * dashboard has written to content/site-settings.json on top.
 */
export function getSettings(): SiteSettings {
  if (cache) return cache
  const file = path.join(process.cwd(), 'content', 'site-settings.json')
  let saved: Record<string, unknown> = {}
  if (fs.existsSync(file)) {
    try {
      saved = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>
    } catch {
      saved = {}
    }
  }
  cache = mergeSettings(saved)
  return cache
}

const digits = (s: string) => s.replace(/[^0-9]/g, '')

/** The values that {{site:...}} tokens in the content resolve to. */
export function siteTokens(): Record<string, string> {
  return tokensFor(getSettings(), getTeam())
}

let teamCache: SupportMember[] | null = null

/** The Team list as the build sees it: content/team.json, written from the dashboard. */
export function getTeam(): SupportMember[] {
  if (teamCache) return teamCache
  const file = path.join(process.cwd(), 'content', 'team.json')
  try {
    teamCache = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as SupportMember[]) : []
  } catch {
    teamCache = []
  }
  return teamCache
}

/** The token values for a given set of settings (the dashboard preview passes its own). */
export function tokensFor(s: SiteSettings, team: SupportMember[] = []): Record<string, string> {
  const a = s.address
  const mapQuery = encodeURIComponent(`${a.street}, ${a.suburb} ${a.state} ${a.postcode}`)
  return {
    practiceName: s.practiceName,
    phone: s.phone,
    phoneHref: s.phoneHref || `tel:${digits(s.phone)}`,
    phoneE164: `+61${digits(s.phone).replace(/^0/, '')}`,
    email: s.email,
    emailHref: `mailto:${s.email}`,
    street: a.street,
    cityLine: `${a.suburb} ${a.state} ${a.postcode}`,
    suburb: a.suburb,
    state: a.state,
    postcode: a.postcode,
    bookingUrl: s.bookingUrl,
    mapEmbed: s.mapEmbed || `https://www.google.com/maps?q=${mapQuery}&output=embed`,
    mapUrl: s.mapUrl || `https://www.google.com/maps?q=${mapQuery}`,
    directionsUrl: s.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`,
    facebook: s.socials.facebook,
    instagram: s.socials.instagram,
    twitter: s.socials.twitter,
    logo: s.logo,
    blogLink: hasBlog() ? '<li><a href="/blog">Blog</a></li>' : '',
    // role titles and AHPRA details, from src/team.config.ts
    ...teamTokens(),
    // the support team on Our Team, from the dashboard's Team list
    ...supportTeamTokens(team),
  }
}

export { applyTokens } from '@/lib/tokens'
