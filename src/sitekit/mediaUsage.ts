/**
 * Where a Media Library photo is used (v2.9.0), so deleting one that a page,
 * post, team member or setting still shows can be refused or warned about.
 */
import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'

type Row = Record<string, unknown>
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []) as Row[]

export async function mediaUsage(payload: Payload, id: number | string): Promise<string[]> {
  const n = Number(id)
  if (!Number.isFinite(n)) return []
  const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }).drizzle
  const media = rowsOf(await db.execute(sql`SELECT "filename" FROM "media" WHERE "id" = ${n}`))[0]
  const file = String(media?.filename ?? '')
  const places = new Set<string>()
  const add = (rows: Row[], label: (r: Row) => string) => rows.forEach((r) => places.add(label(r)))
  add(rowsOf(await db.execute(sql`
    SELECT DISTINCT p."title" AS t FROM "pages_sections_content" c
    JOIN "pages_sections" s ON c."_parent_id" = s."id" JOIN "pages" p ON s."_parent_id" = p."id"
    WHERE c."image_id" = ${n}`)), (r) => `the ${r.t} page`)
  add(rowsOf(await db.execute(sql`SELECT "title" AS t FROM "pages" WHERE "meta_og_image_id" = ${n}`)), (r) => `the share picture of ${r.t}`)
  add(rowsOf(await db.execute(sql`SELECT "name" AS t FROM "team" WHERE "photo_id" = ${n}`)), (r) => `${r.t} on the Team screen`)
  add(rowsOf(await db.execute(sql`SELECT "title" AS t FROM "posts" WHERE "featured_image_id" = ${n} OR "meta_og_image_id" = ${n}`)), (r) => `the blog post "${r.t}"`)
  if (file) {
    add(rowsOf(await db.execute(sql`SELECT "title" AS t FROM "posts" WHERE position(${file} in coalesce("body", '')) > 0`)), (r) => `the blog post "${r.t}"`)
  }
  if (rowsOf(await db.execute(sql`SELECT 1 FROM "seo" WHERE "default_og_image_id" = ${n}`)).length) places.add('the default share picture (SEO)')
  if (rowsOf(await db.execute(sql`SELECT 1 FROM "site_settings" WHERE "logo_id" = ${n}`)).length) places.add('the logo (Site Settings)')
  if (rowsOf(await db.execute(sql`SELECT 1 FROM "site_settings_health_funds" WHERE "logo_id" = ${n}`)).length) places.add('a health fund logo (Site Settings)')
  return [...places]
}
