# Tooth n Care website, with the client dashboard

The approved r20 build, ported to the GYA Site Kit. Same design, same wording,
same addresses, now with a dashboard the practice can use on its own.

- **Public site**: Next.js App Router, static at build time. It never reads the
  database while someone is looking at a page.
- **Dashboard**: Payload CMS at `/admin`, on Neon Postgres, with pictures on
  Vercel Blob.
- **How a change goes live**: the practice edits in `/admin`, presses
  **Publish website**, which calls a Vercel deploy hook. The build pulls
  everything out of the database into `content/*.json` and then builds the site
  from those files.

---

## 1. What you need before you deploy

| Thing | Where it comes from |
| --- | --- |
| GitHub repository | Private, under the GYA account |
| Vercel project | Linked to that repository |
| Neon Postgres | Vercel dashboard, Storage, Create, Neon |
| Vercel Blob | Vercel dashboard, Storage, Create, Blob |
| SMTP2GO account | For the enquiry form. The sending domain must be verified |
| Deploy hook | Vercel, Settings, Git, Deploy Hooks |

### Storage setup, step by step

1. Open the Vercel project, **Storage**, **Create Database**, choose **Neon**
   (Postgres). Connect it to the project. Vercel adds `DATABASE_URL` for you.
2. **Storage**, **Create**, choose **Blob**. Connect it to the project. Vercel
   adds `BLOB_READ_WRITE_TOKEN`.
3. **Settings**, **Git**, **Deploy Hooks**. Create a hook called
   `Publish website` on the branch you are deploying, and copy the URL into
   `PUBLISH_HOOK_URL`.

---

## 2. Environment variables

Set these in Vercel under **Settings**, **Environment Variables**. There is a
copy of the list in `.env.example`.

| Name | What it is | Needed |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string. Vercel adds this when you connect Neon. | Yes |
| `PAYLOAD_SECRET` | A random string of at least 32 characters (`openssl rand -hex 32` makes one). Sessions are signed with it. Do not change it after go live or everyone is logged out. The build stops with a clear message if `DATABASE_URL` is set and this is missing or short. | Yes |
| `NEXT_PUBLIC_SERVER_URL` | The address the site is served from, no trailing slash. Staging: the `cms` preview address while testing, then `https://toothncaresep10.vercel.app` once merged. Live: `https://toothncare.com.au` | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob. Without it, uploads are written to disk and lost on the next deploy. | Yes |
| `PUBLISH_HOOK_URL` | The deploy hook. The **Publish website** button calls it. Without it the button explains that publishing is not set up yet, and nothing is lost. | Yes |
| `SMTP2GO_API_KEY` | Enquiry email. Without it the form saves the enquiry and tells the visitor to ring instead. | Yes |
| `MAIL_FROM` | The from address. It has to be on a domain verified in SMTP2GO. Suggested: `website@toothncare.com.au` | Yes |
| `MAIL_TO` | Comma separated fallback recipients. Site Settings takes priority; this is used only if that list is empty. | Recommended |
| `ALLOW_FIRST_USER` | Set to `true` only while you create the first login, then delete it and redeploy. While it is not `true`, `/admin/create-first-user` answers 404 and nobody can register without an administrator. | One-off |

### What to set up in SMTP2GO

1. Add `toothncare.com.au` as a **verified sender domain** and publish the DKIM
   and SPF records it gives you. Email sent from an unverified domain is
   rejected or lands in spam.
2. Create an **API key** with permission to send email. Put it in
   `SMTP2GO_API_KEY`.
3. Check that `reception@toothncare.com.au` and the SmileOx intake address both
   accept mail from SMTP2GO.

---

## 3. Rolling it out

### Vercel settings

`vercel.json` tells Vercel this is a Next.js site, so no project settings need
changing. If the project was first set up for the old static site, open
**Settings**, **Build and Deployment** and check that nothing overrides it:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Install Command | `npm ci` (from `vercel.json`) |
| Build Command | `npm run build` (from `vercel.json`) |
| Output Directory | Next.js default, leave the override off |
| Node.js Version | 20.x or newer |

