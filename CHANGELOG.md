# Changelog

All notable changes to the Tooth n Care website.

## [2.10.0] - 2026-11-25

Nish's review of the preview on a laptop (Christine's emails of 21 Nov 2026,
9:11 PM to 10:42 PM). Update to the existing repository, on top of v2.9.3
(`64c43b8`). Not live yet: this round is for the practice to approve.

### Changed

- **Header** (email "Font"): the address and email in the top bar are larger
  (11 to 13 px), medium weight, and in the aqua they used to turn on hover
  (`#7FF6F0`, white on hover); the logo is larger (46 to 54 px tall on
  desktop); the menu is a little larger and bolder (11.5 px 500 to 12.5 px
  600); the phone number and Book Online buttons are larger and bolder
  (12 to 13 px, 500 to 600), the phone button now with a bright edge on a dark
  fill and white text. The homepage banner's Book Online and phone buttons
  match (14 to 15 px, 600). The header keeps its height at every width.
  - 1024 to 1240 px: a step smaller (logo 46 px, menu 11.5 px) so the menu
    still fits on one row with the new item.
  - Below 1024 px tablets use the phone menu (logo, Book Online, menu
    button). Before, the desktop menu pushed Book Online off the screen at
    768 px.
  - Phones up to 430 px: the logo is a little smaller so the menu button is
    fully on screen (it sat partly off the right edge at 390 px).
  - Light mode (the footer switch): the top bar words are a deep teal so they
    stay readable.
- **Menu** (emails "Font" and "Re: Font"): a "New Patients & Offers" item
  between Services and Fees, with New Patient Offer (shown only while that
  offer is switched on), Current Offers and New Patients Welcome; the same in
  the phone menu. "Fees & Payment Options" becomes "Fees & Payments", as the
  phone menu already says, so the menu fits.
- **Homepage new patient offer**: the section moves up to just after "We're
  here to care", and lists what the first visit includes (full exam,
  treatment plan, X-rays, scale and clean, fluoride, all from its approved
  wording). It still shows only once the offer period is set in
  `src/golive.config.ts`, so the public homepage does not change yet. The
  Offers page's new patient card gets the anchor `#new-patient-offer`.
- **Service photos** (email "Stock Photos"): the Cosmetic Dentistry tile now
  shows teeth whitening (the photo already used for Teeth Whitening on the
  Cosmetic Dentistry page); the Restorative Dentistry tile and page banner
  show crowns and a bridge (the photo already used for Crowns & Bridges).
  The Preventative tile is unchanged: the old cosmetic photo is a clear
  aligner in its case, not a mouthguard.
- **Dr Dimple**: her photo (email "Dr Dimple", 9:11 PM) on her Our Team card
  and homepage slide, cropped to match Dr Rav's portrait. Her card and slide
  no longer carry the orthodontics line added in v2.9.3: no orthodontics
  wording until her registration is confirmed. Title stays Dentist.
- Migration `20261125_100000_review_21nov` makes the menu, offer section and
  photo changes in the dashboard database, only where nothing was changed
  there. Undo puts v2.9.3 back.

### Added

- **Tooth glow** (email "Background"), an option for Nish to see, switched
  off: `LOOK.toothGlow` in `src/look.config.ts`. A faint glow of the tooth
  from the site's own icons behind "Your Visits & Our Practice" (FAQ), "What
  we use the laser for" and "Related pages" (Our Team). Not on the Laser
  Dentistry banner, which is a photo. Dark mode only.
- **Client guide** (`docs/CLIENT-GUIDE.md` and `Tooth-n-Care-Website-Guide.pdf`,
  version 2.9.3): a "Where to change what" table at the start; new
  screenshots of the Team screen with the staff photos switched on, the team
  photo help on Dr Rav's card, and a dentist's card in the page editor
  (replacing ones that showed the old bios and the letter R).

### Fixed

- The go-live switch treated any span whose class started with "offer" as an
  offer, so the "New Patients" tag on the homepage offer section would have
  disappeared once the offer was switched on. Only the class "offer" itself
  counts now (a check added to `qa:golive`).

## [2.9.3] - 2026-11-21

The team photos, and the practice's copy corrections of 21 Nov 2026 (Nish's
clinician bios, four surgeries, the whitening price). Update to the existing
repository, on top of v2.9.2 (`ce5727f`).

### Added (first commit)

- **Support team photos on the website**: Debbie, Kathryn, Riley and Layeba
  (loaded in v2.9.1), plus Holly and Christine. Permission: Christine, 20 Nov
  2026 5:57 PM, "given all ok consent to have photo up", sent with the staff
  photos; Rowayne asked on 21 Nov 2026 for the team photos to be added.
  Logged in `docs/GO-LIVE.md` section 7c.
  - `public/images/team-holly.webp`: the newer of Christine's two photos of
    Holly (7:54 PM, "slightly better quality than my first"), as Rowayne
    asked.
  - `public/images/team-christine.webp`: the photo Christine sent of herself
    (7:59 PM).
  - Both matched by the name on Christine's email, never by the picture;
    800 x 600 WebP, no metadata, cropped and resized only, with the same crop
    rule as the other four (560 x 420 of the 1448 x 1086 original, face in
    the middle, eyes at the same height). Christine's photo was taken closer,
    so it uses a slightly wider crop (680 x 510) and the top of her hair is
    cropped.
  - Migration `20261121_100000_staff_photos_on`: loads the two new photos
    and switches on "Show photo on website (permission confirmed)" for the
    six, only where the row still has the photo GYA loaded and no photo was
    chosen in the dashboard. Undo switches them off again.
  - Manifest and photo descriptions updated.

### Changed (second commit)

- **Clinician bios** (Nish, to Christine 20 Nov 2026 10:30 PM; forwarded
  21 Nov 2026), as Rowayne shortened them for the cards (21 Nov 2026,
  7:51 AM):
  - Our Team cards for Dr Nish, Dr Nav, Dr Rav and Zoe; Dr Rav's homepage
    slide and her profile page (still switched off).
  - Dr Dimple: full name "Dr Dimple Sharma" kept for reference, the card and
    slide still say "Dr Dimple"; a one-line bio on her card and slide
    (`DR_DIMPLE.bio`). Title stays Dentist.
  - Not added until the practice confirms the exact names: Dr Nav's
    Postgraduate Diploma and ICOI Fellowship, Dr Dimple's degrees. Dr Rav's
    qualifications are still to come.
