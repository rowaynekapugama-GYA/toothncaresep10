import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { RELEASE_2_7_0 } from '../src/sitekit/data/release-2-7-0'
import { partToSectionDoc, sectionDocToPart, type SectionDoc } from '../src/sitekit/sync'
import type { Part } from '../src/lib/parts'

/**
 * v2.7.0 (Christine, 11 November 2026): Dr Rav joins the Our Team cards and the
 * homepage team slider, the support team section is added to Our Team under
 * Nish's headings, the Team list gets the support team, and the old Support
 * Team addresses land on that section. (The hygienist comes off the Our Team
 * intro through src/team.config.ts, so nothing in the dashboard changes for it.)
 *
 * The live site is built from the dashboard, so the same changes are made
 * there. A section is replaced only if it is still exactly as the site shipped
 * it; one changed in the dashboard is left alone and named in the build log.
 * The support team section is added only once, and only if the page's layout
 * is still the shipped one. Team list entries are added only if no one of that
 * name is listed yet. Redirects are changed only where they still go to /our-team.
 */
type Row = SectionDoc & { id?: string; content: (SectionDoc['content'][number] & { id?: string; image?: unknown })[] }
type PageDoc = { id: number | string; sections: Row[]; order: string }
type Payload = MigrateUpArgs['payload']
type Req = MigrateUpArgs['req']

const data = RELEASE_2_7_0 as unknown as {
  sections: { slug: string; key: string; old: Part; new: Part }[]
  insert: { slug: string; after: string; part: Part }
  team: Record<string, unknown>[]
  redirects: { from: string; old: string; new: string }[]
}

const imageId = (v: unknown) => (v && typeof v === 'object' ? (v as { id?: unknown }).id : v) ?? null
const plain = (p: Part) => JSON.stringify({ t: p.template, a: p.attrs, f: p.fields.map((f) => [f.id, f.type, f.value]) })
const asPart = (row: Row): Part => sectionDocToPart({ ...row, content: row.content.map((c) => ({ ...c, image: null })) })
const forSave = (rows: Row[]) => rows.map((s) => ({ ...s, content: s.content.map((c) => ({ ...c, image: imageId(c.image) })) }))
const parseOrder = (raw: unknown): string[] => {
  try { return Array.isArray(raw) ? (raw as string[]) : (JSON.parse(String(raw || '[]')) as string[]) } catch { return [] }
}

async function getPage(payload: Payload, req: Req, slug: string): Promise<PageDoc | undefined> {
  const found = await payload.find({ collection: 'pages', where: { pageSlug: { equals: slug } }, limit: 1, depth: 0, req, overrideAccess: true })
  return found.docs[0] as unknown as PageDoc | undefined
}

/** The page's sections are one unbroken run section:0 ... section:n-1 (as shipped). */
function singleRun(order: string[], n: number): { first: number; last: number } | null {
  const idx = order.map((s, i) => (s.startsWith('section:') ? i : -1)).filter((i) => i >= 0)
  if (idx.length !== n || !idx.length) return null
  const first = idx[0]
  const last = idx[idx.length - 1]
  if (last - first + 1 !== n) return null
  for (let k = 0; k < n; k++) if (order[first + k] !== `section:${k}`) return null
  return { first, last }
}

