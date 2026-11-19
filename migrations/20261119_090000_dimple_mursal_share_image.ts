import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.8.1 (Christine, 19 November 2026), the dashboard side:
 *   - Mursel is spelt Mursal. The Team list entry is renamed only if it still
 *     says "Mursel", so a spelling set in the dashboard is kept.
 *   - The share picture (shown when a page is posted on Facebook and the like)
 *     on Areas We Serve and the ten suburb pages: the shopfront photo without
 *     the NOW OPEN A-frame, cropped to 1200 x 630. Changed only where the page
 *     still has the old picture and none was chosen in the dashboard; the
 *     same address in the page's structured data likewise.
 *   - Contact: the "[VERIFY] form endpoint not yet connected" note comes off
 *     the privacy notice under the form (the form is connected), only where
 *     the wording is still exactly as shipped.
 * Dr Dimple needs nothing here: her card, slide and the intro come from
 * src/team.config.ts.
 *
 * On an empty database nothing matches, so it does nothing.
 */
const OLD_OG = '/images/img-0451df991a.webp'
const NEW_OG = '/images/img-b0fc5965f7.jpg'
const OG_PAGES: string[] = ["areas-we-serve", "dentist-ashtonfield", "dentist-beresfield-woodberry", "dentist-chisholm", "dentist-lorn-bolwarra", "dentist-maitland", "dentist-metford", "dentist-morpeth", "dentist-rutherford", "dentist-tenambit", "dentist-thornton"]
const CONTACT = {
  slug: 'contact',
  key: 'contact-05-enquiry',
  field: 'paragraph-1',
  old: "<b style=\"color:var(--white)\">Privacy notice.</b> Anything you send here is stored and handled under the Australian Privacy Principles and used only to answer your enquiry. We never ask for clinical or health information through this form. <span class=\"verify\">[VERIFY]</span> form endpoint not yet connected - submissions are disabled until a secure destination is confirmed.",
  new: "<b style=\"color:var(--white)\">Privacy notice.</b> Anything you send here is stored and handled under the Australian Privacy Principles and used only to answer your enquiry. We never ask for clinical or health information through this form.",
}
const OLD_NAME = 'Mursel'
const NEW_NAME = 'Mursal'

type Db = MigrateUpArgs['db']
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0
const rowsOf = (r: unknown) => ((r as { rows?: Record<string, unknown>[] })?.rows ?? [])

async function og(db: Db, from: string, to: string) {
  let pictures = 0
  let schema = 0
  for (const slug of OG_PAGES) {
    pictures += countOf(await db.execute(sql`
      UPDATE "pages" SET "meta_og_image_path" = ${to}
      WHERE "page_slug" = ${slug} AND "meta_og_image_path" = ${from} AND "meta_og_image_id" IS NULL`))
    schema += countOf(await db.execute(sql`
      UPDATE "pages" SET "json_ld" = replace("json_ld", ${from}, ${to})
      WHERE "page_slug" = ${slug} AND position(${from} in "json_ld") > 0`))
  }
  return { pictures, schema }
}

async function contact(db: Db, from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id"
      AND p."page_slug" = ${CONTACT.slug} AND s."key" = ${CONTACT.key} AND c."field_id" = ${CONTACT.field}
      AND c."text" = ${from}`))
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const renamed = countOf(await db.execute(sql`UPDATE "team" SET "name" = ${NEW_NAME} WHERE "name" = ${OLD_NAME}`))
  const shared = await og(db, OLD_OG, NEW_OG)
  const note = await contact(db, CONTACT.old, CONTACT.new)
  payload.logger.info(
    `v2.8.1: Team list ${renamed ? 'Mursel renamed Mursal' : 'no "Mursel" to rename (already Mursal, changed in the dashboard, or nothing imported yet)'}; `
      + `share picture changed on ${shared.pictures} page${shared.pictures === 1 ? '' : 's'} (structured data on ${shared.schema}); `
      + `Contact form note ${note ? 'removed' : 'left as it is'}.`,
  )
  const left = rowsOf(await db.execute(sql`
    SELECT "page_slug" AS slug FROM "pages" WHERE "meta_og_image_path" = ${OLD_OG} OR position(${OLD_OG} in coalesce("json_ld", '')) > 0`))
  if (left.length) {
    payload.logger.warn(`v2.8.1: these pages still name the old share picture and were left alone: ${left.map((r) => r.slug).join(', ')}.`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "team" SET "name" = ${OLD_NAME} WHERE "name" = ${NEW_NAME}`)
  await og(db, NEW_OG, OLD_OG)
  await contact(db, CONTACT.new, CONTACT.old)
}