- **Dr Nish's experience**: his bio says more than 20 years in dentistry, in
  the Hunter since 2008. Every "nearly ten years" (or "close to a decade")
  was corrected: his card and homepage slide, his profile page (intro, about,
  the highlights line, the page description and the structured data), and
  the about paragraph on ten suburb pages. Only those words changed.
- **Four surgeries, not five** (Nish, 21 Nov 2026): Our Clinic heading,
  wording and page description, and the "Tour Our Clinic" card on Our Team. The
  recovery room stays.
- **Whitening price**: $750, including a take-home whitening kit valued at
  $350 at no extra cost (Nish, 21 Nov 2026), on the Offers card and in the
  Teeth Whitening cost wording; `OFFERS.whitening.priceConfirmed` is now
  true. The offer still shows only once its period is set, so the public
  pages do not change yet. The dashboard note no longer asks for the price.
  The check after the build also looks for "$750" while the offer is off.
- Migration `20261121_110000_client_copy_21nov` makes the same changes in the
  dashboard database, only where the words are still exactly as before.
  Undo puts them back.

## [2.9.2] - 2026-11-20

Dr Rav's photo, and the latest from Christine's "New photo" thread (20 Nov
2026). Update to the existing repository, on top of v2.9.1.

### Fixed (first commit)

- **The Vercel build of v2.9.1 stopped at the check after the build**
  (20 Nov 2026, 10:37 PM). Before the domain switch the site is built for the
  preview address (`NEXT_PUBLIC_SERVER_URL`), so its canonicals, `og:url` and
  sitemap point there and a preview is kept out of Google, but the check
  expected `https://www.toothncare.com.au` and indexable pages, so it flagged
  every page. The check now uses the address the site was built for (the same
  order as `siteUrl()`), accepts that address in links, and allows noindex
  until the site is on the live domain. On www.toothncare.com.au it is as
  strict as before. Reproduced locally with Vercel's settings: 283 problems
  with the old check, 0 with the new one. The old-address check, `[VERIFY]`,
  offers and links are unchanged. Vercel kept serving the last good
  deployment meanwhile.

### Added (second commit)

- **Dr Rav's photo** (Christine, 5:35 PM: taken in reception to match the
  other dentists; Dr Nish and Dr Nav keep their current photos, unchanged):
  `public/images/dr-rav.webp`, 1200 x 900 sRGB WebP, 39 KB, no metadata.
  Cropped and resized only, so her head size, eye line and position in the
  frame match the part of Dr Nish's and Dr Nav's photos that the cards and the
  slider show (the 4:3 middle of their 1600 x 900 files). A 1600 x 900 file
  like theirs would have meant enlarging the 1448 x 1086 original, so it is
  4:3, which is exactly what the card and the slide display.
  - on her Our Team card and her homepage slide, in place of the letter R
  - on her profile page and in its structured data ("image"), ready for when
    the page is switched on (it stays off until her bio arrives)
  - in the Media Library import, so the practice can see and replace it
  - photo descriptions "Dr Rav, Dentist", from the name setting (so it becomes
    her full name if `showFullName` is ever switched on)
  - no colour wash on her card and profile photo, as the other dentists'
    portraits have none (`no-tint`, `public/styles/common.css`)
- Migration `20261120_130000_dr_rav_photo`: the same for the dashboard
  database, only where her card, slide and profile page still show the
  placeholder and no photo was chosen in the dashboard. A second run changes
  nothing.

### Changed

- `docs/GO-LIVE.md`, the handover steps and the README: the go-live process
  starts Monday 23 Nov 2026 (about 8 hours of process and checks, per Rowayne
  to Christine, 20 Nov); the exact switch time is to be confirmed. "Missing for
  Dr Rav" is now the bio, qualifications and name choice.
- The staff photo permission log notes Christine's 5:57 PM "given all ok
  consent to have photo up" as an open question; the four switches stay off
  until Rowayne confirms it covers Deb, Kathryn, Riley and Layeba. Holly's
  photo has still not reached the build.
- `docs/CLIENT-GUIDE.md` and the PDF: the dentist photo steps no longer use
  Dr Rav as the example.

## [2.9.1] - 2026-11-20

Christine's approval, Dr Rav before launch, and the staff photos (Rowayne's
emails of 20 November 2026). Update to the existing repository, on top of
v2.9.0. Two commits, so either can be held back on its own.

### Approval, launch date and Dr Rav (first commit)

- **Client approval recorded:** Christine confirmed on 20 Nov 2026 that the
  practice is happy to go ahead. The launch date is not confirmed (Monday
  23 Nov was proposed): the Monday wording is gone from `docs/GO-LIVE.md`, the
  handover steps and the update script.
- **Privacy Policy and Terms:** treated as approved with the whole site, as
  both were on the preview Christine reviewed. `GO_LIVE.legalApproved` in
  `src/golive.config.ts` now reads Christine Zammit, 2026-11-20, approval of
  the whole site, so the build no longer warns. Their reviewer notes were
  already left out by the go-live switch, so the pages do not change.
- **Dr Rav ready for her photo and bio**, nothing invented and nothing shown
  until filled in:
  - an empty "Add words" line under her name on the Our Team card and on her
    homepage slide, which the practice can fill in from the dashboard. Empty,
    it renders nothing (new `data-hide-empty` marker, `src/lib/parts.ts`)
  - her profile page, `content/pages/dr-rav.json` at `/dr-rav`, built from Dr
    Nav's layout with her name, "Dentist", her AHPRA line and a Person entry
    in the structured data. It stays off the website (no page, no link, not in
    the sitemap or the 404 list) until `PRACTITIONERS.rav.profilePage` is
    true, and the build stops if it is switched on before the page has its
    bio. The address stays `/dr-rav` whichever name is shown.
  - the "View profile" links on her card and slide appear with the page.
  - structured data leaves out the see-through placeholder picture behind a
    monogram, so no page claims it as a photo.
- Migration `20261120_110000_rav_profile_ready`: the same card and slide
  change for the dashboard database, only where the layout is still as v2.9.0
  had it; a second run changes nothing.
- `docs/CLIENT-GUIDE.md` and the PDF: "Adding a new dentist's photo and bio".
- The check after every build now also opens each page's own stylesheets, so a
  new page without its styles stops the build.

### Staff photos (second commit)

- **Photo switch per person:** a support team photo now shows on Our Team only
  once "Show photo on website (permission confirmed)" is ticked (Team screen,
  for the practice and GYA; `photoApproved` in `content/team.json`). Off, the
  card is exactly as before (the first letter). On, the photo shows with the
  automatic teal treatment in the same 4:3 frame, so nothing moves.
