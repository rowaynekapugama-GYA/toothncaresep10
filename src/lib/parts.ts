export type FieldType = 'richtext' | 'text' | 'href' | 'image' | 'alt'

export type Field = {
  id: string
  label: string
  type: FieldType
  value: string
  width?: string | null
  height?: string | null
}

export type Part = {
  key: string
  kind: string
  label: string
  tag: string
  attrs: Record<string, string | null>
  template: string
  fields: Field[]
}

export type PageMeta = {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  robots?: string
}

export type ScriptRef = { inline?: string; src?: string | null; type?: string | null }

export type Page = {
  slug: string
  name?: string
  path: string
  meta: PageMeta
  jsonLd: string[]
  order: string[]
  sections: Part[]
  bodyScripts: ScriptRef[]
  headScripts: ScriptRef[]
  chromeOverrides?: Record<string, Record<string, string>>
}

export type Chrome = { parts: Record<string, Part>; notes: unknown[] }

export type Redirect = { from: string; to: string; type: 'permanent' | 'temporary' }

/** Substitute the stored field values back into a part's template. */
export function renderPart(part: Part, overrides?: Record<string, string>): string {
  let out = part.template
  for (const f of part.fields) {
    const value = overrides?.[f.id] ?? f.value ?? ''
    out = out.split(`{{${f.id}}}`).join(value)
  }
  return out
}

/**
 * Optional wording (v2.9.1): an element marked data-hide-empty in a layout is
 * left out of the website while its words are empty, and loses the marker once
 * they are filled in. The dashboard keeps it, showing "Add words", so the
 * practice can fill it in. Used for Dr Rav's bio, which stays empty until she
 * supplies one.
 */
const OPTIONAL = /<(p|li|em|div)\b([^>]*\sdata-hide-empty(?:="")?[^>]*)>([\s\S]*?)<\/\1>/g
/** No words in it: icons (svg) and empty tags do not count. */
const noWords = (inner: string) => !inner.replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
export function dropEmptyOptional(html: string): string {
  if (!html.includes('data-hide-empty')) return html
  return html.replace(OPTIONAL, (whole, tag: string, attrs: string, inner: string) =>
    noWords(inner) ? '' : `<${tag}${attrs.replace(/\sdata-hide-empty(?:="")?/, '')}>${inner}</${tag}>`)
}

/** A part whose every image slot is empty is not rendered at all. */
export function isEmptySlot(part: Part): boolean {
  const images = part.fields.filter((f) => f.type === 'image')
  return images.length > 0 && images.every((f) => !f.value)
}
