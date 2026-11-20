import fs from 'node:fs'
import path from 'node:path'
import type { Chrome, Page, Redirect } from '@/lib/parts'
import { hiddenPageSlugs, PRACTITIONERS, RAV_PROFILE } from '@/team.config'

export * from '@/lib/parts'

const ROOT = path.join(process.cwd(), 'content')

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) as T
}

/** Every page file, including any kept off the website for now (see isHiddenPage). */
export function allPageFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, 'pages'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .sort()
}

/** A page kept off the website until its switch in src/team.config.ts is on (Dr Rav's profile, v2.9.1). */
export function isHiddenPage(slug: string): boolean {
  return hiddenPageSlugs().includes(slug)
}

/**
 * Stops the build if a profile page is switched on before it has its bio, so a
 * half-empty page can never go on the website.
 */
function checkProfilePages(): void {
  if (!(PRACTITIONERS.rav as { profilePage?: boolean }).profilePage) return
  const page = getPage(RAV_PROFILE.slug)
  const bio = page?.sections.find((s) => s.key === RAV_PROFILE.bioSection)?.fields.find((f) => f.id === RAV_PROFILE.bioField)?.value ?? ''
  if (!page || !String(bio).replace(/<[^>]+>/g, '').trim()) {
    throw new Error(
      `src/team.config.ts: PRACTITIONERS.rav.profilePage is true, but Dr Rav's profile page has no bio yet `
        + `(content/pages/${RAV_PROFILE.slug}.json, section ${RAV_PROFILE.bioSection}, ${RAV_PROFILE.bioField}). `
        + 'Fill in the bio first, or set profilePage back to false.',
    )
  }
}

/** The pages on the website. */
export function allSlugs(): string[] {
  checkProfilePages()
  return allPageFiles().filter((s) => !isHiddenPage(s))
}

export function getPage(slug: string): Page | null {
  const file = path.join(ROOT, 'pages', `${slug}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Page
}

let chromeCache: Chrome | null = null
export function getChrome(): Chrome {
  if (!chromeCache) chromeCache = readJson<Chrome>('site-chrome.json')
  return chromeCache
}

export function getRedirects(): Redirect[] {
  return readJson<Redirect[]>('redirects.json')
}
