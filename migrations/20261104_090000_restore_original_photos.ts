import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { PHOTO_FIX } from '../src/sitekit/data/photo-fix-2026-11-04'

/**
 * Puts the practice's own photos back (v2.2.0).
 *
 * The September port showed clinic photographs in place of the team portraits
 * and about 30 treatment photos. The repository now ships the real ones, but a
 * dashboard that has already been imported holds the old file names, and the
 * build writes the site from the dashboard. This changes only the photos the
 * site shipped with, and only where they are still the old ones: a photo
 * chosen in the dashboard, and every word, is left exactly as it is.
 *
 * On an empty database nothing matches, so it does nothing.
 */
type Row = Record<string, unknown>

const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  let changed = 0

  for (const [page, section, field, oldSrc, newSrc] of PHOTO_FIX.fields) {
    const r = await db.execute(sql`
      UPDATE "pages_sections_content" AS c SET "built_in" = ${newSrc}
      FROM "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
        AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}
        AND c."built_in" = ${oldSrc}`)
    changed += (r as { rowCount?: number }).rowCount ?? 0
  }

  for (const [page, oldSrc, newSrc] of PHOTO_FIX.og) {
    await db.execute(sql`UPDATE "pages" SET "meta_og_image_path" = ${newSrc}
      WHERE "page_slug" = ${page} AND "meta_og_image_path" = ${oldSrc}`)
  }

  for (const [page, oldLd, newLd] of PHOTO_FIX.jsonLd) {
    for (const row of rowsOf(await db.execute(sql`SELECT "id", "json_ld" FROM "pages" WHERE "page_slug" = ${page}`))) {
      let saved: unknown
      try { saved = JSON.parse(String(row.json_ld ?? '[]')) } catch { continue }
      if (!same(saved, oldLd)) continue
      await db.execute(sql`UPDATE "pages" SET "json_ld" = ${JSON.stringify(newLd)} WHERE "id" = ${row.id}`)
    }
  }

  for (const [page, index, oldJs, newJs] of PHOTO_FIX.scripts) {
    for (const row of rowsOf(await db.execute(sql`SELECT "id", "body_scripts" FROM "pages" WHERE "page_slug" = ${page}`))) {
      let saved: { inline?: string }[]
      try { saved = JSON.parse(String(row.body_scripts ?? '[]')) } catch { continue }
      if (saved[index]?.inline !== oldJs) continue
      saved[index] = { ...saved[index], inline: newJs }
      await db.execute(sql`UPDATE "pages" SET "body_scripts" = ${JSON.stringify(saved)} WHERE "id" = ${row.id}`)
    }
  }

  payload.logger.info(`Original photos restored on ${changed} photo spots in the dashboard.`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [page, section, field, oldSrc, newSrc] of PHOTO_FIX.fields) {
    await db.execute(sql`
      UPDATE "pages_sections_content" AS c SET "built_in" = ${oldSrc}
      FROM "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
        AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}
        AND c."built_in" = ${newSrc}`)
  }
}