async function swapSections(payload: Payload, req: Req, from: 'old' | 'new', to: 'old' | 'new', skipped: string[]) {
  for (const change of data.sections) {
    const doc = await getPage(payload, req, change.slug)
    if (!doc) continue
    const rows = doc.sections.map((s) => ({ ...s }))
    const i = rows.findIndex((s) => s.key === change.key)
    if (i < 0) continue
    const row = rows[i]
    const photosChosen = row.content.some((c) => imageId(c.image) !== null)
    if (photosChosen || plain(asPart(row)) !== plain(change[from])) {
      if (plain(asPart(row)) !== plain(change[to])) skipped.push(`${change.slug} / ${row.label || change.key}`)
      continue
    }
    rows[i] = { ...partToSectionDoc(change[to]), id: row.id, hidden: row.hidden } as Row
    await payload.update({ collection: 'pages', id: doc.id, data: { sections: forSave(rows) } as never, depth: 0, req, overrideAccess: true })
  }
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const skipped: string[] = []
  await swapSections(payload, req, 'old', 'new', skipped)

  // the support team section, once, straight after the team cards
  const ins = data.insert
  const doc = await getPage(payload, req, ins.slug)
  if (doc && !doc.sections.some((s) => s.key === ins.part.key)) {
    const order = parseOrder(doc.order)
    const run = singleRun(order, doc.sections.length)
    if (!run) {
      skipped.push(`${ins.slug} / support team section not added (the page layout was changed in the dashboard)`)
    } else {
      const rows = doc.sections.map((s) => ({ ...s }))
      const at = rows.findIndex((s) => s.key === ins.after)
      rows.splice(at < 0 ? rows.length : at + 1, 0, { ...partToSectionDoc(ins.part), hidden: false } as Row)
      const next = [...order.slice(0, run.first), ...rows.map((_, k) => `section:${k}`), ...order.slice(run.last + 1)]
      await payload.update({ collection: 'pages', id: doc.id, data: { sections: forSave(rows), order: JSON.stringify(next) } as never, depth: 0, req, overrideAccess: true })
    }
  }

  // the Team list: Dr Rav and the support team, unless already listed by name
  let added = 0
  for (const m of data.team) {
    const found = await payload.find({ collection: 'team', where: { name: { equals: m.name as string } }, limit: 1, depth: 0, req, overrideAccess: true })
    if (found.docs[0]) { skipped.push(`Team list / ${m.name} (already listed; check their group on the Team screen)`); continue }
    await payload.create({ collection: 'team', data: { ...m, hidden: false } as never, depth: 0, req, overrideAccess: true })
    added++
  }

  for (const r of data.redirects) {
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: r.from } }, limit: 1, depth: 0, req, overrideAccess: true })
    const doc = found.docs[0] as unknown as { id: number | string; to: string } | undefined
    if (doc && doc.to === r.old) await payload.update({ collection: 'redirects', id: doc.id, data: { to: r.new } as never, req, overrideAccess: true })
  }

  payload.logger.info(`v2.7.0: Dr Rav and the support team added in the dashboard (${added} Team list entries).`)
  if (skipped.length) payload.logger.warn(`v2.7.0: changed in the dashboard, so left as it is: ${skipped.join('; ')}`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const skipped: string[] = []
  await swapSections(payload, req, 'new', 'old', skipped)

  const ins = data.insert
  const doc = await getPage(payload, req, ins.slug)
  if (doc && doc.sections.some((s) => s.key === ins.part.key)) {
    const order = parseOrder(doc.order)
    const run = singleRun(order, doc.sections.length)
    const rows = doc.sections.filter((s) => s.key !== ins.part.key)
    const next = run ? [...order.slice(0, run.first), ...rows.map((_, k) => `section:${k}`), ...order.slice(run.last + 1)] : order
    await payload.update({ collection: 'pages', id: doc.id, data: { sections: forSave(rows), order: JSON.stringify(next) } as never, depth: 0, req, overrideAccess: true })
  }

  // only the entries this migration added: same name and the order number it gave them
  for (const m of data.team) {
    await payload.delete({
      collection: 'team',
      where: { and: [{ name: { equals: m.name as string } }, { sortOrder: { equals: m.sortOrder as number } }] },
      req,
      overrideAccess: true,
    })
  }

  for (const r of data.redirects) {
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: r.from } }, limit: 1, depth: 0, req, overrideAccess: true })
    const d = found.docs[0] as unknown as { id: number | string; to: string } | undefined
    if (d && d.to === r.new) await payload.update({ collection: 'redirects', id: d.id, data: { to: r.old } as never, req, overrideAccess: true })
  }
}
