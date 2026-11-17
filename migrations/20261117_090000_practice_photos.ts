import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.8.0, the practice photos Christine sent on 17 November 2026: real photos
 * of the practice replace stock, generic and placeholder images (the placement
 * table is in CHANGELOG.md under 2.8.0).
 *
 * The live site is built from the dashboard, so the same change is made there,
 * one slot at a time, only where the slot still holds the photo the site
 * shipped with and no photo has been chosen in the dashboard. The description
 * (alt text) and stored size are only updated where they are still the old
 * ones. A slot already changed in the dashboard is left alone and named in the
 * build log.
 *
 * Undoing this puts the old file names back, so undo it together with the code
 * (most of the old files are removed from the repository in this release).
 *
 * On an empty database nothing matches, so it does nothing.
 */
type Slot = [
  page: string,
  section: string,
  field: string,
  oldSrc: string,
  newSrc: string,
  oldAlt: string,
  newAlt: string,
  oldSize: [string, string] | null,
  newSize: [string, string] | null,
]
const SLOTS: Slot[] = [
  ["index", "index-04-know-us", "image-1", "/images/img-3d8678d4cd.webp", "/images/img-64aeb84e1c.webp", "", "", null, null],
  ["index", "index-04-know-us", "image-3", "/images/img-d7321cde74.webp", "/images/img-6d8feac066.webp", "", "", null, null],
  ["index", "index-04-know-us", "image-4", "/images/img-bffd1ee4e3.webp", "/images/img-ff656f6ae4.webp", "", "", null, null],
  ["index", "index-04-know-us", "image-6", "/images/img-206de2913e.webp", "/images/img-8b2603dcae.webp", "", "", null, null],
  ["new-patients", "new-patients-02-top", "image-1", "/images/img-93537bced9.webp", "/images/img-7a2e097922.webp", "The reception desk at Tooth n Care, with the illuminated tooth logo and the corridor beyond", "The waiting area at Tooth n Care, with plants, window seating and an armchair", ["1800", "1013"], ["1600", "900"]],
  ["nervous-patients", "nervous-patients-04-your-pace", "image-1", "/images/img-0353d19136.webp", "/images/img-c23038ef65.webp", "A dentist and dental assistant caring for a patient in a treatment room at Tooth n Care", "A quiet window seat with cushions in the Tooth n Care waiting area", null, null],
  ["offers", "offers-02-top", "image-1", "/images/img-fe3d21e711.webp", "/images/img-0f78085cc7.webp", "A patient smiling after treatment at Tooth n Care", "The reception desk at Tooth n Care, with the lit tooth logo and the treatment room corridor", ["1600", "900"], ["1600", "900"]],
  ["our-technology", "our-technology-04-fewer-visits-clearer-answers", "image-1", "/images/img-1f7cba5cc5.webp", "/images/img-6d6f276c76.webp", "The panoramic X-ray and 3D imaging unit at Tooth n Care, East Maitland", "The imaging room at Tooth n Care, with the panoramic X-ray unit", null, null],
  ["contact", "contact-02-contact", "image-1", "/images/img-ea37d4d5c9.webp", "/images/img-6d8feac066.webp", "", "", ["1086", "1448"], ["1200", "800"]],
  ["envision-your-smile", "envision-your-smile-02-top", "image-1", "/images/img-0a16f6b55c.webp", "/images/img-ae666fff90.webp", "The Smile With Confidence sign lit along the treatment room corridor at Tooth n Care", "The corridor at Tooth n Care, with frosted glass doors to the treatment rooms", ["1300", "867"], ["1600", "900"]],
  ["dentist-tenambit", "dentist-tenambit-05-treatments", "image-4", "/images/img-a23f5c341d.webp", "/images/img-362db70deb.webp", "Tooth n Care, East Maitland", "A treatment room at Tooth n Care, with the dental chair and equipment ready", ["560", "373"], ["1200", "675"]],
  ["our-clinic", "our-clinic-02-top", "image-1", "/images/img-0451df991a.webp", "/images/img-fd60f4158f.webp", "The Tooth n Care shopfront on Lawes Street, East Maitland, with the practice signage above the entrance", "The waiting room at Tooth n Care, with plants and a long upholstered bench", ["1086", "1448"], ["1152", "648"]],
  ["our-clinic", "our-clinic-04-a-few-corners-of-the-practice", "image-1", "/images/img-2b063f35d5.webp", "/images/img-510487387a.webp", "The reception desk at Tooth n Care, with the illuminated tooth logo and the corridor beyond", "The reception desk at Tooth n Care, with the lit tooth logo and indoor plants", ["920", "600"], ["1152", "648"]],
  ["our-clinic", "our-clinic-04-a-few-corners-of-the-practice", "image-4", "/images/img-fbc10a1b5d.webp", "/images/img-d8b59c77ac.webp", "The Smile With Confidence sign lit along the treatment room corridor", "The coffee bar in the Tooth n Care waiting area", ["920", "600"], ["1200", "675"]],
  ["our-clinic", "our-clinic-04-a-few-corners-of-the-practice", "image-6", "/images/img-dc466c7abb.webp", "/images/img-48e611c9ec.webp", "A treatment room at Tooth n Care, with the chair and equipment ready", "A treatment room at Tooth n Care, with the chair and a screen on the ceiling", ["920", "600"], ["1200", "675"]],
]

