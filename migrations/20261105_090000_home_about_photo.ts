import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.4.0, asked for by the practice on 5 November 2026: the homepage About Us
 * photo ("We're here to care") becomes the treatment room corridor photo the
 * practice sent, cropped inside its frame.
 *
 * The live site is built from the dashboard, so the same change is made there,
 * only where the photo is still the one the site shipped with. A photo chosen
 * in the dashboard is left alone. The same old photo on About and New Patients
 * is not touched. The description is only updated if it is still the old one.
 *
 * It also checks that the photo of the team member removed in v2.3.0 (file
 * deleted in v2.4.0) is not still used by a section someone edited in the dashboard, and
 * names any it finds in the build log so it can be fixed by hand.
 *
 * On an empty database nothing matches, so it does nothing.
 */
const PAGE = 'index'
const SECTION = 'index-02-about'
const OLD_SRC = '/images/img-d7098759b1.webp'
const NEW_SRC = '/images/img-1b9897ccd3.webp'
const ALT_FIELD = 'image-description-alt-text-1'
const OLD_ALT = 'Illuminated Smile With Confidence sign inside the Tooth n Care clinic'
const NEW_ALT = 'Tooth n Care treatment room corridor, with numbered rooms and teal wave glass panels'
const REMOVED_PHOTO = '/images/img-fe35fabe7c.webp'

type Row = Record<string, unknown>
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function swap({ db }: Pick<MigrateUpArgs, 'db'>, from: [string, string], to: [string, string]) {
  const photo = await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "built_in" = ${to[0]}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${PAGE} AND s."key" = ${SECTION} AND c."field_id" = 'image-1'
      AND c."built_in" = ${from[0]} AND c."image_id" IS NULL`)
  if (countOf(photo) === 0) return 0
  await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to[1]}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${PAGE} AND s."key" = ${SECTION} AND c."field_id" = ${ALT_FIELD}
      AND c."text" = ${from[1]}`)
  return countOf(photo)
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const changed = await swap({ db }, [OLD_SRC, OLD_ALT], [NEW_SRC, NEW_ALT])

  const leftovers = rowsOf(await db.execute(sql`
    SELECT DISTINCT p."page_slug" AS page, s."label" AS label
    FROM "pages_sections_content" AS c
    JOIN "pages_sections" AS s ON c."_parent_id" = s."id"
    JOIN "pages" AS p ON s."_parent_id" = p."id"
    WHERE c."built_in" = ${REMOVED_PHOTO}`))

  payload.logger.info(
    changed
      ? 'v2.4.0: homepage About Us photo updated in the dashboard.'
      : 'v2.4.0: homepage About Us photo left as it is (it was changed in the dashboard, or nothing is imported yet).',
  )
  if (leftovers.length) {
    payload.logger.warn(
      `v2.4.0: a removed team photo is still used on: ${leftovers.map((r) => `${r.page} / ${r.label}`).join('; ')}. Remove that card in the dashboard.`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await swap({ db }, [NEW_SRC, NEW_ALT], [OLD_SRC, OLD_ALT])
}
