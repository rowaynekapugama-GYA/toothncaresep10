import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { RELEASE_2_8_0 } from '../src/sitekit/data/release-2-8-0'

/**
 * v2.8.0 (Christine, 13 to 16 November 2026):
 *   - Dr Rav's name on the Our Team card and the homepage slider now comes from
 *     src/team.config.ts ({{site:ravName}}), so one setting there can show her
 *     full name. Her Team list entry gets her full name and AHPRA number.
 *   - Room for Dr Dimple after Dr Rav on Our Team and in the homepage slider
 *     ({{site:dimpleCard}}, {{site:dimpleSlide}}). Empty until DR_DIMPLE.show is
 *     true in src/team.config.ts, so nothing shows yet.
 *   - The Our Team intro counts the team from src/team.config.ts
 *     ({{site:teamIntroLead}}): "Three dentists, an oral health therapist" today.
 *   - Support team order: Kathryn moves up beside Holly, so the Patient
 *     Experience Coordinators come first, then Jorja and Ton, then the Clinical
 *     Care Coordinators.
 *   - The homepage team slider no longer points at photos on the old website,
 *     and the "[VERIFY] professional photo shoot" note under Our Clinic's
 *     photos goes, now the practice's own photos are in.
 *   - Redirects for the old site's suburb folders (/maitland/dental-implants.htm
 *     and so on).
 *
 * The live site is built from the dashboard, so the same changes are made
 * there, one piece at a time and only where it is still as the site shipped
 * it: a section's layout only if unchanged, each wording only if it still says
 * the old words, the order only if Jorja is still straight before Kathryn, a
 * redirect only if that old address has none yet. Anything already changed in
 * the dashboard is left alone and named in the build log.
 *
 * On an empty database nothing matches, so it does nothing.
 */
type Edit = {
  slug: string
  key: string
  template: { old: string; new: string } | null
  fields: [id: string, oldText: string, newText: string][]
}
const data = RELEASE_2_8_0 as unknown as {
  sections: Edit[]
  teamOrder: { before: string; after: string }
  rav: { oldName: string; newName: string; registration: string }
  redirects: { from: string; to: string; type: string }[]
}

type Db = MigrateUpArgs['db']
type Row = Record<string, unknown>
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function sectionExists(db: Db, slug: string, key: string) {
  return rowsOf(await db.execute(sql`
    SELECT s."id" FROM "pages_sections" AS s JOIN "pages" AS p ON s."_parent_id" = p."id"
    WHERE p."page_slug" = ${slug} AND s."key" = ${key}`)).length > 0
}

async function applyEdits(db: Db, back: boolean, skipped: string[]) {
  let changed = 0
  for (const e of data.sections) {
    if (!(await sectionExists(db, e.slug, e.key))) continue
    if (e.template) {
      const [from, to] = back ? [e.template.new, e.template.old] : [e.template.old, e.template.new]
      const r = await db.execute(sql`
        UPDATE "pages_sections" AS s SET "template" = ${to}
        FROM "pages" AS p
        WHERE s."_parent_id" = p."id" AND p."page_slug" = ${e.slug} AND s."key" = ${e.key} AND s."template" = ${from}`)
      if (countOf(r)) changed++
      else if (!back) skipped.push(`${e.slug} / ${e.key} layout`)
    }
    for (const [id, oldText, newText] of e.fields) {
      const [from, to] = back ? [newText, oldText] : [oldText, newText]
      const r = await db.execute(sql`
        UPDATE "pages_sections_content" AS c SET "text" = ${to}
        FROM "pages_sections" AS s, "pages" AS p
        WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
          AND p."page_slug" = ${e.slug} AND s."key" = ${e.key} AND c."field_id" = ${id} AND c."text" = ${from}`)
      if (countOf(r)) changed++
      else if (!back) {
        const now = rowsOf(await db.execute(sql`
          SELECT c."text" AS text FROM "pages_sections_content" AS c
          JOIN "pages_sections" AS s ON c."_parent_id" = s."id" JOIN "pages" AS p ON s."_parent_id" = p."id"
          WHERE p."page_slug" = ${e.slug} AND s."key" = ${e.key} AND c."field_id" = ${id}`))[0]
        if (now && now.text !== newText) skipped.push(`${e.slug} / ${e.key} / ${id} (says "${String(now.text).slice(0, 60)}")`)
      }
    }
  }
  return changed
}

async function member(db: Db, name: string) {
  return rowsOf(await db.execute(sql`SELECT "id", "sort_order" AS "sortOrder", "registration" FROM "team" WHERE "name" = ${name} LIMIT 1`))[0]
}

/** Jorja and Kathryn trade places, only from the order the site shipped with. */
async function swapOrder(db: Db, first: string, second: string) {
  const a = await member(db, first)
  const b = await member(db, second)
  if (!a || !b || Number(b.sortOrder) !== Number(a.sortOrder) + 1) return false
  await db.execute(sql`UPDATE "team" SET "sort_order" = ${Number(b.sortOrder)} WHERE "id" = ${a.id}`)
  await db.execute(sql`UPDATE "team" SET "sort_order" = ${Number(a.sortOrder)} WHERE "id" = ${b.id}`)
  return true
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const skipped: string[] = []
  const changed = await applyEdits(db, false, skipped)

  const { before, after } = data.teamOrder
  const moved = await swapOrder(db, before, after)
  if (!moved && (await member(db, before)) && (await member(db, after))) {
    const a = await member(db, before)
    const b = await member(db, after)
    if (Number(b!.sortOrder) > Number(a!.sortOrder)) skipped.push(`Team list order (${after} is not straight after ${before}; put ${after} after Holly on the Team screen)`)
  }

  const rav = await member(db, data.rav.oldName)
  if (rav && !String(rav.registration ?? '').trim() && !(await member(db, data.rav.newName))) {
    await db.execute(sql`UPDATE "team" SET "name" = ${data.rav.newName}, "registration" = ${data.rav.registration} WHERE "id" = ${rav.id}`)
  }

  let added = 0
  for (const r of data.redirects) {
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: r.from } }, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs[0]) continue
    await payload.create({ collection: 'redirects', data: r as never, depth: 0, overrideAccess: true })
    added++
  }

  payload.logger.info(`v2.8.0: ${changed} team wording and layout change${changed === 1 ? '' : 's'}, support team order ${moved ? 'updated' : 'unchanged'}, ${added} old suburb address redirect${added === 1 ? '' : 's'} added in the dashboard.`)
  if (skipped.length) payload.logger.warn(`v2.8.0: changed in the dashboard, so left as it is: ${skipped.join('; ')}`)
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await applyEdits(db, true, [])
  await swapOrder(db, data.teamOrder.after, data.teamOrder.before)
  const rav = await member(db, data.rav.newName)
  if (rav && rav.registration === data.rav.registration) {
    await db.execute(sql`UPDATE "team" SET "name" = ${data.rav.oldName}, "registration" = '' WHERE "id" = ${rav.id}`)
  }
  for (const r of data.redirects) {
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: r.from } }, limit: 1, depth: 0, overrideAccess: true })
    const doc = found.docs[0] as unknown as { id: number | string; to: string } | undefined
    if (doc && doc.to === r.to) await payload.delete({ collection: 'redirects', id: doc.id, overrideAccess: true })
  }
}
