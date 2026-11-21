import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.9.3 (21 November 2026): the practice's copy corrections of 21 Nov 2026.
 *
 *   - bios: Nish's clinician bios (forwarded by Christine, 21 Nov 2026 7:50 AM),
 *     as GYA shortened them for the Our Team cards (Rowayne, 7:51 AM): Dr Nish,
 *     Dr Nav, Zoe and Dr Rav on Our Team; Dr Rav's homepage slide and her
 *     profile page (still switched off). Dr Dimple's is in src/team.config.ts.
 *   - years: Dr Nish has more than 20 years of experience in dentistry, and has
 *     worked in the Hunter since 2008 (his bio), where the pages said "nearly
 *     ten years": his card, slide and profile page, and ten suburb pages.
 *   - surgeries: four surgeries, not five (Nish, 21 Nov 2026 7:11 AM). The
 *     separate recovery room stays.
 *   - whitening: $750, including a take-home whitening kit valued at $350 at
 *     no extra cost (Nish, 21 Nov 2026 7:11 AM). The offer still only shows
 *     once its period is set in src/golive.config.ts.
 *
 * Each change is made only where the words are still exactly as before, so
 * anything changed in the dashboard is left alone. A second run changes
 * nothing. On an empty database nothing matches.
 */
type Field = { group: string; slug: string; key: string; field: string; old: string; new: string }
type Meta = { group: string; slug: string; column: 'meta_description' | 'meta_og_description'; old: string; new: string }
type Ld = { group: string; slug: string; old: string; new: string }
const FIELDS: Field[] = [
 {
  "group": "bios",
  "slug": "our-team",
  "key": "our-team-03-small-team-familiar-faces",
  "field": "paragraph-1",
  "old": "Nearly ten years looking after Hunter smiles, with a special interest in veneers, wisdom teeth surgery, dentures and full-mouth rehabilitation.{{site:nishAhpra}}",
  "new": "Dr Nish founded Tooth n Care and has more than 20 years of experience in dentistry. He has worked across Newcastle and the Hunter since moving to Australia in 2008. His clinical interests include cosmetic dentistry, veneers, wisdom teeth surgery, complex extractions and full-mouth rehabilitation. Outside the clinic, he enjoys cricket and travelling.{{site:nishAhpra}}"
 },
 {
  "group": "bios",
  "slug": "our-team",
  "key": "our-team-03-small-team-familiar-faces",
  "field": "paragraph-2",
  "old": "A Fellow of the Royal Australasian College of Dental Surgeons, working across Newcastle and the Hunter since 2017. Calm, unhurried, happiest with the tricky cases.{{site:navAhpra}}",
  "new": "Dr Nav has worked across Newcastle and the Hunter since 2017. He graduated from Charles Sturt University and has clinical interests in dental implants, full-mouth rehabilitation, cosmetic dentistry and clear aligners.{{site:navAhpra}}"
 },
 {
  "group": "bios",
  "slug": "our-team",
  "key": "our-team-03-small-team-familiar-faces",
  "field": "paragraph-3",
  "old": "Preventative and restorative care for every age, from children&rsquo;s check-ups to gum disease management - and never in a rush to explain things properly.{{site:zoeAhpra}}",
  "new": "Zoe&rsquo;s interests include preventive care, children&rsquo;s dentistry, gum health and patient education.{{site:zoeAhpra}}"
 },
 {
  "group": "bios",
  "slug": "our-team",
  "key": "our-team-03-small-team-familiar-faces",
  "field": "paragraph-4",
  "old": "",
  "new": "Dr Rav practises general dentistry with an interest in cosmetic dentistry. She takes time to listen and explain treatment options clearly."
 },
 {
  "group": "bios",
  "slug": "index",
  "key": "index-06-team",
  "field": "paragraph-5",
  "old": "",
  "new": "Dr Rav practises general dentistry with an interest in cosmetic dentistry. She takes time to listen and explain treatment options clearly."
 },
 {
  "group": "bios",
  "slug": "dr-rav",
  "key": "dr-rav-03-about",
  "field": "paragraph-1",
  "old": "",
  "new": "Dr Rav practises general dentistry with an interest in cosmetic dentistry. She takes time to listen and explain treatment options clearly."
 },
 {
  "group": "bios",
  "slug": "index",
  "key": "index-06-team",
  "field": "paragraph-1",
  "old": "Nearly ten years looking after Hunter smiles, with a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation - and an easy sense of humour that settles even nervous patients.{{site:nishAhpra}}",
  "new": "More than 20 years in dentistry, with a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation - and an easy sense of humour that settles even nervous patients.{{site:nishAhpra}}"
 },
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "key": "dr-nisheeth-agrawal-02-top",
  "field": "intro-paragraph-1",
  "old": "General dentist and principal of the practice. Close to ten years of Hunter smiles, a steady hand with surgery, and a sense of humour that does half the work.",
  "new": "General dentist and principal of the practice. More than 20 years in dentistry, a steady hand with surgery, and a sense of humour that does half the work."
 },
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "key": "dr-nisheeth-agrawal-03-general-dentist-and-the-person-who",
  "field": "paragraph-1",
  "old": "Dr Nish has spent close to ten years in dentistry across both public and private practice in the Hunter, most of it in Newcastle. That mix matters: public work throws everything at you, and it teaches you to stay calm and work out what actually needs doing first.",
  "new": "Dr Nish has more than 20 years of experience in dentistry, and has worked across both public and private practice in the Hunter since moving to Australia in 2008, most of it in Newcastle. That mix matters: public work throws everything at you, and it teaches you to stay calm and work out what actually needs doing first."
 },
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "key": "dr-nisheeth-agrawal-03-general-dentist-and-the-person-who",
  "field": "text-2",
  "old": "Close to 10 years across public and private practice in the Hunter",
  "new": "More than 20 years in dentistry, in the Hunter since 2008"
 },
 {
  "group": "surgeries",
  "slug": "our-team",
  "key": "our-team-04-related-pages",
  "field": "text-2",
  "old": "Five surgeries, a recovery room and a coffee bay.",
  "new": "Four surgeries, a recovery room and a coffee bay."
 },
 {
  "group": "surgeries",
  "slug": "our-clinic",
  "key": "our-clinic-03-designed-around-the-appointment",
  "field": "sub-heading-1",
  "old": "Five surgeries",
  "new": "Four surgeries"
 },
 {
  "group": "surgeries",
  "slug": "our-clinic",
  "key": "our-clinic-03-designed-around-the-appointment",
  "field": "paragraph-1",
  "old": "Five fully equipped treatment rooms, so appointments run to time and emergencies can be squeezed in without turning the day upside down.",
  "new": "Four fully equipped treatment rooms, so appointments run to time and emergencies can be squeezed in without turning the day upside down."
 },
 {
  "group": "whitening",
  "slug": "offers",
  "key": "offers-03-current",
  "field": "text-2",
  "old": "<span class=\"verify\">[VERIFY price]</span>",
  "new": "$750"
 },
 {
  "group": "whitening",
  "slug": "offers",
  "key": "offers-03-current",
  "field": "paragraph-3",
  "old": "Professional whitening completed in the practice in about an hour, at a discounted rate, with your gums and lips protected throughout.",
  "new": "Professional whitening completed in the practice in about an hour, at a discounted rate, with your gums and lips protected throughout. Includes a take-home whitening kit valued at $350 at no extra cost."
 },
 {
  "group": "whitening",
  "slug": "offers",
  "key": "offers-03-current",
  "field": "paragraph-4",
  "old": "Whitening is only appropriate for some teeth and some conditions - we&rsquo;ll assess yours first and tell you honestly what to expect. <span class=\"verify\">[VERIFY] current price and RRP comparison to be confirmed before publishing.</span>",
  "new": "Whitening is only appropriate for some teeth and some conditions - we&rsquo;ll assess yours first and tell you honestly what to expect. <span class=\"verify\">[VERIFY] offer period, and the usual price behind &ldquo;discounted rate&rdquo;, to be confirmed before publishing.</span>"
 },
 {
  "group": "whitening",
  "slug": "teeth-whitening",
  "key": "teeth-whitening-08-cost",
  "field": "paragraph-1",
  "old": "We offer in-chair Philips ZOOM whitening<span class=\"offer offer-whitening\"> at a discounted rate</span> and custom take-home trays. <span class=\"verify\">[VERIFY] current pricing to be confirmed before publication.</span> Whitening is a cosmetic treatment, so health fund rebates are usually minimal or nil - we&rsquo;ll be clear about that before you book.",
  "new": "We offer in-chair Philips ZOOM whitening<span class=\"offer offer-whitening\"> at a discounted rate</span> and custom take-home trays.<span class=\"offer offer-whitening\"> Philips ZOOM in-chair whitening is $750, including a take-home whitening kit valued at $350 at no extra cost.</span> Whitening is a cosmetic treatment, so health fund rebates are usually minimal or nil - we&rsquo;ll be clear about that before you book."
 },
 {
  "group": "years",
  "slug": "dentist-ashtonfield",
  "key": "dentist-ashtonfield-04-about",
  "field": "intro-paragraph-1",
  "old": "Our clinicians are Dr Nish, who has spent nearly ten years on Hunter smiles with a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation; Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, who is calm and methodical with involved treatment; and Zoe, who covers preventative and general care for every age.",
  "new": "Our clinicians are Dr Nish, who has more than 20 years of experience in dentistry and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation; Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, who is calm and methodical with involved treatment; and Zoe, who covers preventative and general care for every age."
 },
 {
  "group": "years",
  "slug": "dentist-beresfield-woodberry",
  "key": "dentist-beresfield-woodberry-04-about",
  "field": "intro-paragraph-1",
  "old": "Tooth n Care is on Lawes Street in East Maitland. Dr Nish brings nearly ten years of experience with Hunter patients and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav holds a Fellowship of the Royal Australasian College of Dental Surgeons. Zoe provides preventative and general care for every age.",
  "new": "Tooth n Care is on Lawes Street in East Maitland. Dr Nish brings more than 20 years of experience in dentistry and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav holds a Fellowship of the Royal Australasian College of Dental Surgeons. Zoe provides preventative and general care for every age."
 },
 {
  "group": "years",
  "slug": "dentist-chisholm",
  "key": "dentist-chisholm-04-about",
  "field": "intro-paragraph-1",
  "old": "Tooth n Care has been on Lawes Street for years. Dr Nish, with almost ten years behind him and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, works alongside Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons. Zoe handles preventative and general dentistry for every age.",
  "new": "Tooth n Care has been on Lawes Street for years. Dr Nish, with more than 20 years in dentistry behind him and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, works alongside Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons. Zoe handles preventative and general dentistry for every age."
 },
 {
  "group": "years",
  "slug": "dentist-lorn-bolwarra",
  "key": "dentist-lorn-bolwarra-04-about",
  "field": "intro-paragraph-1",
  "old": "The practice is on Lawes Street in East Maitland. Dr Nish has spent nearly ten years looking after Hunter smiles, with a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons and undertakes much of the practice's more involved treatment. Zoe covers preventative and general care for every age.",
  "new": "The practice is on Lawes Street in East Maitland. Dr Nish has more than 20 years of experience in dentistry, with a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons and undertakes much of the practice's more involved treatment. Zoe covers preventative and general care for every age."
 },
 {
  "group": "years",
  "slug": "dentist-maitland",
  "key": "dentist-maitland-04-about",
  "field": "intro-paragraph-1",
  "old": "Tooth n Care is a family practice on Lawes Street, led by Dr Nish, who has spent nearly ten years on Hunter smiles with a particular interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, and Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, who takes on much of the more involved treatment. Zoe covers preventative and general care for every age.",
  "new": "Tooth n Care is a family practice on Lawes Street, led by Dr Nish, who has more than 20 years of experience in dentistry and a particular interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, and Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, who takes on much of the more involved treatment. Zoe covers preventative and general care for every age."
 },
 {
  "group": "years",
  "slug": "dentist-metford",
  "key": "dentist-metford-04-about",
  "field": "intro-paragraph-1",
  "old": "We are a family practice on Lawes Street. Dr Nish has close to ten years with Hunter patients and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, while Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons and takes on the more involved work. Zoe provides preventative and general care for all ages.",
  "new": "We are a family practice on Lawes Street. Dr Nish has more than 20 years of experience in dentistry and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation, while Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons and takes on the more involved work. Zoe provides preventative and general care for all ages."
 },
 {
  "group": "years",
  "slug": "dentist-morpeth",
  "key": "dentist-morpeth-04-about",
  "field": "intro-paragraph-1",
  "old": "Tooth n Care is a family practice in a clean and comfortable space on Lawes Street. Dr Nish has spent nearly ten years with Hunter patients and holds a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, works unhurriedly through more involved treatment. Zoe looks after preventative and general dentistry for every age.",
  "new": "Tooth n Care is a family practice in a clean and comfortable space on Lawes Street. Dr Nish has more than 20 years of experience in dentistry and holds a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav, a Fellow of the Royal Australasian College of Dental Surgeons, works unhurriedly through more involved treatment. Zoe looks after preventative and general dentistry for every age."
 },
 {
  "group": "years",
  "slug": "dentist-rutherford",
  "key": "dentist-rutherford-04-about",
  "field": "intro-paragraph-1",
  "old": "We are a family practice on Lawes Street in East Maitland. Dr Nish brings close to a decade of experience with Hunter patients and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav holds a Fellowship of the Royal Australasian College of Dental Surgeons and works at an unhurried pace with more involved treatment. Zoe looks after preventative and general dentistry for all ages.",
  "new": "We are a family practice on Lawes Street in East Maitland. Dr Nish brings more than 20 years of experience in dentistry and a special interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav holds a Fellowship of the Royal Australasian College of Dental Surgeons and works at an unhurried pace with more involved treatment. Zoe looks after preventative and general dentistry for all ages."
 },
 {
  "group": "years",
  "slug": "dentist-tenambit",
  "key": "dentist-tenambit-04-about",
  "field": "intro-paragraph-1",
  "old": "The practice sits on Lawes Street in East Maitland. Dr Nish, with nearly ten years behind him, has a particular interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons. Zoe covers preventative and general care for every age.",
  "new": "The practice sits on Lawes Street in East Maitland. Dr Nish, with more than 20 years in dentistry behind him, has a particular interest in veneers, wisdom teeth, dentures and full-mouth rehabilitation. Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons. Zoe covers preventative and general care for every age."
 },
 {
  "group": "years",
  "slug": "dentist-thornton",
  "key": "dentist-thornton-04-about",
  "field": "intro-paragraph-1",
  "old": "We are a family dental practice on Lawes Street in East Maitland. Dr Nish has spent nearly ten years looking after Hunter smiles, Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons, and Zoe provides preventative and general care for every age with a light touch around children.",
  "new": "We are a family dental practice on Lawes Street in East Maitland. Dr Nish has more than 20 years of experience in dentistry, Dr Nav is a Fellow of the Royal Australasian College of Dental Surgeons, and Zoe provides preventative and general care for every age with a light touch around children."
 }
]
const META: Meta[] = [
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "column": "meta_description",
  "old": "with close to ten years in the Hunter and a special interest",
  "new": "with more than 20 years of experience in dentistry and a special interest"
 },
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "column": "meta_og_description",
  "old": "with close to ten years in the Hunter and a special interest",
  "new": "with more than 20 years of experience in dentistry and a special interest"
 },
 {
  "group": "surgeries",
  "slug": "our-clinic",
  "column": "meta_description",
  "old": "Five surgeries, a dedicated",
  "new": "Four surgeries, a dedicated"
 },
 {
  "group": "surgeries",
  "slug": "our-clinic",
  "column": "meta_og_description",
  "old": "Five surgeries, a dedicated",
  "new": "Four surgeries, a dedicated"
 }
]
const JSONLD: Ld[] = [
 {
  "group": "years",
  "slug": "dr-nisheeth-agrawal",
  "old": "with close to ten years of experience across public and private practice in the Hunter,",
  "new": "with more than 20 years of experience in dentistry, in the Hunter since 2008,"
 }
]