### Push to a branch first, never straight to main

The repository is `rowaynekapugama-GYA/toothncaresep10`, linked to the Vercel
project behind `https://toothncaresep10.vercel.app`. Its `main` branch is the
static site uploaded on 10 September, which is the build this one was ported
from. (`rowaynekapugama-GYA/toothncare` is an older 49 page version and is not
used.)

`main` is the current static site. Push this to a `cms` branch so Vercel builds a
preview and the live site is untouched until you merge.

1. Push the `cms` branch. Vercel builds it with no database and no secrets,
   straight from the files in `content/`. The preview should look exactly like
   the live site.
2. Connect Neon and Blob (section 1) and add the environment variables for the
   **Preview** environment, with `NEXT_PUBLIC_SERVER_URL` set to the preview
   address. Add `ALLOW_FIRST_USER=true` as well, for now.
3. Redeploy. The build applies the database tables and then builds from the
   repository files, because nothing has been imported yet. An empty database
   never replaces the site.
4. Do the **First login** steps below on the preview address.
5. Delete `ALLOW_FIRST_USER` and redeploy. From now on the site is built from
   the dashboard.
6. When the preview is approved, merge `cms` into `main` and repeat steps 2 to 5
   for the **Production** environment. The Neon integration gives previews
   their own database branch, so the first login and the Import have to be done
   again on production.

Preview deployments answer with `X-Robots-Tag: noindex, nofollow`, so nothing on
a preview address can be indexed by mistake.

### First login

1. With `ALLOW_FIRST_USER=true` set, open `https://<your address>/admin`. It asks
   you to create the first user. Use a GYA address. This first account is
   always made an **Administrator (GYA)**, whatever role is chosen.
2. On the Dashboard, press **Import website content**. This loads the 59 pages,
   the header and footer, the team, the redirects, the practice details and the
   search engine defaults. It is safe to press twice: it skips anything already
   there.
3. Press **Import pictures into the Media Library**. This copies the 42
   photographs already on the site into the library so the practice can reuse
   them. It needs `BLOB_READ_WRITE_TOKEN` to be set first.
4. Add the practice login: **Users**, **Create**, role **Editor (practice)**.
   An editor cannot see Users, Redirects or the tracking IDs.
5. Remove `ALLOW_FIRST_USER` and redeploy.

### Every deploy

`npm run build` does this for you, in this order:

1. `payload migrate` applies any database changes.
2. `scripts/pull-content.ts` writes everything from the database into
   `content/*.json`, but only once **Import website content** has been pressed.
   Before that it leaves the repository files alone.
3. `next build` builds the site from those files.

If `DATABASE_URL` is missing the build falls back to the `content/*.json` files
already in the repository, so a database outage cannot stop a deploy.

---

## 4. What changed from the approved r20 build

Everything below was flagged rather than done quietly.

### Fixed

| What | Where |
| --- | --- |
| Duplicate `<link rel="canonical">` and a second `og:` block pointing at the homepage | 47 interior pages |
| A stray `</div>` with no opening tag | 11 location pages |
| No `og:image` at all | 48 pages now have one, absolute |
| `sitemap.html` had "Envision Your Smile" in its header menu but not its footer, the opposite of every other page | now matches the other 58 |
| An inline `grid-template-columns` on the four step grid outranked the mobile media queries, so those pages scrolled sideways on a phone | 19 pages |
| Every image was hotlinked from imgur, Unsplash or a CDN | all 42 now ship in the repository as WebP |

### Deliberate differences

