import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.1 (20 November 2026): Dr Rav ready for her photo and bio.
 *
 * An empty "Add words" line under her name on the Our Team card and on her
 * homepage slide, so the practice can add a short bio in the dashboard. While
 * it is empty the website shows nothing for it (data-hide-empty), so the pages
 * look exactly as before. The View profile links fill in only once her profile
 * page is switched on in src/team.config.ts.
 *
 * Each layout changes only where it still has the v2.9.0 wording, and the new
 * line is added only if it is not there yet, so dashboard edits are kept and a
 * second run changes nothing. On an empty database nothing matches.
 */
const CHANGES = [
  { slug: 'our-team', key: 'our-team-03-small-team-familiar-faces', field: 'paragraph-4', old: "<h3>{{sub-heading-4}}</h3>{{site:ravAhpra}}</div></div>{{site:dimpleCard}}", new: "<h3>{{sub-heading-4}}</h3>{{site:ravAhpra}}<p data-hide-empty>{{paragraph-4}}</p>{{site:ravProfileLink}}</div></div>{{site:dimpleCard}}" },
  { slug: 'index', key: 'index-06-team', field: 'paragraph-5', old: "<h3 class=\"tm-name\">{{sub-heading-4}}</h3>{{site:ravAhpra}}\n          <div class=\"tm-btns\">\n            <a class=\"btn btn-primary\" href=\"{{button-link-7}}\">", new: "<h3 class=\"tm-name\">{{sub-heading-4}}</h3>{{site:ravAhpra}}<p class=\"tm-bio\" data-hide-empty>{{paragraph-5}}</p>\n          <div class=\"tm-btns\">{{site:ravSlideProfile}}\n            <a class=\"btn btn-primary\" href=\"{{button-link-7}}\">" },
]

type Db = MigrateUpArgs['db']
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function layout(db: Db, c: (typeof CHANGES)[number], from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections" AS s SET "template" = replace(s."template", ${from}, ${to})
    FROM "pages" AS p
    WHERE s."_parent_id" = p."id" AND p."page_slug" = ${c.slug} AND s."key" = ${c.key}
      AND position(${from} in s."template") > 0 AND position(${to} in s."template") = 0`))
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const done: string[] = []
  const left: string[] = []
  for (const c of CHANGES) {
    const changed = await layout(db, c, c.old, c.new)
    // the new, empty line, after the section's other fields
    const added = countOf(await db.execute(sql`
      INSERT INTO "pages_sections_content" ("_order", "_parent_id", "id", "field_id", "kind", "label", "text")
      SELECT coalesce((SELECT max(f."_order") FROM "pages_sections_content" AS f WHERE f."_parent_id" = s."id"), 0) + 1,
             s."id", substr(md5(random()::text || clock_timestamp()::text || s."id"), 1, 24),
             ${c.field}, 'richtext', 'Paragraph', ''
      FROM "pages_sections" AS s JOIN "pages" AS p ON s."_parent_id" = p."id"
      WHERE p."page_slug" = ${c.slug} AND s."key" = ${c.key}
        AND position(${c.new} in s."template") > 0
        AND NOT EXISTS (SELECT 1 FROM "pages_sections_content" AS f WHERE f."_parent_id" = s."id" AND f."field_id" = ${c.field})`))
    if (changed || added) done.push(`${c.slug} (${c.field})`)
    else {
      const has = await db.execute(sql`SELECT 1 FROM "pages_sections" AS s JOIN "pages" AS p ON s."_parent_id" = p."id"
        WHERE p."page_slug" = ${c.slug} AND s."key" = ${c.key} AND position(${c.new} in s."template") = 0`)
      if (((has as { rows?: unknown[] })?.rows ?? []).length) left.push(c.slug)
    }
  }
  payload.logger.info(`v2.9.1: Dr Rav's bio line ${done.length ? `added on ${done.join(' and ')}` : 'already there (or nothing imported yet)'}.`)
  if (left.length) payload.logger.warn(`v2.9.1: Dr Rav's card or slide was changed in the dashboard, so no bio line was added on: ${left.join(', ')}.`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const c of CHANGES) {
    await db.execute(sql`
      DELETE FROM "pages_sections_content" AS f USING "pages_sections" AS s, "pages" AS p
      WHERE f."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${c.slug} AND s."key" = ${c.key}
        AND f."field_id" = ${c.field} AND coalesce(f."text", '') = ''`)
    await layout(db, c, c.new, c.old)
  }
}
