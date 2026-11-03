import fs from 'node:fs'
import path from 'node:path'
import type { Chrome, Page, Redirect } from '@/lib/parts'

export * from '@/lib/parts'

const ROOT = path.join(process.cwd(), 'content')

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) as T
}

export function allSlugs(): string[] {
  return fs
    .readdirSync(path.join(ROOT, 'pages'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .sort()
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
