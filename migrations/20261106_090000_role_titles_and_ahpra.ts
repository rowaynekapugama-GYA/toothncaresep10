import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { RELEASE_2_5_0 } from '../src/sitekit/data/release-2-5-0'

/**
 * v2.5.0 (6 November 2026): role titles and AHPRA details now come from
 * src/team.config.ts. The pages hold placeholders such as {{site:zoeRole}}
 * instead of the typed title, and an AHPRA placeholder sits on every team card
 * and profile (it shows nothing until a number is filled in). The visible
 * wording does not change, except that the "[VERIFY reg. no.]" markers on the
 * three profile pages are gone.
 *
 * The live site is built from the dashboard, so the same change is made there:
 * each spot is changed only where it still holds exactly the old wording. A
 * spot someone has reworded in the dashboard is left as it is and named in the
 * build log, so it can be pointed at the placeholder by hand.
 *
 * On an empty database nothing matches, so it does nothing.
 */
type Row = Record<string, unknown>
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

type Db = MigrateUpArgs['db']

async function setField(db: Db, page: string, section: string, field: string, from: string, to: string) {
  const r = await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}
      AND c."text" = ${from}`)
  return countOf(r)
}

async function fieldExists(db: Db, page: string, section: string, field: string) {
  const r = await db.execute(sql`
    SELECT 1 FROM "pages_sections_content" AS c
    JOIN "pages_sections" AS s ON c."_parent_id" = s."id"
    JOIN "pages" AS p ON s."_parent_id" = p."id"
    WHERE p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}`)
  return rowsOf(r).length > 0
}

async function setMeta(db: Db, page: string, column: string, from: string, to: string) {
  let r: unknown
  switch (column) {
    case 'meta_title':
      r = await db.execute(sql`UPDATE "pages" SET "meta_title" = ${to} WHERE "page_slug" = ${page} AND "meta_title" = ${from}`)
      break
    case 'meta_description':
      r = await db.execute(sql`UPDATE "pages" SET "meta_description" = ${to} WHERE "page_slug" = ${page} AND "meta_description" = ${from}`)
      break
    case 'meta_og_title':
      r = await db.execute(sql`UPDATE "pages" SET "meta_og_title" = ${to} WHERE "page_slug" = ${page} AND "meta_og_title" = ${from}`)
      break
    case 'meta_og_description':
      r = await db.execute(sql`UPDATE "pages" SET "meta_og_description" = ${to} WHERE "page_slug" = ${page} AND "meta_og_description" = ${from}`)
      break
    default:
      throw new Error(`unknown column ${column}`)
  }
  return countOf(r)
}

async function setJsonLd(db: Db, page: string, from: string, to: string) {
  let changed = 0
  for (const row of rowsOf(await db.execute(sql`SELECT "id", "json_ld" FROM "pages" WHERE "page_slug" = ${page}`))) {
    let blocks: unknown
    try { blocks = JSON.parse(String(row.json_ld ?? '[]')) } catch { continue }
    if (!Array.isArray(blocks)) continue
    const i = blocks.findIndex((b) => b === from)
    if (i < 0) continue
    blocks[i] = to
    await db.execute(sql`UPDATE "pages" SET "json_ld" = ${JSON.stringify(blocks)} WHERE "id" = ${row.id}`)
    changed++
  }
  return changed
}

async function pageExists(db: Db, page: string) {
  return rowsOf(await db.execute(sql`SELECT 1 FROM "pages" WHERE "page_slug" = ${page}`)).length > 0
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  let changed = 0
  const leftAlone: string[] = []

  for (const [page, section, field, from, to] of RELEASE_2_5_0.fields) {
    const n = await setField(db, page, section, field, from, to)
    changed += n
    if (!n && (await fieldExists(db, page, section, field))) leftAlone.push(`${page} / ${section} / ${field}`)
  }
  for (const [page, column, from, to] of RELEASE_2_5_0.meta) {
    const n = await setMeta(db, page, column, from, to)
    changed += n
    if (!n && (await pageExists(db, page))) leftAlone.push(`${page} / ${column}`)
  }
  for (const [page, , from, to] of RELEASE_2_5_0.jsonLd) {
    const n = await setJsonLd(db, page, from, to)
    changed += n
    if (!n && (await pageExists(db, page))) leftAlone.push(`${page} / structured data`)
  }

  payload.logger.info(`v2.5.0: ${changed} spots in the dashboard now take their role title or AHPRA details from src/team.config.ts.`)
  if (leftAlone.length) {
    payload.logger.warn(
      `v2.5.0: changed in the dashboard, so left as they are (point them at the placeholders by hand if wanted): ${leftAlone.join('; ')}`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [page, section, field, from, to] of RELEASE_2_5_0.fields) await setField(db, page, section, field, to, from)
  for (const [page, column, from, to] of RELEASE_2_5_0.meta) await setMeta(db, page, column, to, from)
  for (const [page, , from, to] of RELEASE_2_5_0.jsonLd) await setJsonLd(db, page, to, from)
}
