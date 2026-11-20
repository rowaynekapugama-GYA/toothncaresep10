import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.0: the two columns the Vercel Blob storage plugin keeps on the Media
 * Library (prefix and _objectKey). With BLOB_READ_WRITE_TOKEN set, as on
 * Vercel, the plugin reads and writes them on every photo; without them the
 * Media Library list fails (500) and uploads fail ("There was a problem while
 * uploading the file"). The same fault was found on other GYA sites.
 *
 * IF NOT EXISTS, so a database where they were added by hand is fine. Existing
 * photos keep working: an empty prefix is what the plugin uses for them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "prefix" varchar DEFAULT '';
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";
   ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey";`)
}
