import fs from 'node:fs'
import path from 'node:path'

export type SeoDefaults = {
  defaultTitle?: string
  defaultDescription?: string
  defaultOgImage?: string | null
  noindexSite?: boolean
}

let cache: SeoDefaults | null = null

/** The search engine defaults saved in the dashboard (content/seo.json). */
export function getSeoDefaults(): SeoDefaults {
  if (cache) return cache
  const file = path.join(process.cwd(), 'content', 'seo.json')
  try {
    cache = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as SeoDefaults) : {}
  } catch {
    cache = {}
  }
  return cache
}
