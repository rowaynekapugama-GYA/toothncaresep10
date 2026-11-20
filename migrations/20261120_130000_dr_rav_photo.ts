import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.2 (20 November 2026): Dr Rav's photo (Christine, 5:35 PM, taken in
 * reception to match the other dentists' portraits).
 *
 * Her Our Team card, her homepage slide and her profile page (still switched
 * off) get /images/dr-rav.webp, but only where they still show the see-through
 * placeholder behind the letter R and no photo has been chosen in the
 * dashboard. Their photo descriptions become "Dr Rav, Dentist" (from the name
 * setting) only where they are still as v2.9.1 had them, and her card and
 * profile photo lose the colour wash, as the other dentists' portraits have
 * none. Nothing changed in the dashboard is overwritten, and a second run
 * changes nothing. On an empty database nothing matches.
 */
const PLACEHOLDER = "/images/img-52e7b1f5ba.webp"
const PHOTO = "/images/dr-rav.webp"
const PHOTOS: { slug: string; key: string; field: string }[] = [{"slug": "our-team", "key": "our-team-03-small-team-familiar-faces", "field": "image-4"}, {"slug": "index", "key": "index-06-team", "field": "image-4"}, {"slug": "dr-rav", "key": "dr-rav-03-about", "field": "image-1"}]
const ALTS: { slug: string; key: string; field: string; old: string; new: string }[] = [{"slug": "our-team", "key": "our-team-03-small-team-familiar-faces", "field": "image-description-alt-text-4", "old": "{{site:ravName}}, dentist at Tooth n Care", "new": "{{site:ravName}}, Dentist"}, {"slug": "index", "key": "index-06-team", "field": "image-description-alt-text-4", "old": "{{site:ravName}}", "new": "{{site:ravName}}, Dentist"}, {"slug": "dr-rav", "key": "dr-rav-03-about", "field": "image-description-alt-text-1", "old": "{{site:ravName}}, dentist at Tooth n Care", "new": "{{site:ravName}}, Dentist"}]
const LAYOUTS: { slug: string; key: string; old: string; new: string }[] = [{"slug": "our-team", "key": "our-team-03-small-team-familiar-faces", "old": "<div class=\"tcard-photo tcard-ph\"><span class=\"tcard-fallback\" aria-hidden=\"true\">R</span><img src=\"{{image-4}}\"", "new": "<div class=\"tcard-photo tcard-ph no-tint\"><span class=\"tcard-fallback\" aria-hidden=\"true\">R</span><img src=\"{{image-4}}\""}, {"slug": "dr-rav", "key": "dr-rav-03-about", "old": "<div class=\"profile-photo tcard-ph rv\">", "new": "<div class=\"profile-photo tcard-ph no-tint rv\">"}]

type Db = MigrateUpArgs['db']
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function photo(db: Db, p: (typeof PHOTOS)[number], from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections_content" AS f SET "built_in" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE f."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${p.slug} AND s."key" = ${p.key}
      AND f."field_id" = ${p.field} AND f."built_in" = ${from} AND f."image_id" IS NULL`))
}
async function alt(db: Db, a: (typeof ALTS)[number], from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections_content" AS f SET "text" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE f."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${a.slug} AND s."key" = ${a.key}
      AND f."field_id" = ${a.field} AND f."text" = ${from}`))
}
async function layout(db: Db, l: (typeof LAYOUTS)[number], from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections" AS s SET "template" = replace(s."template", ${from}, ${to})
    FROM "pages" AS p
    WHERE s."_parent_id" = p."id" AND p."page_slug" = ${l.slug} AND s."key" = ${l.key}
      AND position(${from} in s."template") > 0 AND position(${to} in s."template") = 0`))
}
async function schema(db: Db, from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages" SET "json_ld" = replace("json_ld", ${from}, ${to})
    WHERE "page_slug" = 'dr-rav' AND position(${from} in coalesce("json_ld", '')) > 0`))
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const placed: string[] = []
  for (const p of PHOTOS) if (await photo(db, p, PLACEHOLDER, PHOTO)) placed.push(p.slug)
  let alts = 0
  for (const a of ALTS) alts += await alt(db, a, a.old, a.new)
  for (const l of LAYOUTS) await layout(db, l, l.old, l.new)
  const ld = await schema(db, PLACEHOLDER, PHOTO)
  payload.logger.info(
    `v2.9.2: Dr Rav's photo ${placed.length ? `placed on ${placed.join(', ')}` : 'already there, or a photo was chosen in the dashboard (left alone)'}`
      + `; ${alts} photo description${alts === 1 ? '' : 's'} updated${ld ? '; profile page structured data updated' : ''}.`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const p of PHOTOS) await photo(db, p, PHOTO, PLACEHOLDER)
  for (const a of ALTS) await alt(db, a, a.new, a.old)
  for (const l of LAYOUTS) await layout(db, l, l.new, l.old)
  await schema(db, PHOTO, PLACEHOLDER)
}
