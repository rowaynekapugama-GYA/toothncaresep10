/**
 * The bridge between the JSON the website builds from and the documents the
 * dashboard edits. Everything here has to be reversible: seeding the database
 * from the JSON and pulling it back out again must produce the same bytes.
 */

import type { Field, Part, Page } from '@/lib/parts'

export type MediaLike = { id?: string | number; url?: string | null; filename?: string | null }

export type SectionDoc = {
  key: string
  kind: string
  label: string
  tag: string
  attrs: string
  template: string
  hidden?: boolean | null
  content: FieldDoc[]
}

export type FieldDoc = {
  fieldId: string
  kind: string
  label: string
  text?: string | null
  link?: string | null
  image?: MediaLike | string | number | null
  builtIn?: string | null
  w?: string | null
  h?: string | null
}

export type PageDoc = {
  title: string
  pageSlug: string
  path: string
  isChrome?: boolean | null
  sortOrder?: number | null
  sections: SectionDoc[]
  order: string
  jsonLd: string
  bodyScripts: string
  headScripts: string
  chromeOverrides: string
  meta?: Record<string, unknown> | null
}

/** Media URLs are stored root relative so the built pages never hard code a host. */
export function mediaUrl(value: MediaLike | string | number | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return null
  const url = value.url
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return url.startsWith('/') ? url : `/${url}`
}

// ---------------------------------------------------------------- to the DB

function fieldToDoc(field: Field): FieldDoc {
  const doc: FieldDoc = { fieldId: field.id, kind: field.type, label: field.label }
  if (field.type === 'image') {
    doc.builtIn = field.value ?? ''
    if (field.width) doc.w = field.width
    if (field.height) doc.h = field.height
  }
  else if (field.type === 'href') doc.link = field.value ?? ''
  else doc.text = field.value ?? ''
  return doc
}

export function partToSectionDoc(part: Part): SectionDoc {
  return {
    key: part.key,
    kind: part.kind,
    label: part.label,
    tag: part.tag,
    attrs: JSON.stringify(part.attrs),
    template: part.template,
    hidden: false,
    content: part.fields.map(fieldToDoc),
  }
}

export function pageToDoc(page: Page, extra?: { title?: string; isChrome?: boolean; sortOrder?: number }): PageDoc {
  return {
    title: extra?.title ?? page.name ?? page.meta?.title ?? page.slug,
    pageSlug: page.slug,
    path: page.path,
    isChrome: extra?.isChrome ?? false,
    sortOrder: extra?.sortOrder ?? 0,
    sections: page.sections.map(partToSectionDoc),
    order: JSON.stringify(page.order),
    jsonLd: JSON.stringify(page.jsonLd),
    bodyScripts: JSON.stringify(page.bodyScripts),
    headScripts: JSON.stringify(page.headScripts),
    chromeOverrides: JSON.stringify(page.chromeOverrides ?? {}),
    meta: {
      title: page.meta?.title ?? '',
      description: page.meta?.description ?? '',
      canonical: page.meta?.canonical ?? '',
      ogTitle: page.meta?.ogTitle ?? '',
      ogDescription: page.meta?.ogDescription ?? '',
      ogImagePath: page.meta?.ogImage ?? '',
      ogType: page.meta?.ogType ?? '',
      robots: page.meta?.robots ?? '',
      noindex: (page.meta?.robots ?? '').includes('noindex'),
    },
  }
}

// -------------------------------------------------------------- back out again

function docToField(doc: FieldDoc): Field {
  const type = doc.kind as Field['type']
  let value: string
  if (type === 'image') value = mediaUrl(doc.image) ?? doc.builtIn ?? ''
  else if (type === 'href') value = doc.link ?? ''
  else value = doc.text ?? ''
  const out: Field = { id: doc.fieldId, label: doc.label, type, value }
  if (type === 'image') {
    if (doc.w) out.width = doc.w
    if (doc.h) out.height = doc.h
  }
  return out
}

export function sectionDocToPart(doc: SectionDoc): Part {
  let attrs: Record<string, string | null> = {}
  try {
    attrs = JSON.parse(doc.attrs || '{}') as Record<string, string | null>
  } catch {
    attrs = {}
  }
  return {
    key: doc.key,
    kind: doc.kind,
    label: doc.label,
    tag: doc.tag,
    attrs,
    template: doc.template,
    fields: (doc.content ?? []).map(docToField),
  }
}

function parse<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export function docToPage(doc: PageDoc): Page {
  const meta = (doc.meta ?? {}) as Record<string, unknown>
  const ogImage =
    mediaUrl(meta.ogImage as MediaLike) ?? ((meta.ogImagePath as string) || undefined)

  const out: Page = {
    slug: doc.pageSlug,
    name: doc.title,
    path: doc.path,
    meta: {},
    jsonLd: parse<string[]>(doc.jsonLd, []),
    order: parse<string[]>(doc.order, []),
    sections: (doc.sections ?? []).map(sectionDocToPart),
    bodyScripts: parse<Page['bodyScripts']>(doc.bodyScripts, []),
    headScripts: parse<Page['headScripts']>(doc.headScripts, []),
  }

  // only write the keys the original had, so a pull matches the source byte for byte
  const m: Record<string, string> = {}
  const put = (key: string, value: unknown) => {
    if (typeof value === 'string' && value !== '') m[key] = value
  }
  put('title', meta.title)
  put('canonical', meta.canonical)
  put('ogTitle', meta.ogTitle)
  put('ogDescription', meta.ogDescription)
  put('ogType', meta.ogType)
  put('ogImage', ogImage)
  put('description', meta.description)
  put('robots', meta.noindex ? 'noindex, nofollow' : (meta.robots as string))
  out.meta = m

  const overrides = parse<Record<string, Record<string, string>>>(doc.chromeOverrides, {})
  if (Object.keys(overrides).length > 0) out.chromeOverrides = overrides

  // sections the editor has hidden are dropped from the built site
  const keep = new Set<number>()
  ;(doc.sections ?? []).forEach((s, i) => {
    if (!s.hidden) keep.add(i)
  })
  if (keep.size !== (doc.sections ?? []).length) {
    const remap = new Map<number, number>()
    let next = 0
    ;(doc.sections ?? []).forEach((_, i) => {
      if (keep.has(i)) remap.set(i, next++)
    })
    out.sections = out.sections.filter((_, i) => keep.has(i))
    out.order = out.order
      .map((step) => {
        if (!step.startsWith('section:')) return step
        const i = Number(step.slice(8))
        return remap.has(i) ? `section:${remap.get(i)}` : null
      })
      .filter((s): s is string => s !== null)
  }

  return out
}

/** The key order the page JSON files are written with. */
export function orderedPage(page: Page): Record<string, unknown> {
  return {
    slug: page.slug,
    name: page.name,
    path: page.path,
    meta: page.meta,
    jsonLd: page.jsonLd,
    sections: page.sections,
    bodyScripts: page.bodyScripts,
    headScripts: page.headScripts,
    order: page.order,
    ...(page.chromeOverrides ? { chromeOverrides: page.chromeOverrides } : {}),
  }
}
