# Changelog

All notable changes to the Tooth n Care website.

## [2.5.0] - 2026-11-06

Getting ready for the practice's confirmation of the oral health team's role
titles and everyone's AHPRA registration numbers (Christine, 5 November).
Nothing visible changes yet, apart from the three "[VERIFY reg. no.]" markers.

### Added

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

### Added

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

### Added

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

### Added

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
