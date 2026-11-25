import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * v2.10.0 (25 November 2026): Nish's review of 21 Nov 2026 (Christine's emails
 * "Font", "Re: Font" and "Stock Photos").
 *
 *   - menu: a "New Patients & Offers" item between Services and Fees, with New
 *     Patient Offer (shown only while that offer is on), Current Offers and New
 *     Patients Welcome; the same in the phone menu. "Fees & Payment Options"
 *     becomes "Fees & Payments" (as the phone menu already says) so the menu
 *     fits on one row.
 *   - homepage: the new patient offer section moves up to just after "We're
 *     here to care" and lists what the first visit includes. It still shows
 *     only once the offer period is set (src/golive.config.ts).
 *   - Offers page: the new patient card gets the anchor #new-patient-offer.
 *   - photos: the Cosmetic Dentistry tile shows teeth whitening, and the
 *     Restorative Dentistry tile and page banner show crowns and a bridge.
 *
 * Each change is made only where the page is still exactly as v2.9.3 left it,
 * so anything changed in the dashboard is left alone. A second run changes
 * nothing. On an empty database nothing matches.
 */
type Layout = { slug: string; key: string; old: string; new: string }
type Add = { slug: string; key: string; field: string; kind: string; label: string; value: string }
type Field = { slug: string; key: string; field: string; kind: string; old: string; new: string }
const LAYOUTS: Layout[] = [
 {
  "slug": "_chrome-header",
  "key": "header",
  "old": "      <li>{{list-item-1}}</li>\n",
  "new": "      <li class=\"has-mega\" id=\"offersLi\">\n        <a href=\"{{link-address-46}}\" id=\"offersTrigger\" aria-haspopup=\"true\" aria-expanded=\"false\" aria-controls=\"offersPanel\">New Patients &amp; Offers\n          <svg class=\"chev\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m6 9 6 6 6-6\"/></svg>\n        </a>\n        <div class=\"vm\" id=\"offersPanel\" role=\"region\" aria-label=\"New Patients and Offers menu\">\n          <!--offer:newPatient--><a class=\"vm-item\" href=\"{{link-address-47}}\"><span class=\"vm-thumb\"><img src=\"{{image-39}}\" alt=\"{{image-description-alt-text-39}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-38}}</b><span>{{text-14}}</span></span></a><!--/offer-->\n          <a class=\"vm-item\" href=\"{{link-address-48}}\"><span class=\"vm-thumb\"><img src=\"{{image-40}}\" alt=\"{{image-description-alt-text-40}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-39}}</b><span>{{text-15}}</span></span></a>\n          <a class=\"vm-item\" href=\"{{link-address-49}}\"><span class=\"vm-thumb\"><img src=\"{{image-41}}\" alt=\"{{image-description-alt-text-41}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-40}}</b><span>{{text-16}}</span></span></a>\n        </div>\n      </li>\n      <li>{{list-item-1}}</li>\n"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "old": "  <a href=\"{{link-address-39}}\">{{link-text-7}}</a>",
  "new": "  <button class=\"mm-services\" data-panel=\"mmOffersGrid\" aria-expanded=\"false\">New Patients &amp; Offers <svg class=\"chev\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></svg></button>\n  <div class=\"mm-list\" id=\"mmOffersGrid\">\n    <!--offer:newPatient--><a class=\"vm-item\" href=\"{{link-address-42}}\"><span class=\"vm-thumb\"><img src=\"{{image-33}}\" alt=\"{{image-description-alt-text-33}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-33}}</b><span>{{text-14}}</span></span></a><!--/offer-->\n    <a class=\"vm-item\" href=\"{{link-address-43}}\"><span class=\"vm-thumb\"><img src=\"{{image-34}}\" alt=\"{{image-description-alt-text-34}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-34}}</b><span>{{text-15}}</span></span></a>\n    <a class=\"vm-item\" href=\"{{link-address-44}}\"><span class=\"vm-thumb\"><img src=\"{{image-35}}\" alt=\"{{image-description-alt-text-35}}\" loading=\"lazy\"></span><span class=\"vm-txt\"><b>{{card-title-35}}</b><span>{{text-16}}</span></span></a>\n  </div>\n  <a href=\"{{link-address-39}}\">{{link-text-7}}</a>"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "old": "      <p>{{paragraph-1}}</p>\n",
  "new": "      <p>{{paragraph-1}}</p>\n      <ul class=\"os-list\">\n        <li>{{list-item-1}}</li>\n        <li>{{list-item-2}}</li>\n        <li>{{list-item-3}}</li>\n        <li>{{list-item-4}}</li>\n        <li>{{list-item-5}}</li>\n      </ul>\n"
 },
 {
  "slug": "offers",
  "key": "offers-03-current",
  "old": "<!--offer:newPatient--><div class=\"offer-card rv\">",
  "new": "<!--offer:newPatient--><div class=\"offer-card rv\" id=\"new-patient-offer\">"
 }
]
const ADDS: Add[] = [
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "link-address-46",
  "kind": "href",
  "label": "Link address",
  "value": "/offers"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "link-address-47",
  "kind": "href",
  "label": "Link address",
  "value": "/offers#new-patient-offer"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-39",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-0f78085cc7.webp"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-description-alt-text-39",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "card-title-38",
  "kind": "richtext",
  "label": "Card title",
  "value": "New Patient Offer"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "text-14",
  "kind": "richtext",
  "label": "Text",
  "value": "Your first visit: check-up, X-rays, clean and fluoride"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "link-address-48",
  "kind": "href",
  "label": "Link address",
  "value": "/offers"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-40",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-0f78085cc7.webp"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-description-alt-text-40",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "card-title-39",
  "kind": "richtext",
  "label": "Card title",
  "value": "Current Offers"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "text-15",
  "kind": "richtext",
  "label": "Text",
  "value": "Our current offers, each with its price and terms"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "link-address-49",
  "kind": "href",
  "label": "Link address",
  "value": "/new-patients"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-41",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-6b9feba35d.webp"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "image-description-alt-text-41",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "card-title-40",
  "kind": "richtext",
  "label": "Card title",
  "value": "New Patients Welcome"
 },
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "text-16",
  "kind": "richtext",
  "label": "Text",
  "value": "We make getting started easy and stress-free"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "link-address-42",
  "kind": "href",
  "label": "Link address",
  "value": "/offers#new-patient-offer"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-33",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-0f78085cc7.webp"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-description-alt-text-33",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "card-title-33",
  "kind": "richtext",
  "label": "Card title",
  "value": "New Patient Offer"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "text-14",
  "kind": "richtext",
  "label": "Text",
  "value": "Your first visit: check-up, X-rays, clean and fluoride"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "link-address-43",
  "kind": "href",
  "label": "Link address",
  "value": "/offers"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-34",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-0f78085cc7.webp"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-description-alt-text-34",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "card-title-34",
  "kind": "richtext",
  "label": "Card title",
  "value": "Current Offers"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "text-15",
  "kind": "richtext",
  "label": "Text",
  "value": "Our current offers, each with its price and terms"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "link-address-44",
  "kind": "href",
  "label": "Link address",
  "value": "/new-patients"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-35",
  "kind": "image",
  "label": "Image",
  "value": "/images/img-6b9feba35d.webp"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "image-description-alt-text-35",
  "kind": "alt",
  "label": "Image description (alt text)",
  "value": ""
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "card-title-35",
  "kind": "richtext",
  "label": "Card title",
  "value": "New Patients Welcome"
 },
 {
  "slug": "_chrome-mobileMenu",
  "key": "mobileMenu",
  "field": "text-16",
  "kind": "richtext",
  "label": "Text",
  "value": "We make getting started easy and stress-free"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "field": "list-item-1",
  "kind": "richtext",
  "label": "List item",
  "value": "Full exam"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "field": "list-item-2",
  "kind": "richtext",
  "label": "List item",
  "value": "Treatment plan"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "field": "list-item-3",
  "kind": "richtext",
  "label": "List item",
  "value": "X-rays"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "field": "list-item-4",
  "kind": "richtext",
  "label": "List item",
  "value": "Scale and clean"
 },
 {
  "slug": "index",
  "key": "index-07-offers",
  "field": "list-item-5",
  "kind": "richtext",
  "label": "List item",
  "value": "Fluoride"
 }
]
const FIELDS: Field[] = [
 {
  "slug": "_chrome-header",
  "key": "header",
  "field": "list-item-1",
  "kind": "richtext",
  "old": "<a href=\"/payment-options\">Fees &amp; Payment Options</a>",
  "new": "<a href=\"/payment-options\">Fees &amp; Payments</a>"
 },
 {
  "slug": "index",
  "key": "index-03-services",
  "field": "image-3",
  "kind": "image",
  "old": "/images/img-325c8f1992.webp",
  "new": "/images/img-f4fe7ffc4c.webp"
 },
 {
  "slug": "index",
  "key": "index-03-services",
  "field": "image-4",
  "kind": "image",
  "old": "/images/img-185b536179.webp",
  "new": "/images/img-2732f36440.webp"
 },
 {
  "slug": "restorative-dentistry",
  "key": "restorative-dentistry-02-top",
  "field": "image-1",
  "kind": "image",
  "old": "/images/img-185b536179.webp",
  "new": "/images/img-2732f36440.webp"
 }
]
const ORDER: { slug: string; old: string[]; new: string[] } = {
 "slug": "index",
 "old": [
  "index-01-top",
  "index-02-about",
  "index-03-services",
  "index-04-know-us",
  "index-05-transformations",
  "index-06-team",
  "index-07-offers",
  "index-08-faq",
  "index-09-contact",
  "index-10-map-and-address",
  "index-11-disclaimer"
 ],
 "new": [
  "index-01-top",
  "index-02-about",
  "index-07-offers",
  "index-03-services",
  "index-04-know-us",
  "index-05-transformations",
  "index-06-team",
  "index-08-faq",
  "index-09-contact",
  "index-10-map-and-address",
  "index-11-disclaimer"
 ]
}

