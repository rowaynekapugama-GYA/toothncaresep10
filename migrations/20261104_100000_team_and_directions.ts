import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { RELEASE_2_3_0 } from '../src/sitekit/data/release-2-3-0'
import { partToSectionDoc, sectionDocToPart, type SectionDoc } from '../src/sitekit/sync'
import type { Part } from '../src/lib/parts'

/**
 * v2.3.0, asked for by the practice on 4 November 2026: the dental assistant has left, so her
 * homepage slide, Our Team card, Support Team page and mentions on the suburb
 * pages come off; the directions say "near Your Discount Chemist and Australia
 * Post" with no hair salon; the Our Team intro counts the current team.
 *
 * The live site is built from the dashboard, so the same changes are made
 * there. A section is only replaced when it is still exactly what the site
 * shipped with. If someone has changed it in the dashboard, only the words
 * this release changes are updated, and only where they are still the old
 * words; anything else is left alone and listed in the build log.
 */
type Row = SectionDoc & { id?: string; content: (SectionDoc['content'][number] & { id?: string; image?: unknown })[] }
type PartJson = Part

const imageId = (v: unknown) => (v && typeof v === 'object' ? (v as { id?: unknown }).id : v) ?? null
const plain = (p: PartJson) => JSON.stringify({ t: p.template, a: p.attrs, f: p.fields.map((f) => [f.id, f.type, f.value]) })
const asPart = (row: Row): PartJson => sectionDocToPart({ ...row, content: row.content.map((c) => ({ ...c, image: null })) })

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const skipped: string[] = []
  const r = RELEASE_2_3_0 as unknown as {
    pages: { slug: string; sections: { key: string; old: PartJson; new: PartJson }[]; jsonLd?: { old: string[]; new: string[] }; bodyScripts?: { old: unknown[]; new: unknown[] } }[]
    deletePages: string[]
    redirects: { from: string; to: string; type: 'permanent' | 'temporary' }[]
    deleteTeamProfiles: string[]
  }

  for (const change of r.pages) {
    const found = await payload.find({ collection: 'pages', where: { pageSlug: { equals: change.slug } }, limit: 1, depth: 0, req, overrideAccess: true })
    const doc = found.docs[0] as unknown as { id: number; sections: Row[]; jsonLd: string; bodyScripts: string } | undefined
    if (!doc) continue
    const rows = doc.sections.map((s) => ({ ...s }))
    let dirty = false
    for (const sc of change.sections) {
      const i = rows.findIndex((s) => s.key === sc.key)
      if (i < 0) continue
      const row = rows[i]
      const photosChosen = row.content.some((c) => imageId(c.image) !== null)
      if (!photosChosen && plain(asPart(row)) === plain(sc.old)) {
        rows[i] = { ...partToSectionDoc(sc.new), id: row.id, hidden: row.hidden } as Row
        dirty = true
        continue
      }
      // edited in the dashboard: only words this release changes, and only where they are still the old words
      const oldById = new Map(sc.old.fields.map((f) => [f.id, f.value]))
      const newById = new Map(sc.new.fields.map((f) => [f.id, f.value]))
      const structural = sc.old.template !== sc.new.template
      let any = false
      row.content = row.content.map((c) => {
        const was = oldById.get(c.fieldId)
        const now = newById.get(c.fieldId)
        if (structural || was === undefined || now === undefined || was === now || c.kind === 'image') return { ...c, image: imageId(c.image) as never }
        const current = c.kind === 'href' ? c.link : c.text
        if (current !== was) return { ...c, image: imageId(c.image) as never }
        any = true
        return c.kind === 'href' ? { ...c, link: now, image: imageId(c.image) as never } : { ...c, text: now, image: imageId(c.image) as never }
      })
      if (structural) skipped.push(`${change.slug} / ${row.label || sc.key}: changed in the dashboard, left as it is`)
      if (any) dirty = true
    }
    const data: Record<string, unknown> = {}
    if (dirty) data.sections = rows.map((s) => ({ ...s, content: s.content.map((c) => ({ ...c, image: imageId(c.image) })) }))
    if (change.jsonLd) {
      let saved: unknown
      try { saved = JSON.parse(doc.jsonLd || '[]') } catch { saved = null }
      if (JSON.stringify(saved) === JSON.stringify(change.jsonLd.old)) data.jsonLd = JSON.stringify(change.jsonLd.new)
    }
    if (change.bodyScripts) {
      let saved: unknown
      try { saved = JSON.parse(doc.bodyScripts || '[]') } catch { saved = null }
      if (JSON.stringify(saved) === JSON.stringify(change.bodyScripts.old)) data.bodyScripts = JSON.stringify(change.bodyScripts.new)
    }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'pages', id: doc.id, data: data as never, depth: 0, req, overrideAccess: true })
    }
  }

  for (const slug of r.deletePages) {
    await payload.delete({ collection: 'pages', where: { pageSlug: { equals: slug } }, req, overrideAccess: true })
  }

  for (const red of r.redirects) {
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: red.from } }, limit: 1, depth: 0, req, overrideAccess: true })
    if (found.docs[0]) await payload.update({ collection: 'redirects', id: found.docs[0].id, data: { to: red.to, type: red.type } as never, req, overrideAccess: true })
    else await payload.create({ collection: 'redirects', data: red as never, req, overrideAccess: true })
  }

  for (const profileUrl of r.deleteTeamProfiles) {
    await payload.delete({ collection: 'team', where: { profileUrl: { equals: profileUrl } }, req, overrideAccess: true })
  }

  payload.logger.info(`v2.3.0 content changes applied to the dashboard.${skipped.length ? ' Left alone: ' + skipped.join('; ') : ''}`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content changes are not undone automatically. Reset to the repository's content from an older release instead.
}
