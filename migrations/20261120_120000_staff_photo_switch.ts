import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.1 (20 November 2026): support team photos behind a permission switch.
 *
 * Two new Team columns, added only if they are not there yet:
 *   - photo_path: a photo GYA loaded from an email (public/images)
 *   - photo_approved: "Show photo on website (permission confirmed)"
 * A photo shows on Our Team only once photo_approved is on.
 *
 * Keeps what is there: anyone who already has a photo chosen in the dashboard
 * when the switch is added keeps showing it (photo_approved on for them).
 *
 * Loads the four photos Christine sent on 20 Nov 2026 (Deb, Kathryn, Riley and
 * Layeba), each matched by the name in her email's subject or body, never by
 * the picture. They are NOT shown: their permission is still to be confirmed.
 * Someone who already has a photo of their own is left alone.
 *
 * On an empty database the columns are added and nothing else happens. A
 * second run changes nothing.
 */
const LOADED: { names: string[]; path: string }[] = [
  { names: ['Debbie', 'Deb'], path: '/images/team-deb.webp' },
  { names: ['Kathryn'], path: '/images/team-kathryn.webp' },
  { names: ['Riley'], path: '/images/team-riley.webp' },
  { names: ['Layeba'], path: '/images/team-layeba.webp' },
]

const rowsOf = (r: unknown) => ((r as { rows?: Record<string, unknown>[] })?.rows ?? [])
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const had = rowsOf(await db.execute(sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'team' AND column_name = 'photo_approved'`)).length > 0
  await db.execute(sql`
    ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "photo_path" varchar;
    ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "photo_approved" boolean DEFAULT false;`)
  let kept = 0
  if (!had) {
    kept = countOf(await db.execute(sql`UPDATE "team" SET "photo_approved" = true WHERE "photo_id" IS NOT NULL`))
  }
  const loaded: string[] = []
  for (const p of LOADED) {
    for (const name of p.names) {
      const n = countOf(await db.execute(sql`
        UPDATE "team" SET "photo_path" = ${p.path}
        WHERE "name" = ${name} AND "photo_id" IS NULL AND coalesce("photo_path", '') = ''`))
      if (n) loaded.push(name)
    }
  }
  payload.logger.info(
    `v2.9.1: staff photo switch ${had ? 'already there' : 'added'}`
      + `${kept ? ` (${kept} photo${kept === 1 ? '' : 's'} chosen earlier kept on the website)` : ''}; `
      + `${loaded.length ? `photos loaded, not shown until permission is confirmed: ${loaded.join(', ')}` : 'no new staff photos to load'}.`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "team" DROP COLUMN IF EXISTS "photo_path";
    ALTER TABLE "team" DROP COLUMN IF EXISTS "photo_approved";`)
}