type Db = MigrateUpArgs['db']
type Row = Record<string, unknown>
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0
const altOf = (field: string) => `image-description-alt-text-${field.split('-')[1]}`

async function swap(db: Db, s: Slot, back = false): Promise<number> {
  const [page, section, field, oldSrc, newSrc, oldAlt, newAlt, oldSize, newSize] = s
  const [fromSrc, toSrc, fromAlt, toAlt, fromSize, toSize] = back
    ? [newSrc, oldSrc, newAlt, oldAlt, newSize, oldSize]
    : [oldSrc, newSrc, oldAlt, newAlt, oldSize, newSize]
  const photo = await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "built_in" = ${toSrc}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}
      AND c."built_in" = ${fromSrc} AND c."image_id" IS NULL`)
  if (countOf(photo) === 0) return 0
  if (fromSize && toSize) {
    await db.execute(sql`
      UPDATE "pages_sections_content" AS c SET "w" = ${toSize[0]}, "h" = ${toSize[1]}
      FROM "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
        AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}
        AND c."w" = ${fromSize[0]} AND c."h" = ${fromSize[1]}`)
  }
  if (fromAlt !== toAlt) {
    await db.execute(sql`
      UPDATE "pages_sections_content" AS c SET "text" = ${toAlt}
      FROM "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
        AND p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${altOf(field)}
        AND c."text" = ${fromAlt}`)
  }
  return countOf(photo)
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  let changed = 0
  const leftAlone: string[] = []
  for (const s of SLOTS) {
    if (await swap(db, s)) { changed++; continue }
    const [page, section, field, , newSrc] = s
    const slot = rowsOf(await db.execute(sql`
      SELECT c."built_in" AS src, c."image_id" AS media FROM "pages_sections_content" AS c
      JOIN "pages_sections" AS s ON c."_parent_id" = s."id"
      JOIN "pages" AS p ON s."_parent_id" = p."id"
      WHERE p."page_slug" = ${page} AND s."key" = ${section} AND c."field_id" = ${field}`))[0]
    if (slot && (slot.src !== newSrc || slot.media)) leftAlone.push(`${page} / ${section} / ${field}`)
  }
  payload.logger.info(
    changed
      ? `v2.8.0: ${changed} practice photo${changed === 1 ? '' : 's'} placed in the dashboard.`
      : 'v2.8.0: no practice photo placed in the dashboard (already done, changed there, or nothing imported yet).',
  )
  if (leftAlone.length) {
    payload.logger.warn(
      `v2.8.0: these photos were already changed in the dashboard, so they were left alone: ${leftAlone.join('; ')}.`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const s of SLOTS) await swap(db, s, true)
}