type Db = MigrateUpArgs['db']
const countOf = (r: unknown) => (r as { rowCount?: number })?.rowCount ?? 0
const rowsOf = (r: unknown) => ((r as { rows?: Record<string, unknown>[] })?.rows ?? [])

// The new layouts contain the old ones (the new markup is added around them), so the
// check is on the new markup: up only where it is not there yet, down only where it is.
async function layout(db: Db, l: Layout, dir: 'up' | 'down') {
  const [from, to] = dir === 'up' ? [l.old, l.new] : [l.new, l.old]
  const where = dir === 'up' ? sql`position(${l.new} in s."template") = 0` : sql`position(${l.new} in s."template") > 0`
  return countOf(await db.execute(sql`
    UPDATE "pages_sections" AS s SET "template" = replace(s."template", ${from}, ${to})
    FROM "pages" AS p
    WHERE s."_parent_id" = p."id" AND p."page_slug" = ${l.slug} AND s."key" = ${l.key}
      AND position(${from} in s."template") > 0 AND ${where}`))
}
async function add(db: Db, a: Add, needs: string) {
  const text = a.kind === 'href' || a.kind === 'image' ? null : a.value
  const link = a.kind === 'href' ? a.value : null
  const builtIn = a.kind === 'image' ? a.value : null
  return countOf(await db.execute(sql`
    INSERT INTO "pages_sections_content" ("_order", "_parent_id", "id", "field_id", "kind", "label", "text", "link", "built_in")
    SELECT coalesce((SELECT max(f."_order") FROM "pages_sections_content" AS f WHERE f."_parent_id" = s."id"), 0) + 1,
           s."id", substr(md5(random()::text || clock_timestamp()::text || s."id" || ${a.field}), 1, 24),
           ${a.field}, ${a.kind}, ${a.label}, ${text}, ${link}, ${builtIn}
    FROM "pages_sections" AS s JOIN "pages" AS p ON s."_parent_id" = p."id"
    WHERE p."page_slug" = ${a.slug} AND s."key" = ${a.key} AND position(${needs} in s."template") > 0
      AND NOT EXISTS (SELECT 1 FROM "pages_sections_content" AS f WHERE f."_parent_id" = s."id" AND f."field_id" = ${a.field})`))
}
async function field(db: Db, f: Field, from: string, to: string) {
  if (f.kind === 'image') {
    return countOf(await db.execute(sql`
      UPDATE "pages_sections_content" AS c SET "built_in" = ${to}
      FROM "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${f.slug} AND s."key" = ${f.key}
        AND c."field_id" = ${f.field} AND c."built_in" = ${from} AND c."image_id" IS NULL`))
  }
  return countOf(await db.execute(sql`
    UPDATE "pages_sections_content" AS c SET "text" = ${to}
    FROM "pages_sections" AS s, "pages" AS p
    WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${f.slug} AND s."key" = ${f.key}
      AND c."field_id" = ${f.field} AND coalesce(c."text", '') = ${from}`))
}
async function reorder(db: Db, from: string[], to: string[]) {
  const rows = rowsOf(await db.execute(sql`
    SELECT s."id", s."key" FROM "pages_sections" AS s JOIN "pages" AS p ON s."_parent_id" = p."id"
    WHERE p."page_slug" = ${ORDER.slug} ORDER BY s."_order"`))
  if (rows.map((r) => String(r.key)).join('|') !== from.join('|')) return 0
  const id = new Map(rows.map((r) => [String(r.key), String(r.id)]))
  for (const [i, k] of to.entries()) await db.execute(sql`UPDATE "pages_sections" SET "_order" = ${i + 1} WHERE "id" = ${id.get(k)}`)
  return 1
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  let layouts = 0, adds = 0, fields = 0
  for (const l of LAYOUTS) layouts += await layout(db, l, 'up')
  for (const a of ADDS) {
    const l = LAYOUTS.find((x) => x.slug === a.slug && x.key === a.key)
    adds += await add(db, a, l ? l.new : '')
  }
  for (const f of FIELDS) fields += await field(db, f, f.old, f.new)
  const moved = await reorder(db, ORDER.old, ORDER.new)
  payload.logger.info(
    `v2.10.0: menu, homepage offer section and photos placed (${layouts} layouts, ${adds} new fields, ${fields} words or photos changed, `
      + `offer section ${moved ? 'moved up the homepage' : 'left where it is'}; 0 means already there or changed in the dashboard).`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await reorder(db, ORDER.new, ORDER.old)
  for (const f of FIELDS) await field(db, f, f.new, f.old)
  for (const a of ADDS) {
    await db.execute(sql`
      DELETE FROM "pages_sections_content" AS c USING "pages_sections" AS s, "pages" AS p
      WHERE c."_parent_id" = s."id" AND s."_parent_id" = p."id" AND p."page_slug" = ${a.slug} AND s."key" = ${a.key}
        AND c."field_id" = ${a.field}`)
  }
  for (const l of LAYOUTS) await layout(db, l, 'down')
}