| What | Why |
| --- | --- |
| The before and after sliders on the homepage and `/envision-your-smile` are not shown | Their three images were hosted on a CDN and had no local copy, so they could not be brought across. They are also simulated "illustrative representations" of treatment outcomes, which is exactly what AHPRA's advertising guidance treats as misleading. **Send the files and the band comes straight back**, or say the word and it is removed properly. |
| Every em dash is now a comma or a spaced hyphen | House rule. Paired dashes became commas, single dashes became a spaced hyphen. No wording changed. |
| The `/404` page is served from `/page-not-found` | `404` is a reserved route name in Next. Unknown addresses still return a real 404 status and show the practice's own page. |
| A sticky **Call** and **Book Online** bar on phones, replacing the single round call button | Asked for in the brief. Hidden above 760px, so the desktop design is untouched. |
| The enquiry form on `/contact` now works | The button was disabled and marked "awaiting endpoint". |
| Two mega menu thumbnails use clinic photographs | Those two stock images had no local copy. The clinic photographs are a better fit anyway. |
| Six neon icons on the homepage now use the SVG that already sat beside them | The PNG versions were hotlinked and unreachable. No visible difference. |

### Still to confirm with the practice

There are **12 `[VERIFY]` notes** left on the site. They are listed in
`docs/build-notes/verify-items.json` and repeated in the go live checklist
below. None of them has been deleted.

---

## 5. Go live checklist

- [ ] Point DNS at Vercel. **Apex** `toothncare.com.au` as the primary domain,
      `www` set to **308 redirect** to the apex. Swap the two around if the
      practice already ranks on `www`.
- [ ] Set `NEXT_PUBLIC_SERVER_URL` to `https://toothncare.com.au` in the
      Production environment and redeploy, so canonicals, `og:` tags and the
      structured data all point at the live domain.
- [ ] Verify the sending domain in SMTP2GO and publish its DKIM and SPF records.
- [ ] Send a real enquiry from the live form and confirm it arrives at
      `reception@toothncare.com.au`, at the SmileOx intake address and at
      `rowayne@gyaclients.com`, and that it appears under **Enquiries**.
- [ ] Add the GA4 measurement ID and the Meta Pixel ID under **Site Settings**,
      **Tracking**.
- [ ] Submit `https://toothncare.com.au/sitemap.xml` in Google Search Console.
- [ ] Hand the practice `docs/HOW-TO-UPDATE.md` and their editor login.
- [ ] Confirm `ALLOW_FIRST_USER` is not set in any environment, and that
      `https://toothncare.com.au/admin/create-first-user` answers 404.
- [ ] Retrofit the visual page editor (GYA Client Dashboard Standard) before
      handover. This build still edits pages through forms.

### Open `[VERIFY]` items

| Page | What needs confirming |
| --- | --- |
| `/dr-nisheeth-agrawal` | AHPRA registration number |
| `/dr-navneet-karan` | AHPRA registration number |
| `/zoe-xu` | AHPRA registration number |
| `/faq` | Whether the practice is a current Invisalign provider and licensed to use the brand name. Until that is confirmed the page says "clear aligner treatment". |
| `/offers` | The exact price on the offer, and that the offer period and inclusions are right |
| `/offers` | The whitening wording |
| `/teeth-whitening` | Current Philips ZOOM pricing |
| `/our-clinic` | A professional photo shoot is still recommended. The note about archive images is visible on the page and should come off once real photographs are in. |
| `/privacy-policy` | Cookie wording, and a review by the practice and a solicitor |
| `/privacy-policy` | The published date, currently August 2026 |
| `/terms` | A review by the practice and a solicitor |
| `/contact` | The privacy notice wording |

### Details checked against the brief

