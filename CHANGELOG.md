# Changelog

All notable changes to the Tooth n Care website.

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
