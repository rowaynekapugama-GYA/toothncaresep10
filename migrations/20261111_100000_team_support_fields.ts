import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** v2.7.0: the Team list gets the two support team groups and an optional role line. */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team" ADD COLUMN "patient_experience" boolean DEFAULT false;
  ALTER TABLE "team" ADD COLUMN "clinical_care" boolean DEFAULT false;
  ALTER TABLE "team" ADD COLUMN "role_line" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team" DROP COLUMN "patient_experience";
  ALTER TABLE "team" DROP COLUMN "clinical_care";
  ALTER TABLE "team" DROP COLUMN "role_line";`)
}
