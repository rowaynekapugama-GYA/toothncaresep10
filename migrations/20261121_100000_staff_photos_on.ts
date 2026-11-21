import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.3 (21 November 2026): the support team photos go on the website.
 *
 * Permission: Christine, 20 Nov 2026 5:57 PM, "given all ok consent to have
 * photo up", sent with the staff photos; Holly's consent confirmed by
 * Christine the same day; Rowayne asked on 21 Nov 2026 for the team photos to
 * be added. Logged in docs/GO-LIVE.md section 7c.
 *
 * Loads two more photos, matched by the name on Christine's emails, never by
 * the picture: Holly (the newer of her two photos, 7:54 PM) and Christine
 * (her own, 7:59 PM). Then switches on "Show photo on website (permission
 * confirmed)" for Debbie, Kathryn, Riley, Layeba, Holly and Christine, but
 * only where the row still has the photo GYA loaded and no photo has been
 * chosen in the dashboard. Nothing changed in the dashboard is overwritten,
 * and a second run changes nothing. On an empty database nothing matches.
 */
const LOAD: { names: string[]; path: string }[] = [
  { names: ['Holly'], path: '/images/team-holly.webp' },
  { names: ['Christine'], path: '/images/team-christine.webp' },
]
const SHOW: { names: string[]; path: string }[] = [
  { names: ['Debbie', 'Deb'], path: '/images/team-deb.webp' },
  { names: ['Kathryn'], path: '/images/team-kathryn.webp' },
  { names: ['Riley'], path: '/images/team-riley.webp' },
  { names: ['Layeba'], path: '/images/team-layeba.webp' },
  ...LOAD,
]

const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const loaded: string[] = []
  for (const p of LOAD) {
    for (const name of p.names) {
      if (countOf(await db.execute(sql`
        UPDATE "team" SET "photo_path" = ${p.path}
        WHERE "name" = ${name} AND "photo_id" IS NULL AND coalesce("photo_path", '') = ''`))) loaded.push(name)
    }
  }
  const shown: string[] = []
  for (const p of SHOW) {
    for (const name of p.names) {
      if (countOf(await db.execute(sql`
        UPDATE "team" SET "photo_approved" = true
        WHERE "name" = ${name} AND "photo_id" IS NULL AND "photo_path" = ${p.path}
          AND coalesce("photo_approved", false) = false`))) shown.push(name)
    }
  }
  payload.logger.info(
    `v2.9.3: ${loaded.length ? `photos loaded: ${loaded.join(', ')}` : 'no new staff photos to load'}; `
      + `${shown.length ? `staff photos switched on: ${shown.join(', ')}` : 'no staff photos to switch on (already on, or changed in the dashboard)'}.`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const p of SHOW) {
    for (const name of p.names) {
      await db.execute(sql`
        UPDATE "team" SET "photo_approved" = false
        WHERE "name" = ${name} AND "photo_id" IS NULL AND "photo_path" = ${p.path}`)
    }
  }
  for (const p of LOAD) {
    for (const name of p.names) {
      await db.execute(sql`
        UPDATE "team" SET "photo_path" = NULL
        WHERE "name" = ${name} AND "photo_id" IS NULL AND "photo_path" = ${p.path}`)
    }
  }
}