type Db = MigrateUpArgs['db']
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0

async function field(db: Db, f: Field, from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${f.slug} AND s."key" = ${f.key}
      AND c."field_id" = ${f.field} AND coalesce(c."text", '') = ${from}`))
}
async function meta(db: Db, m: Meta, from: string, to: string) {
  if (m.column === 'meta_description') {
    return countOf(await db.execute(sql`
      UPDATE "pages" SET "meta_description" = replace("meta_description", ${from}, ${to})
      WHERE "page_slug" = ${m.slug} AND position(${from} in coalesce("meta_description", '')) > 0`))
  }
  return countOf(await db.execute(sql`
    UPDATE "pages" SET "meta_og_description" = replace("meta_og_description", ${from}, ${to})
    WHERE "page_slug" = ${m.slug} AND position(${from} in coalesce("meta_og_description", '')) > 0`))
}
async function ld(db: Db, l: Ld, from: string, to: string) {
  return countOf(await db.execute(sql`
    UPDATE "pages" SET "json_ld" = replace("json_ld", ${from}, ${to})
    WHERE "page_slug" = ${l.slug} AND position(${from} in coalesce("json_ld", '')) > 0`))
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const done: Record<string, number> = {}
  const add = (g: string, n: number) => { done[g] = (done[g] ?? 0) + n }
  for (const f of FIELDS) add(f.group, await field(db, f, f.old, f.new))
  for (const m of META) add(m.group, await meta(db, m, m.old, m.new))
  for (const l of JSONLD) add(l.group, await ld(db, l, l.old, l.new))
  const names: Record<string, string> = { bios: 'team bios', years: "Dr Nish's years of experience", surgeries: 'four surgeries', whitening: 'whitening price' }
  const parts = Object.entries(names).map(([g, n]) => `${n} ${done[g] ?? 0}`)
  payload.logger.info(`v2.9.3: copy of 21 Nov placed (${parts.join(', ')}; 0 means already there or changed in the dashboard).`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const f of FIELDS) await field(db, f, f.new, f.old)
  for (const m of META) await meta(db, m, m.new, m.old)
  for (const l of JSONLD) await ld(db, l, l.new, l.old)
}