- **Deb, Kathryn, Riley and Layeba:** the photos Christine sent on 20 Nov 2026
  are loaded (`public/images/team-deb.webp`, `-kathryn`, `-riley`, `-layeba`),
  each matched by her email's subject or body. Cropped 4:3 and resized only,
  800 x 600 sRGB WebP, metadata stripped, about 21 to 27 KB each. All four
  switches are **off** until each person's permission is confirmed. They are
  also in the Media Library import, described with name and role.
- **Holly:** her card takes a photo from the Team screen like the others. Her
  consent is confirmed, so it goes on, shown, as soon as the file arrives.
- The Team screen has a Replace button and a "Show photo on website
  (permission confirmed)" column; Remove photo also unticks it.
- Migration `20261120_120000_staff_photo_switch`: the two Team columns (added
  only if missing), anyone with a photo already chosen keeps showing it, and
  the four photos are loaded switched off (only for a person with no photo of
  their own). A second run changes nothing.
- `docs/GO-LIVE.md`: the permission log and the questions for the practice;
  `docs/CLIENT-GUIDE.md` and the PDF: "Showing a staff photo".

## [2.9.0] - 2026-11-20

Go-live check of the dashboard, the old addresses and SEO, ahead of the planned
switch on Monday 23 November (after Nish's OK). Update to the existing
repository (started from `f15e43b`, v2.8.1).

### Fixed

- **Photo uploads with Vercel Blob:** the `media` table was missing the
  `prefix` and `_objectkey` columns the Blob storage plugin writes, so with a
  Blob token set the Media Library answered with an error (500) and uploads
  failed. New migration `20261120_090000_blob_upload_columns` adds them (if
  not already there), and the plugin now always writes them
  (`alwaysInsertFields: true`). `payload migrate:create` reports no schema
  changes left. The live preview is very likely affected until this deploys.
- **A brand new database** now migrates from scratch: migration
  `20261104_100000_team_and_directions` read columns that only exist after
  later migrations; it now removes the old team row with plain SQL.
- **Large phone photos** (6 to 10 MB, 4032 x 3024) are made smaller in the
  browser (longest side 2400, then 2000 or 1600 if needed) before they upload,
  so they no longer hit Vercel's 4.5 MB request limit. A 7.6 MB photo uploaded
  as 0.9 MB and was stored as a 2400 x 1800 WebP.
- **iPhone photos (HEIC):** converted in the browser where it can, otherwise a
  plain message explains how to send it as a JPG. Too-large uploads also get a
  plain message instead of a generic error.
- **Deleting a photo that is still used:** an Editor is stopped and shown where
  it is used (pages, share pictures, team, posts, settings); an Admin is warned
  with the same list first. Also enforced on the server.
- **Redirect chains:** old suburb folders with a closing slash (`/maitland/`)
  took two hops. Next.js no longer strips closing slashes by itself
  (`skipTrailingSlashRedirect`), 11 rules send each folder straight to its
  page, and a final rule removes a closing slash from anything else in one hop.
- **The check after the build** stopped its local server properly, so the
  build finishes instead of waiting.

### Added (second commit)

- **The go-live switch** (`src/golive.config.ts`, `src/lib/golive.ts`):
  `[VERIFY]` notes never reach a public page, and the $199 new patient visit,
  the 5% seniors discount and the discounted ZOOM whitening show only once
  their offer period (and, for whitening, the price) is entered. Dated offers
  drop off by themselves after their end date. The wording itself is
  unchanged: the dashboard still shows it, outlined, with a note. The Offers
  and Payment Options descriptions and the home page's site search list follow
  the switch. See `docs/GO-LIVE.md` section 7a for what each hidden item needs.
- **Migration `20261120_100000_golive_offers_verify`:** the same marks in a
  database imported before v2.9.0, plus the 11 slash redirects. Each value
  changes only where it is still exactly as v2.8.1 shipped it, so dashboard
  edits are kept and named in the build log; a second run changes nothing.
- **Checks after every build** (`scripts/check-after-build.mjs`, also
  `npm run qa:built`): every one of the 770 old addresses
  (`docs/seo/old-urls.txt`) must land in one redirect with no 404; every page
  in the sitemap, plus the Privacy Policy and Terms, must answer 200, carry no
  `[VERIFY]` or "to be confirmed" wording and no words of a switched-off
  offer, have its canonical on www, and link only to addresses that answer 200
  directly; GA4 or the Meta Pixel may only be switched on once the Privacy
  Policy stops saying "only the cookies necessary". Dashboard photos
  (`/api/media/file/...`) that do not answer during the build are a warning,
  never a failure. A reminder prints until `GO_LIVE.legalApproved` is filled in.
- `npm run qa:golive`: the switch on fixed dates (off, before the start, first
  and last day, after the end, combined offers, the whitening price).
- `scripts/seo/check-url-parity.mjs` and `scripts/seo/export-live-site.sh`
  (curl and perl only): export the live site's addresses, titles,
  descriptions, canonicals and tracking codes, and compare them with the new
  site. Results: `docs/SEO-URL-PARITY.md`, `docs/seo/url-parity-2026-11-20.csv`.
- **Docs:** `docs/CLIENT-GUIDE.md` rewritten for the practice (photos, wording,
  undo, the blog, enquiries, what to ask GYA, the AHPRA rules) with new
  screenshots, and `docs/Tooth-n-Care-Website-Guide.pdf` (replaces
  `CLIENT-GUIDE.pdf`); `docs/HANDOVER-STEPS-FOR-GYA.md`;
  `docs/CHROME-DASHBOARD-CHECK.md`; `docs/GO-LIVE.md` updated.
- `qa:banned` fails on a placeholder email address.

### Changed

- **Editors can no longer** change a page's address, hide a page from Google,
  change the enquiry recipients or switch the whole site to noindex (GYA only,
  in the dashboard and on the server). The SEO tab shows "Changing a page's
  address can affect Google rankings. Please ask GYA."
- **Enquiry recipients:** the made-up SmileOX intake address is gone from the
  compiled fallback, `content/site-settings.json`, `.env.example` and (by the
  migration) the database. Enquiries go to reception and
  rowayne@gyaclients.com until the real address is added in Site Settings, and
  the form never emails an address that looks like a placeholder.
- Site Settings explains where opening hours and health funds are changed.
- Upload boxes accept iPhone photos and say that large photos are made smaller.

### Not changed

- No price, offer wording or legal wording was edited; hidden items come back
  word for word.
- Next.js stays on 16.4.4 in this release. 16.4.5 (3 November 2026) fixes
  seven advisories, mostly in `use cache` and the image optimiser (this site
  uses neither) and one about HttpOnly cookies on Edge routes. Recommended as
  its own small release after go-live, with a full test.

## [2.8.1] - 2026-11-19

Christine's email of 19 November 2026. Update to the existing repository
(started from `ca579ba`, v2.8.0, which is on main and live on the preview).

### Changed

- **Mursal**, not Mursel (Christine's spelling fix), in the Team list
  (`content/team.json`) and so on the support team card. Historical records
  (earlier CHANGELOG entries, the v2.7.0 migration data) keep the old spelling
  as they were.
- **Dr Dimple is on the website**: `DR_DIMPLE.show = true` in
  `src/team.config.ts`. Her card is on Our Team after Dr Rav and her slide is
  04/ in the homepage slider (Zoe 05/), with the D monogram. Her role is
  "Dentist": `DR_DIMPLE.specialistOrthodontics` stays false until the practice
  confirms specialist registration in Orthodontics, as "orthodontist" is a
  protected title. No "orthodontist" or "orthodontics" on her card.
- **Our Team intro** now reads "Four dentists, an oral health therapist and a
  support team who will actually remember you between visits." It appears
  only on Our Team.
- The confirmed specialist version now says **"Specialist Orthodontist"** on
  her card (was "Orthodontist"), and the intro "Three dentists, a specialist
  orthodontist, an oral health therapist and a support team ...". Built and
  checked, not shipped.
- **Share picture** (shown when a link is posted on Facebook, Messages and
  the like): the shopfront photo without the NOW OPEN A-frame (pack photo 33),
  cropped to 1200 x 630, `/images/img-b0fc5965f7.jpg`. JPEG rather than WebP, so every
  app that shows link previews can read it. It is now the site default
  (`src/site.config.ts`, `src/dashboard/brand.ts`) and the picture on Areas We
  Serve and the ten suburb pages, including their structured data. The old
  picture (`img-0451df991a.webp`) is removed.
- **Contact:** the "[VERIFY] form endpoint not yet connected - submissions are
  disabled until a secure destination is confirmed." note under the form is
  gone. The form is connected: it posts to `/api/enquiry`, which saves every
  enquiry in the dashboard and emails it through SMTP2GO. Sending a real test
  enquiry stays on the go-live checklist.

### Not changed, waiting on the practice

- The other seven `[VERIFY]` notes (Offers twice, Teeth Whitening, FAQ,
  Privacy Policy twice, Terms) stay on the pages: they need prices, a yes or
  no on Invisalign, and the practice's approval of legal wording. Each is
  listed with its exact text and the question to ask in `docs/GO-LIVE.md`,
  section 7a (new: go-live blockers).

### Dashboard (migration, additive)

- `20261119_090000_dimple_mursal_share_image`: renames the Team list entry
  only if it still says "Mursel"; changes the share picture on each of the 11
  pages only where it is still the old one and none was chosen in the
  dashboard (and in the structured data only where the old address is still
  there); removes the Contact note only where the wording is still exactly as
  shipped. Anything else is left alone, and pages still naming the old
  picture are listed in the build log.

### Also

- `scripts/qa-allow.json`: the Dr Dimple switch wording is recorded as
  reviewed (it only shows a specialist title once confirmed; `qa:roles`
  still enforces that).
- `docs/HOW-TO-UPDATE.md`, `README-CMS.md`: Dr Dimple shown, waiting list and
  `[VERIFY]` list updated.

## [2.8.0] - 2026-11-17

Christine's emails of 13 to 16 November 2026, and the practice photos she sent
on 17 November. Update to the existing repository (started from `a48295294c25`,
v2.7.1).

### Changed

- **Support team, one list.** `SUPPORT_TEAM.layout` is now `'combined'`: one
  heading ("Our support team"), each person once, with their role under their
  name. Order: Holly and Kathryn (Patient Experience Coordinator), Jorja and
  Ton (Patient Experience and Clinical Care Coordinator), then Debbie, Mursel,
  Christine, Layeba, Malal, Tanu, Libby and Riley (Clinical Care Coordinator).
  Names unchanged. `/support-team` and `/our-team/support-team` still land on
  `#support-team`.
- **Dr Rav.** AHPRA number `DEN0002297808` (Dentist, General registration,
  from the AHPRA public register sent by Christine) now shows on her card and
  slide and in her Team list entry. Full name `Dr Ravneet Kaur Arora` stored;
  the cards still say "Dr Rav". One setting shows the full name instead:
  `PRACTITIONERS.rav.showFullName` in `src/team.config.ts` (the name fields on
  Our Team and the homepage slider are now the placeholder `{{site:ravName}}`).
  Role "Dentist" and the R monogram unchanged.
- **Practice photos.** Real photos of the practice replace stock, generic and
  archive images in 15 places on 9 pages (crop and resize only, converted to
  sRGB WebP, no colour grading, no AI, all metadata including GPS removed).
  Photos 25 (whitening box) and 28 (NOW OPEN sign) not used. Kept: the About
  reception photo, the homepage corridor photo and the dentist portraits.
  12 replaced files are removed from the repository; `img-0451df991a` stays
  (still the share image on 11 pages, see `docs/GO-LIVE.md`).

| Page | Section (slot) | Old image | New photo (from the pack) | File |
| --- | --- | --- | --- | --- |
| Home | 04-know-us (image-1) | `img-3d8678d4cd`, Smile With Confidence corridor (archive) | 21-entry-niche-plants | `img-64aeb84e1c`, 1152 x 648 |
| Home | 04-know-us (image-3) | `img-d7321cde74`, archive reception photo, a near duplicate of the hero on the same page | 33-exterior-shopfront-sign | `img-6d8feac066`, 1200 x 800 |
| Home | 04-know-us (image-4) | `img-bffd1ee4e3`, archive treatment room photo | 03-imaging-room-opg | `img-ff656f6ae4`, 1200 x 675 |
| Home | 04-know-us (image-6) | `img-206de2913e`, stock photo of another clinic | 07-waiting-area-window-1 | `img-8b2603dcae`, 1200 x 675 |
| New Patients | 02-top (image-1) | `img-93537bced9`, archive reception photo, a near duplicate of Getting here on the same page | 09-waiting-area-window-2 | `img-7a2e097922`, 1600 x 900 |
| Nervous Patients | 04-your-pace (image-1) | `img-0353d19136`, staff with a patient (no written approval on file) | 20-waiting-window-seat | `img-c23038ef65`, 810 x 648 |
| Offers | 02-top (image-1) | `img-fe3d21e711`, stock photo (Unsplash) | 26-reception-fiddle-leaf | `img-0f78085cc7`, 1600 x 900 |
| Our Technology | 04-fewer-visits-clearer-answers (image-1) | `img-1f7cba5cc5`, a person at the X-ray unit (no written approval on file) | 03-imaging-room-opg | `img-6d6f276c76`, 1176 x 941 |
| Contact | 02-contact (image-1) | `img-ea37d4d5c9`, archive reception detail | 33-exterior-shopfront-sign | `img-6d8feac066`, 1200 x 800 |
| Envision Your Smile | 02-top (image-1) | `img-0a16f6b55c`, Smile With Confidence corridor (archive) | 01-corridor-glass-doors | `img-ae666fff90`, 1600 x 900 |
| Dentist Tenambit | 05-treatments (image-4) | `img-a23f5c341d`, Smile With Confidence corridor (archive) | 05-treatment-room-1 | `img-362db70deb`, 1200 x 675 |
| Our Clinic | 02-top (image-1) | `img-0451df991a`, shopfront with the NOW OPEN A-frame | 19-waiting-plants-couch | `img-fd60f4158f`, 1152 x 648 |
| Our Clinic | 04-a-few-corners-of-the-practice (image-1) | `img-2b063f35d5`, archive reception photo | 22-reception-desk-plants-2 | `img-510487387a`, 1152 x 648 |
| Our Clinic | 04-a-few-corners-of-the-practice (image-4) | `img-fbc10a1b5d`, Smile With Confidence corridor (archive) | 02-coffee-bar-cup | `img-d8b59c77ac`, 1200 x 675 |
| Our Clinic | 04-a-few-corners-of-the-practice (image-6) | `img-dc466c7abb`, archive treatment room photo | 34-treatment-room-2 | `img-48e611c9ec`, 1200 x 675 |

- Our Clinic: the "[VERIFY] a professional photo shoot is still recommended"
  note under the photos is gone, now the photos are the practice's own.
- `DEFAULTS.siteUrl` is `https://www.toothncare.com.au` (www is the main
  address at go live). `NEXT_PUBLIC_SERVER_URL` still overrides it.
- The homepage team slider no longer points at photos on the old website as a
  fallback (`data-fb`); those addresses stop working at the switch.

### Added (second commit)

- **Dr Dimple, ready and hidden.** A card on Our Team (after Dr Rav) and a
  slide in the homepage slider (after Dr Rav; Zoe becomes 05/), with a D
  monogram. One switch: `DR_DIMPLE.show` in `src/team.config.ts` (false).
  `DR_DIMPLE.specialistOrthodontics` (false) makes her role "Orthodontist"
  only once specialist registration in Orthodontics is confirmed; otherwise
  "Dentist". Placeholders `{{site:dimpleCard}}`, `{{site:dimpleSlide}}`,
  `{{site:zoeSlideNum}}`.
- **Our Team intro counts the team** (`{{site:teamIntroLead}}`):
  - today: "Three dentists, an oral health therapist and a support team who
    will actually remember you between visits."
  - Dr Dimple shown as a dentist: "Four dentists, an oral health therapist and
    a support team ..."
  - Dr Dimple shown as a confirmed specialist: "Three dentists, a specialist
    orthodontist, an oral health therapist and a support team ..."
- **Team photo colour treatment, by CSS** (`public/styles/common.css`): a soft
  teal wash from the top corner and a darker base on support team photos and
  on the Dr Rav and Dr Dimple cards once a photo is added. The photo files are
  never changed, so anything uploaded in the dashboard matches.
- **Photo help in the dashboard** (`src/dashboard/ui/TeamPhotoHelp.tsx`): on
  the Team screen, and next to the photo when a team photo is clicked in the
  page editor: landscape 4:3, at least 800 x 600, head and shoulders, plain
  background, "the colour treatment is added automatically".
- **Team screen:** the role line box shows, in grey, the wording the website
  will use; an **On website** switch hides someone without removing them.
- **Old suburb folders redirect** (42 rules): `/<suburb>/<page>.htm` for the
  31 service pages in all 21 old suburb folders goes where the top level page
  goes (`/maitland/dental-implants.htm` to `/dental-implants`); each folder
  itself goes to its suburb page, or `/areas-we-serve`.
- `docs/GO-LIVE.md`: DNS findings, the switch step by step, what moves with
  the domain, old address coverage, SMTP2GO, before and after checklists.
- `docs/CLIENT-GUIDE.md` and `docs/CLIENT-GUIDE.pdf`: a two page guide for the
  practice, with screenshots.
- `npm run qa:roles` also fails on "orthodontist" anywhere on the site while
  Dr Dimple is hidden or unconfirmed (the general FAQ question "Should my
  seven-year-old see an orthodontist?" is allowed).

### Dashboard (migrations, additive)

- `20261117_090000_practice_photos`: each of the 15 photo slots, only where it
  still holds the shipped photo and none was chosen in the dashboard; the
  description and stored size only where still the old ones.
- `20261117_100000_team_dimple_redirects`: the layout and wording changes
  above, one piece at a time and only where unchanged; Kathryn moves above
  Jorja only if Jorja is still straight before her; Dr Rav's Team list entry
  gets her full name and number only if it has none; the 42 redirects only
  where that old address has none. Anything changed in the dashboard is left
  alone and named in the build log.

## [2.7.1] - 2026-11-13

### Added (second commit)

- A favicon: the round tooth mark from the Tooth n Care logo, redrawn as a
  vector from the logo file so it stays sharp at every size, in the site's
  aqua with a slightly bolder outline so it reads at browser tab size.
  - `public/icon.svg` (modern browsers), `public/favicon.ico` (16, 32 and
    48px, older browsers and Google results), `public/apple-touch-icon.png`
    (180px, square, for iPhone and iPad home screens), `public/icon-192.png`
    and `public/icon-512.png` with `public/site.webmanifest` (Android).
  - Declared in `src/app/(frontend)/layout.tsx`, so every page and blog post
    gets it.
- The dashboard uses the same icon in its browser tab and in the Google
  preview on the SEO panel (`src/dashboard/brand.ts`; it was the wide logo).

## [2.7.0] - 2026-11-11

Changes from the practice on 11 November 2026 (Christine, three emails). Ships
together with 2.6.0.

### Changed

- Our Team intro: "Three dentists, an oral health therapist and a support team
  who will actually remember you between visits." The hygienist is leaving, so
  the second oral health team slot (`oralHealth2`) is gone from
  `src/team.config.ts`; the sentence is worked out from the one title left.
  Nothing else on the site named the hygienist as a person (checked on every
  page).
- Zoe's title stays "Oral Health Therapist", now confirmed by Nish.
- `/support-team` and `/our-team/support-team` now land on the new support
  team section (`/our-team#support-team`).

### Added (second commit)

- Dr Rav, the third dentist, on Our Team (between Dr Nav and Zoe) and in the
  homepage team slider (slide 3 of 4), as "Dr Rav", "Dentist". No bio,
  profile page or profile link yet. The photo spot shows the letter R until a
  photo is uploaded in the page editor (a transparent placeholder,
  `public/images/img-52e7b1f5ba.webp`, sits over the letter). AHPRA line ready
  (`rav` in `src/team.config.ts`), empty for now.
- A support team section on Our Team, under Nish's headings: Patient
  Experience Coordinators (Holly, Jorja, Kathryn, Ton) and Clinical Care
  Coordinators (Jorja, Ton, Debbie, Mursel, Christine, Layeba, Malal, Tanu,
  Libby, Riley). First names only, a card each with the first letter where a
  photo will go. Rows are centred, so a short last row sits in the middle.
  Built from the Team list by `src/lib/supportTeam.ts` into the placeholder
  `{{site:supportTeam}}`.
- A second layout for it, one combined grid with each person's role line;
  switch with `SUPPORT_TEAM.layout` in `src/team.config.ts`.
- A **Team** screen in the dashboard (`/admin/team`): add, rename, regroup,
  reorder, remove people and choose their photo. The dentists and Zoe stay on
  the Our Team page, linked from there. The Team list can now be edited and
  deleted from by the practice, and has three new fields: Patient Experience
  Coordinator, Clinical Care Coordinator and an optional role line.
- `npm run qa:roles` (now `scripts/qa-roles.ts`) also fails if "hygienist"
  would appear as a member of the team, in anything `src/team.config.ts` fills
  in or in the Team list.

### Not changed

- The registration numbers sent on 11 November are Medicare provider numbers,
  not AHPRA numbers. They are not anywhere in the repository, the content or
  the dashboard; every `ahpraNumber` stays empty.
- No photo changes. The About Us "Who we are" photo in Christine's screenshot
  is the one 2.6.0 already replaces with the reception photo.

### Database

- Migration `20261111_100000_team_support_fields` adds the three Team list
  fields.
- Migration `20261111_110000_team_roster_and_headings`, with its data in
  `src/sitekit/data/release-2-7-0.ts`: replaces the Our Team cards and the
  homepage slider only where they are still exactly as shipped, adds the
  support team section after the cards once (only if the page layout is still
  the shipped one), adds Dr Rav and the support team to the Team list unless
  someone of that name is already there, and points the two redirects at the
  section where they still go to /our-team. Anything skipped is named in the
  build log. Undoing it removes only what it added.

## [2.6.0] - 2026-11-11

Asked for by the practice on 11 November 2026 (Christine).

### Changed

- About Us (Our story) and New Patients (Getting here): the "Smile With
  Confidence" sign photo is replaced by the reception photo the practice sent
  (the lit Tooth n Care sign, the front desk with the tooth logo, and the
  treatment room corridor beyond). Cropped from the 1672 x 941 original to
  each slot's shape, with the whole sign and logo in frame:
  - About Us: `public/images/img-e78e6ffb10.webp`, 1176 x 941 (5:4; the slot
    shows it 5:4 on desktop and 16:10 on phones and tablets).
  - New Patients: `public/images/img-3d49338cd8.webp`, 1672 x 637 (21:8).
  - Description on both: "Tooth n Care reception, with the lit Tooth n Care
    sign above the front desk and the treatment room corridor beyond".
- The homepage About photo (v2.4.0) is unchanged.

### Removed

- `public/images/img-d7098759b1.webp` (the old sign photo). No page uses it
  any more.

### Database

- Migration `20261111_090000_about_reception_photo` makes the same swap in
  the dashboard, only where the photo is still the old one and none has been
  chosen there, and the description only where it is still the old one. A
  slot already changed in the dashboard is left alone and named in the build
  log. Undoing it restores the old file name, so undo it together with the
  code.

## [2.5.0] - 2026-11-06

Getting ready for the practice's confirmation of the oral health team's role
titles and everyone's AHPRA registration numbers (Christine, 5 November).
Nothing visible changes yet, apart from the three "[VERIFY reg. no.]" markers.

### Added (second commit)

- `src/team.config.ts`: the one place for role titles and AHPRA details. It
  holds the oral health team's shared heading, and for Dr Nish, Dr Nav, Zoe and
  the second oral health team member (name to come): name, role title, AHPRA
  number and division. The numbers are empty, marked TODO. The file lists the
  Dental Board of Australia divisions for reference.
- Placeholders in the pages instead of typed role titles, 30 spots on 7 pages:
  the Our Team card, intro and Google description; Zoe's profile (heading,
  intro, credential line, photo description, Google title and description,
  structured data); the related page cards on Dr Nish's and Dr Nav's
  profiles; the FAQ and Check-ups answers that name Zoe's role, including the
  FAQ version Google reads.
- An "AHPRA Reg. No." line on every team card (Our Team and the homepage team
  slider) and on each profile's credential line. While a number is empty it
  renders nothing at all. Styled small and grey (`.ahpra-reg` in
  `public/styles/common.css`).
- Each profile's Person structured data gets an AHPRA `identifier` only when a
  number is filled in (`src/lib/jsonld.ts`).
- Google titles and descriptions can now hold `{{site:...}}` placeholders
  (`src/app/(frontend)/[[...slug]]/page.tsx`).
- The dashboard shows the new placeholders as shaded words, like the phone
  number, and in forms as `{zoe-role}` and so on (`src/dashboard/util.ts`); an
  empty AHPRA placeholder is hidden in the editor (`src/dashboard/render.ts`).
- `npm run qa:roles` (`scripts/qa-roles.mjs`), part of `npm run qa`: fails if a
  role title or a registration placeholder is typed into a page again.
- A malformed AHPRA number, or a title with quotes or angle brackets, stops the
  build with a message naming the line to fix.

### Removed

- The "[VERIFY reg. no.]" markers on Dr Nish's, Dr Nav's and Zoe's profiles.
  The line now reads "..., registered with AHPRA" and gets the number once it
  is filled in.

### Database

- Migration `20261106_090000_role_titles_and_ahpra` makes the same 30 changes
  in the dashboard, each only where the wording is still exactly the old
  wording, and names any spot that was reworded in the dashboard in the build
  log. Data: `src/sitekit/data/release-2-5-0.ts`.

## [2.4.0] - 2026-11-05

Changes the practice asked for on 5 November 2026 (Christine).

### Changed

- Homepage About Us ("We're here to care"): the Smile With Confidence sign
  photo is replaced by the treatment room corridor photo the practice sent.
  The supplied image had a neon frame, glow wave, logo and tooth icon baked
  in; it is cropped to the photo inside the frame (770 x 616, the slot's 5:4
  shape) as `public/images/img-1b9897ccd3.webp`, with the description
  "Tooth n Care treatment room corridor, with numbered rooms and teal wave
  glass panels". The old photo is still used on About (Our story) and New
  Patients (Getting here), so it stays there and the file is kept.
- Our Team: with three cards in a two column grid, the third card sat alone
  with a gap beside it. An odd last card is now centred under the pair above
  it on screens wider than 900px (`public/styles/common.css`). Phones and
  tablets show one card per row as before.

### Removed

- The dental assistant removed in 2.3.0: her photo file
  (`public/images/img-fe35fabe7c.webp`), her entry in the fallback team list
  used for a first import (`docs/build-notes/team-initial.json`), the
  photo's line in `docs/build-notes/remote-map.json`, and the old Support
  Team page from the dashboard's Team group. The redirects from
  `/support-team` and `/our-team/support-team` to `/our-team` added in 2.3.0
  stay.

### Added (second commit)

- `BUILD_WITHOUT_DB=1 npm run build` builds from the content files without
  touching the database, even when a local `.env` points at it. Used by
  `update-and-deploy.sh` for its check build. Vercel never sets it.
- `.vercel` in `.gitignore`, so a folder linked with the Vercel CLI is never
  committed.
- A TODO in `src/sitekit/collections/Team.ts`: names and photos are pending
  from the practice (Nish for names and spelling, Christine for photos).

### Database

- Migration `20261105_090000_home_about_photo` makes the homepage photo
  change in the dashboard, only where the photo is still the one the site
  shipped with, and updates the description only if it is still the old
  one. It also names in the build log any section that still uses the removed
  team photo.

## [2.3.0] - 2026-11-04

Changes the practice asked for on 4 November 2026.

### Changed

- Penny (Penelope Phanmani) has left the practice and is off the website: her
  slide in the homepage team slider (now Dr Nish, Dr Nav and Zoe), her card on
  Our Team, the Support Team page, the sentence about her on the ten suburb
  pages, and "penny" in the homepage search words.
- The Support Team page is gone. `/support-team` and `/our-team/support-team`
  now redirect to `/our-team`. The Support Team card on the Dr Nish and Dr Nav
  pages is now Meet the Team, and the HTML sitemap no longer lists it.
- Our Team intro now reads "Three dentists, an oral health therapist, a
  hygienist and a support team who will actually remember you between visits."
- Directions say "near Your Discount Chemist and Australia Post" and no longer
  mention the hair salon: Contact (Getting here), New Patients (Getting here)
  and the FAQ answer to "Where exactly are you?", including the version Google
  reads. Parking, public transport and accessibility lines are unchanged.

### Database

- Migration `20261104_100000_team_and_directions` makes the same changes in
  the dashboard. A section is replaced only if it is still exactly as the site
  shipped it; if it was changed in the dashboard, only the words this release
  changes are updated where they are still the old words, and anything else is
  left alone and named in the build log. The Support Team page and its Team
  entry are deleted and the two redirects are added.

### Still to come

- Names and roles for the other dentist, the hygienist and the assistants,
  from the practice. They go on Our Team as name cards until there are photos.

## [2.2.0] - 2026-11-04

### Fixed

- The practice's own photos are back. The September port could not download
  the photos the approved r20 build loaded from imgur, Unsplash and an image
  CDN, and showed clinic photographs in their place without saying so (44
  photo addresses had been pointed at 16 local files). Affected: the four team
  portraits on the homepage, Our Team and the profile pages, about 30
  treatment photos used in the menu and service tiles on every page, the
  homepage search thumbnails, the background photo behind the page banners,
  and the share and schema images. All 49 originals now ship in
  `public/images` as WebP, each in the spot r20 used it: 229 photo fields,
  15 structured data blocks, 11 share images, 28 search thumbnails and 59
  stylesheets.
- The default share image is the real shopfront photo.
- Import pictures into the Media Library gives every photo the description
  the website uses for it (search for "Nish" now finds his portrait), and
  relabels photos imported earlier with the generic description.

### Database

- Migration `20261104_090000_restore_original_photos` updates the dashboard's
  built in photo paths to the originals, only where they are still the old
  ones. A photo chosen in the dashboard, and every word, is left alone. On an
  empty database it does nothing.

## [2.1.0] - 2026-11-03

The client dashboard is now the GYA standard dashboard, the same one as
Coastal Dental and Precision Dental. The website itself is unchanged: every
page renders exactly as before.

### Added (second commit)

- The standard dashboard at `/admin`: branded sign in page, dark sidebar
  (Dashboard, Pages, Blog Posts, Media Library, Team, Enquiries, SEO, Site
  Settings, Redirects, Users), and a home screen with the publish status,
  quick actions, latest enquiries and recent edits.
- The visual page editor. The page is shown exactly as it looks on the
  website, at desktop width or in a phone frame. Click any words to change
  them in place, click any photo to replace it (from the library or by
  uploading), and use the panel on the right for the selected item, every
  photo on the page with its description, the page's SEO, and its sections
  (drag to reorder, hide or show, or open one as a form). Save changes, then
  Publish website.
- The footer's plain words, including the opening hours, can be changed from
  any page. The menu, and anything holding the phone, email or address, stay
  locked: those details come from Site Settings.
- Blog post editor with headings, lists, quotes, links and photos, a featured
  photo, category, author, date, summary and SEO, plus Publish, Unpublish and
  Delete. The AHPRA reminder sits at the top.
- Users screen with temporary passwords. A new user chooses their own password
  at first sign in.
- Notes on each enquiry.
- GA4 and Meta Pixel IDs in Site Settings now switch tracking on. The default
  share image, default title and description, and the hide the whole site
  switch now take effect.
- `npm run qa:editor`: all 59 pages render byte for byte the same in the editor
  as on the website once the editor's markers are taken out.

### Changed

- Payload's own screens moved to `/cms`, for GYA administrators only. Editors
  who open it are refused.
- The first login is made on the dashboard's sign in page while
  `ALLOW_FIRST_USER=true`. Payload's create first user screen stays closed.
- Blog posts are stored as clean HTML instead of Payload's rich text format.
  This removed the rich text editor and with it three of the four open
  security advisories. Existing rich text columns are kept, not dropped.
- Pages hidden from Google are left out of the sitemap.
- Site Settings shows only the details the website actually uses.

### Database

- Migration `20261103_102912_client_dashboard` adds the post body, enquiry
  notes and the must change password flag. It runs on the next deploy.

## [2.0.1] - 2026-11-03

Fixes three problems in 2.0.0 that would have shown up on the first real
deployment, and moves to supported, patched versions of Next.js and Payload.
The pages are unchanged: all 59 have the same markup and head tags as 2.0.0.

### Fixed

- Connecting an empty database took the whole site down. The build pulled
  nothing out of it and wrote an empty list of known pages, so every page
  answered 404 and the homepage hung. The build now leaves the repository files
  alone until **Import website content** has been pressed, the list of known
  pages comes from the page files on disk, and `src/proxy.ts` lets requests
  through if that list is ever empty.
- Anyone could register the first administrator on a fresh deployment. The
  first user screen and its API now answer only while `ALLOW_FIRST_USER=true`
  is set, the first account is always an administrator, and any other attempt
  to create a user without an administrator login is refused.
- **Import website content** skipped the team and the search engine defaults.
  The button and `npm run seed` now share one import routine.

### Changed

- Next.js 15.4.11 to 16.4.4, React 19.2.9, Payload 3.92.1 and sharp 0.35.5.
  15.4.11 had critical advisories, and Payload does not support the patched
  15.5 releases. `src/middleware.ts` is now `src/proxy.ts`, as Next.js 16
  expects.
- Added `vercel.json` so Vercel builds this as Next.js even though the project
  was first set up for the static site.
- The build stops with a clear message if `DATABASE_URL` is set without a
  `PAYLOAD_SECRET` of at least 32 characters.
- Targets the `toothncaresep10` repository and Vercel project, the 10 September
  static build this was ported from. Checked page by page: the wording matches
  on all 59 pages apart from the documented differences, and all 75 redirects
  carry over.
- README: Vercel settings, the branch first rollout, the one-off
  `ALLOW_FIRST_USER` step, and the advisories still open in the rich text
  editor.

## [2.0.0] - 2026-09-28

Ported the approved static build to the GYA Site Kit and added the client
dashboard. The design, wording and addresses are unchanged.

### Added (second commit)

- Payload CMS dashboard at `/admin`, on Neon Postgres with pictures on Vercel
  Blob. Fixed menu, plain language labels, the practice's own colours.
- Publish website button, wired to a Vercel deploy hook, with a notice on the
  Dashboard when there are changes waiting.
- Pages open as collapsed, clearly named sections that can be reordered by
  dragging, hidden without being deleted, and edited item by item. 612 sections
  and 6,425 editable items across 59 pages.
- Media Library. Uploads are converted to WebP and capped at 2400px. Replacing
  a picture updates every page that uses it.
- Blog Posts with drafts, scheduling, categories, rich text and their own search
  engine settings. `/blog`, the sitemap entries, the Article markup and the
  footer link appear once the first post is published.
- Team, Enquiries with a spreadsheet download, Redirects and Users.
- Site Settings: practice details, hours, booking link, socials, health funds,
  tracking IDs and the feature flags. Values are written into the pages as
  tokens, so changing one here changes all 59 pages.
- SEO per page and per post: title, description, sharing picture, canonical, a
  noindex switch, character counters and a Google style preview.
- Roles. An editor from the practice does not see Users, Redirects or the
  tracking IDs.
- AHPRA reminder at the top of the page, blog and team editors.
- The enquiry form on `/contact` now works: honeypot, a timing check,
  server side validation, SMTP2GO relay, and every submission recorded under
  Enquiries whether or not the email got through.
- Sticky Call and Book Online bar on phones.
- Blog, mobile and enquiry form stylesheets, loaded after the page styles.

### Changed

- All 42 photographs now ship in the repository as compressed WebP. No page
  loads a picture from anyone else's server.
- Page weight is down from 600KB to 1.2MB of HTML to about 140KB, 26KB over the
  wire, with the stylesheets and pictures cached across the site.
- Every em dash is now a comma or a spaced hyphen. No wording changed.
- The 404 page moved to `/page-not-found`, because `404` is a reserved route
  name. Unknown addresses still return a real 404 and show the practice's page.
- Structured data, canonicals and `og:` tags are built from the configured site
  address rather than hard coded to the staging domain.

### Fixed

- Duplicate `<link rel="canonical">` and a second `og:` block pointing at the
  homepage, on 47 interior pages.
- A stray `</div>` with no opening tag, on 11 location pages.
- Missing `og:image`. All 59 pages now have an absolute one.
- `sitemap.html` listed "Envision Your Smile" in its header menu but not its
  footer, the opposite of every other page.
- An inline `grid-template-columns` outranked the mobile media queries on 19
  pages, which made them scroll sideways on a phone.
- Tap targets under 44px in the top bar, breadcrumbs, footer, accordions and
  carousel dots.
- Form fields under 16px, which made iOS zoom in on the contact form.

### Removed

- The before and after sliders on the homepage and `/envision-your-smile`. Their
  images were hosted on a CDN with no local copy, and they are simulated
  outcomes, which AHPRA's advertising guidance treats as misleading. The slots
  are wired to the Media Library, so the band returns as soon as real images
  are put in.
- The hotlink retry script, which had nothing left to retry.

## [1.20.0] - 2026-09

- r20. Shopfront cover photo on the eleven service area pages.

## [1.19.0] - 2026-09

- r19. Treatments section rebuilt as image cards with a gradient.

## [1.18.0] - 2026-09

- r18. Ten suburb location pages, the Areas We Serve hub, and a site wide
  footer, navigation and sitemap pass.
