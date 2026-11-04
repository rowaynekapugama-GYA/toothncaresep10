import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "body" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_body" varchar;
  ALTER TABLE "enquiries" ADD COLUMN "notes" varchar;
  ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false;`)
  // The old rich text columns ("content", "version_content") are left in place
  // rather than dropped, so a post written before this release is never lost.
  // Nothing reads them any more.
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "body";
  ALTER TABLE "_posts_v" DROP COLUMN "version_body";
  ALTER TABLE "enquiries" DROP COLUMN "notes";
  ALTER TABLE "users" DROP COLUMN "must_change_password";`)
}
