import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.6.0, asked for by the practice on 11 November 2026 (Christine): the
 * "Smile With Confidence" sign photo is replaced by the reception photo she
 * sent, on About Us (Our story) and New Patients (Getting here). The homepage
 * About photo (v2.4.0) is not touched.
 *
 * The live site is built from the dashboard, so the same change is made there,
 * only where the photo is still the one the site shipped with and no photo has
 * been chosen in the dashboard. The description is only updated where it is
 * still the old one. A slot already changed in the dashboard is left alone and
 * named in the build log.
 *
 * Undoing this puts the old file name back, so undo it together with the code
 * (the old photo file is removed from the repository in this release).
 *
 * On an empty database nothing matches, so it does nothing.
 */
const OLD_SRC = '/images/img-d7098759b1.webp'
const OLD_ALT = 'Illuminated Smile With Confidence sign inside the Tooth n Care clinic'
const NEW_ALT = 'Tooth n Care reception, with the lit Tooth n Care sign above the front desk and the treatment room corridor beyond'
const ALT_FIELD = 'image-description-alt-text-1'
const SLOTS: [page: string, section: string, newSrc: string][] = [
  ['about', 'about-03-story', '/images/img-e78e6ffb10.webp'],
  ['new-patients', 'new-patients-05-getting-here', '/images/img-3d49338cd8.webp'],
]

type Row = Record<string, unknown>
type Db = MigrateUpArgs['db']
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function swap(db: Db, page: string, section: string, from: [string, string], to: [string, string]) {
  const photo = await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "built_in" = ${to[0]}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = 'image-1'
      AND c."built_in" = ${from[0]} AND c."image_id" IS NULL`)
  if (countOf(photo) === 0) return 0
  await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to[1]}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${ALT_FIELD}
      AND c."text" = ${from[1]}`)
  return countOf(photo)
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const changed: string[] = []
  const leftAlone: string[] = []
  for (const [page, section, newSrc] of SLOTS) {
    if (await swap(db, page, section, [OLD_SRC, OLD_ALT], [newSrc, NEW_ALT])) {
      changed.push(page)
      continue
    }
    const slot = rowsOf(await db.execute(sql`
      SELECT c."built_in" AS src, c."image_id" AS media FROM "pages_sections_content" AS c
      JOIN "pages_sections" AS s ON c."_parent_id" = s."id"
      JOIN "pages" AS p ON s."_parent_id" = p."id"
      WHERE p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = 'image-1'`))[0]
    if (slot && slot.src !== newSrc) leftAlone.push(`${page} / ${section}`)
  }
  payload.logger.info(
    changed.length
      ? `v2.6.0: reception photo now on ${changed.join(' and ')} in the dashboard.`
      : 'v2.6.0: no photo changed in the dashboard (already done, changed there, or nothing imported yet).',
  )
  if (leftAlone.length) {
    payload.logger.warn(
      `v2.6.0: the photo here was already changed in the dashboard, so it was left alone: ${leftAlone.join('; ')}. Swap it by hand if the reception photo should go there.`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [page, section, newSrc] of SLOTS) await swap(db, page, section, [newSrc, NEW_ALT], [OLD_SRC, OLD_ALT])
}