| Detail | On the site | In the brief | Result |
| --- | --- | --- | --- |
| Practice name | Tooth n Care | Tooth n Care | matches |
| Address | 135 Lawes Street, East Maitland NSW 2323 | same | matches |
| Phone | 02 4933 4667 | same | matches |
| Email | reception@toothncare.com.au | same | matches |
| Hours | Mon to Fri 9:00 to 18:00, Sat 9:00 to 16:00, Sun closed | not stated in the brief | to confirm |
| Booking | `apac.dentalhub.online` | not stated in the brief | to confirm |
| Facebook | `facebook.com/dentisteastmaitland` | `dentisteastmaitland` | matches |
| Instagram | `instagram.com/toothncare` | not stated in the brief | **to confirm** |
| X (Twitter) | `twitter.com/toothncareau` | not stated in the brief | **to confirm** |
| Health funds | HCF, Bupa, Medibank, nib, CBHS, Teachers Health, Defence Health, Australian Unity, GMHBA, CDBS; Humm and DentiCare payment plans | not stated in the brief | to confirm |
| SmileOx intake address | `smileox-intake-PLACEHOLDER@toothncare.com.au` | not supplied | **needed before go live** |

The phone number, address, email and booking link are written into the pages as
`{{site:phone}}`, `{{site:email}}` and so on. Changing them once in **Site
Settings** changes them everywhere, including the structured data.

---

## 6. How the repository is laid out

```
content/            what the site is built from. Written by the dashboard.
  pages/*.json        one file per page: sections, wording, pictures, SEO
  site-chrome.json    the header, footer, mobile menu, call button
  site-settings.json  practice details, written from Site Settings
  redirects.json      the 75 redirects carried over from vercel.json
  posts.json          published blog posts
  team.json           the roster
  known-paths.json    used by the 404 handler
docs/
  HOW-TO-UPDATE.md    the guide for the practice
  VERIFICATION.md     what was tested and what it said
  build-notes/        the record of how the port was made
  screenshots/        the pages and the dashboard at 390 and 1280
migrations/         database migrations, committed on purpose
public/
  images/             42 compressed WebP photographs
  fonts/              the Sydney word mark
  styles/             the stylesheets, split out of the approved pages
scripts/            build, seed, pull, and the quality checks
src/
  app/(frontend)/     the public site
  app/(payload)/      the dashboard
  sitekit/            collections, globals, dashboard components, sync
  lib/                content loading, tokens, structured data
  site.config.ts      the practice's default values
```

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run locally on port 3000 |
| `npm run build` | Migrate, pull from the database, build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Load `content/*.json` into the database. `-- --overwrite` resets it |
| `npm run pull` | Write the database out to `content/*.json` |
| `npm run qa` | Typecheck, banned wording, secrets, external pictures |

---

## 7. Things worth knowing

- **The public site never touches the database.** If Neon is down, the site
  stays up. Only `/admin` and the enquiry form need it.
- **Pages are built from a template plus a list of fields.** The markup is the
  approved markup; only the wording and the pictures are editable. That is why
  the pages still match the approved build byte for byte.
- **Pictures**: the photographs that shipped with the approved build live in
  `public/images` and show as "Current picture". Anything uploaded through the
  dashboard goes to Vercel Blob. Replacing a picture in the Media Library
  changes it everywhere it is used.
- **Hiding a section** takes it off the page without deleting it, and the page
  keeps working.
- **Blog**: `/blog`, the sitemap entry, the Article markup and the Blog link in
  the footer all appear by themselves once the first post is published, and
  disappear again if every post is unpublished.
- **Australian English and no em dashes** are enforced by `npm run qa:banned`,
  which fails the build on an em dash.
- **Next.js 16 uses `src/proxy.ts`**, the file that used to be called
  `middleware.ts`. It sends unknown addresses to the practice's 404 page and
  hides the first user screen. If its list of known pages is ever empty it lets
  every request through rather than blocking the site.
- **Known security advisories** (`npm audit`, 3 November 2026): one critical
  (`dompurify`) and three high (`@lexical/headless`,
  `@payloadcms/richtext-lexical`, `happy-dom`), all inside the dashboard's rich
  text editor, which only signed in users can reach. None has a fix released
  yet. Run `npm audit` and update Payload when one lands.
- **What the merge replaces**: the 59 static HTML files and the static
  `vercel.json` on `main`. All 75 of its redirects are in
  `content/redirects.json`, and every page's wording is the same apart from the
  differences listed in section 4.
