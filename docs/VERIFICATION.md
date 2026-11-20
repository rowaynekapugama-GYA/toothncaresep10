# What was tested, and what it said

Every number here comes from a check that was run against this build. The
scripts are in `scripts/` and in the build notes, so any of it can be run again.

---

## 1. The port matches the approved build

The approved r20 pages were parsed into the content model, then rendered back
out and compared with the originals.

| Check | Result |
| --- | --- |
| Sections that render back to their original bytes | **612 of 612** |
| Editable items extracted | 6,425 across 59 pages |
| Page bodies identical to r20 | **55 of 59** |
| `<title>` identical | **59 of 59** |
| `<meta name="description">` identical | **59 of 59** |
| `og:title` and `og:description` identical | **59 of 59** |
| Canonical address identical | **58 of 59** |
| Structured data identical, block for block | **59 of 59** |
| `og:image` | added on 48 pages, unchanged on the 11 that already had one |

### The four pages that differ, and why

| Page | Difference |
| --- | --- |
| `/contact` | The enquiry form is switched on: honeypot, timing field, status line, working button. Asked for in the brief. |
| `/` | The before and after band is left out until the three images can be supplied. |
| `/envision-your-smile` | The same band. |
| `/sitemap` | Its header menu listed "Envision Your Smile" and its footer did not, the opposite of every other page. Now consistent with the other 58. |

The canonical difference is `/404` moving to `/page-not-found`, because `404` is
a reserved route name in Next. Unknown addresses still return a 404.

---

## 2. Pixel comparison against the approved build

Both builds were rendered in the same browser, with the pictures the approved
build hotlinked served from the local copies so the comparison is like for like.
The before and after band was hidden on both sides.

### Desktop, 1280px

| Page | Difference | Height |
| --- | --- | --- |
| `/` | 1.76% | 8403 to 8403 |
| `/check-ups` | 0.36% | 5794 to 5794 |
| `/dentist-maitland` | 0.20% | 7348 to 7348 |
| `/contact` | 0.52% | 3899 to 3899 |
| `/our-team` | 0.27% | 4786 to 4786 |
| `/services` | 0.19% | 4672 to 4672 |
| `/faq` | 0.06% | 17229 to 17229 |
| `/offers` | 0.46% | 4385 to 4385 |
| `/emergency` | 9.05% | 6745 to 6720 |
| `/payment-options` | 0.38% | 5418 to 5418 |

Nine of the ten are identical in height and under 0.6% different. Those
differences are the em dash replacements and two pictures the old build failed
to load in the test harness.

`/emergency` is 9% because removing an em dash lets one card's text wrap a line
shorter, which shifts everything below it by 25px. That is the no em dash rule
doing its job, not a layout break.

### Phone, 390px

| Page | Difference | Height |
| --- | --- | --- |
| `/` | 4.65% | 12330 to 12806 |
| `/check-ups` | 21.17% | 8756 to 9651 |
| `/dentist-maitland` | 24.56% | 10841 to 11503 |
| `/contact` | 16.99% | 6652 to 7197 |
| `/our-team` | 22.63% | 7091 to 7593 |
| `/services` | 21.73% | 7475 to 7997 |
| `/faq` | 19.08% | 19140 to 21796 |
| `/offers` | 16.31% | 7033 to 7535 |
| `/emergency` | 19.21% | 11056 to 11558 |
| `/payment-options` | 17.82% | 8298 to 8849 |

Every page is taller on a phone than it was, by design: the mobile pass raised
the small tap targets to 44px, which adds height to menus, breadcrumbs,
accordions and footer links. Side by side the layout, typography, colours and
wording are the same. `/faq` grows most because it has the most accordion rows.

---

## 3. The dashboard writes back what it was given

| Check | Result |
| --- | --- |
| Load `content/*.json` into the database, read it back out, compare | **0 differences** |
| Build from the files vs build from the database, page by page | **59 of 59 identical** |
| Build with no `DATABASE_URL` | Falls back to the files in the repository and builds |
| Build with `DATABASE_URL` | Migrates, pulls, builds |

---

## 4. End to end, through the dashboard

21 checks, all passing.

| Check |
| --- |
| An administrator can log in |
| A practice login sees Pages but is refused Users and Redirects |
| A page can be edited and the change reads back correctly |
| Sections can be reordered |
| A hidden section is left off the page |
| A change in Site Settings reaches every page |
| A team member can be added and hidden |
| A blog post can be written, saved as a draft and published |
| Search engine settings save on a page |
| An enquiry sent from the website is recorded |
| The honeypot and the timing check reject a bot without telling it why |
| A bad submission is explained field by field |
| Enquiries download as a spreadsheet |
| Publish website explains itself when the deploy hook is missing |
| Import can be run again without duplicating anything |
| A picture can be uploaded and then replaced |
| The test edits can be undone |
| The menu lists the ten sections in the agreed order |
| The dashboard shows the publish button and the latest enquiries |
| The page editor shows the AHPRA reminder |
| No page of the dashboard throws an error in the browser |

---

## 5. Addresses

| Check | Result |
| --- | --- |
| Redirects carried over from `vercel.json` | **75 of 75** return 308 to the right page |
| `/no-such-page` | 404, showing the practice's own page |
| `/services/old-thing` | 404, showing the practice's own page |
| `/dentist-nowhere` | 404, showing the practice's own page |

---

## 6. Phones and tablets

Every page was checked at 360, 390, 414, 768, 1024 and 1280: **59 pages, 354
checks**.

| Check | Result |
| --- | --- |
| Pages that scroll sideways | **0 of 354** |
| Form fields that would make iOS zoom in | **0** |
| Pages with content cut off | **0** |

The only elements that still reach past the viewport are the decorative blur
shapes, the honeypot field and the two carousels, all of which are clipped or
scrollable by design.

### Menus and keyboard

| Check | Result |
| --- | --- |
| The burger is visible on a phone | pass |
| Tapping it opens the menu | pass |
| It reports its state to a screen reader | pass |
| The menu closes again | pass |
| A menu link navigates and the menu does not linger | pass |
| The submenu inside the mobile menu opens by tap | pass |
| The sticky Call and Book bar is on screen and 44px or more | pass |
| The services menu opens from the keyboard | pass |
| Escape closes it | pass |
| Every image has an alt attribute | pass |

### Tap targets

Everything that can be pressed is now at least 44px tall on a phone, apart from
links written inside a sentence, which the WCAG target size rule exempts. The
carousel dots keep their small appearance and gain a 44px hit area behind them.

---

## 7. Content and code checks

| Check | Result |
| --- | --- |
| Em dashes anywhere in the repository | **0** |
| AHPRA sensitive wording | 0 to review, 24 read and allowed with a note each |
| Secrets committed | **none found** |
| Pictures loaded from another site | **none** |
| `tsc --noEmit` | no errors |

The 24 allowed phrases are in `scripts/qa-allow.json`, each with a note saying
why it is acceptable. They are things like "cannot be guaranteed", "referral to
a specialist" and "the best time to ring", which are disclaimers and plain
English rather than claims.

---

## 8. Version 2.0.1, run on 3 November 2026

Run on Next.js 16.4.4 and Payload 3.92.1 against a fresh local Postgres 16, in
the order a real rollout happens. Each step was a clean `npm run build` with
only the variables listed.

| Step | Variables | Result |
| --- | --- | --- |
| No database | none | Builds. Homepage, a service page and a suburb page 200, `/about.htm` 308, an unknown address 404, `/admin/create-first-user` 404 |
| Empty database | `DATABASE_URL`, `PAYLOAD_SECRET` | Migrations applied, pull skipped, `content/` untouched. Same answers as above. A stranger posting to `/api/users/first-register` gets 403 |
| First login | plus `ALLOW_FIRST_USER=true` | First account created and made an administrator although `editor` was asked for. A second first-register attempt 403, an anonymous `POST /api/users` 403, Import without a login 401. Import as the administrator added 143 items: 59 pages, 5 shared parts, 4 team members, 75 redirects, plus practice details and search engine defaults |
| Imported | `ALLOW_FIRST_USER` removed | Pull wrote 59 pages and 5 shared parts, and every file in `content/` came back byte for byte as it was. All probes as above, stranger 403 |

On both the no database build and the imported build, all 59 pages have the
same body markup, title, meta tags, canonical and structured data as the 2.0.0
build on Next.js 15. Only the framework's own script and stylesheet tags
differ. The dashboard was opened in Chromium after logging in: menu, page list
and page editor load with no console errors. `npm run qa` passes: no em dashes,
no phrases to review, no secrets, no pictures from another site.

## 9. Version 2.1.0: the standard dashboard, run on 3 November 2026

Next.js 16.4.4, Payload 3.92.1, local Postgres 16. Browser checks were driven
in Chromium with Playwright.

### The editor shows the real page

| Check | Result |
| --- | --- |
| `npm run qa:editor`: each page rendered plain and marked for editing, markers removed | 59 of 59 byte for byte the same. 5,941 pieces of wording, 216 photos and 783 links marked |
| The editor's plain render against the built website, as parsed HTML (tags, attributes, text) | 59 of 59 the same |
| Pixel comparison, saved page preview against the live page, 1280 and 390 wide | Homepage, Check-ups, Maitland, Contact, Our Team and FAQ: same heights, 0.00% to 0.11% of pixels different (moving slider frames), except one phone homepage run at 1.76% from the hero carousel's timing |
| Random reorders and hides, 1,770 of them across all 59 pages: preview against what Save writes and the build then publishes | All agree. No section ever moves past the footer or a page script (FAQ and Conditions We Treat have sections after one) |

### Dashboard, driven in the browser (48 checks, all pass)

- Signed out `/admin` goes to sign in; a wrong password is refused politely.
- Sidebar: Dashboard, Pages, Blog Posts, Media Library, Team, Enquiries, SEO,
  Site Settings, Redirects, Users. Team opens the Our Team page editor.
- Pages lists all 59. The homepage editor marks 124 pieces of wording and 19
  photos and lists the photos with their descriptions.
- Clicking a heading and typing: status turns to Unsaved changes, the panel
  shows Editing words, Save writes it to the database.
- Clicking the hero photo (under its text overlay) opens the photo card; an
  upload replaces it on the page; a description typed in the photo list
  changes the page's alt text.
- Sections: 11 listed on Check-ups; hiding one takes it off the page; a
  section opens as a form. SEO tab counters work. Mobile shows a 390 wide frame.
- Footer: the opening hours are editable; the menu has no editable words and
  clicking it explains where it is changed.
- Leaving with unsaved changes asks first, from the menu and from the Pages
  button.
- Publish website without a hook explains that it is not set up.
- Site Settings: a new phone number shows in the editor preview straight away.
- Blog: a post written, given a featured photo, published, listed, unpublished
  and deleted.
- Media, Enquiries, SEO, Redirects (75) and Users screens load.
- A new editor account: forced to choose a password at first sign in; no
  Redirects, Users, Import or GYA only settings; `/admin/users` and
  `/admin/redirects` answer 404; `/cms` refuses them; they can edit and save a
  page; the SEO tab has no canonical field.

### Edits reach the website, and the round trip is exact

A build from the dashboard after the checks above published every change: the
edited heading, the uploaded photo and its description, the hidden section
gone, the new SEO title, the footer hours and the editor's edit. Reset to the
repository's content, then a build: every file in `content/` came back byte for
byte as the repository has it.

### Fresh rollout

New empty database, `ALLOW_FIRST_USER=true`: both migrations applied, the build
left `content/` alone, `/admin` showed Create the first login, the account was
made and landed on the Dashboard with the Import panel, Import added 143 items,
Import pictures added all 42 photos, Pages listed 59. Without the flag the sign
in page is normal, `/cms/create-first-user` is 404 and a second first-register
is refused (403).

`npm run qa`: no em dashes, nothing new to review (six help text lines added to
the reviewed list), no secrets, no pictures from another site, editor parity
59 of 59.

## 10. Version 2.2.0: the original photos, run on 4 November 2026

| Check | Result |
| --- | --- |
| Rowayne downloaded all 58 photo addresses from the r20 build on his Mac | 58 of 58 arrived and opened as images |
| Every photo on every page lined up with the same page in r20, in order (before and after band excluded, it is not shown) | 3,303 photo spots now show the r20 original for that spot; 1,102 photos that were embedded in r20 unchanged; 0 problems |
| Our Team at 1280, r20 (with its original photos served locally) against v2.2.0 | 0.25% of pixels different (text rendering) |
| Teeth Whitening and Dr Nisheeth Agrawal, same comparison | banner, portraits and photos identical by eye; the rest of the difference is the 30px shift from the September port's form and wording changes |
| An imported dashboard database still holding the old paths, then a build | migration changed 229 photo spots; the pull gave back the repository's fixed content byte for byte |
| An empty database | migration changed nothing |
| Import pictures on a dashboard that already had the 42 old imports | 49 added, 42 skipped, 18 relabelled with their website descriptions |
| `npm run qa` | clean; editor parity 59 of 59 |

## 11. Version 2.3.0: team and directions, run on 4 November 2026

| Check | Result |
| --- | --- |
| Pages, after the build | no "Penny", "Penelope", "Phanmani", "hair salon" or "support-team" on the homepage, Our Team, any suburb page, the profile pages, the sitemap, FAQ, Contact or New Patients |
| Homepage team slider in the browser | 3 slides, 3 dots, arrows work, no script errors |
| `/support-team` and `/our-team/support-team` | 308 to `/our-team` |
| Imported dashboard (v2.2.0 state), migrate then pull | the pull gave back the repository's v2.3.0 content byte for byte, including redirects, known paths and team |
| Dashboard with edits made in it (a suburb heading, an Our Team card's wording, a hidden Contact section) | Penny's sentence removed and the heading edit kept; the edited Our Team section left alone and named in the log; the hidden Contact section stayed hidden with the new directions; Support Team page deleted; both redirects added |
| `npm run qa` | clean; editor parity 58 of 58 |

## 12. Version 2.4.0: homepage photo and team tidy, run on 5 November 2026

| Check | Result |
| --- | --- |
| Supplied photo (1672 x 941) cropped inside its frame | 770 x 616 (5:4), no frame, glow, logo or tooth icon left; 40 KB WebP |
| Homepage About Us at 390, 768 and 1440px | new photo shown, same slot size as before (340 x 212, 718 x 448, 538 x 430), header and phone call bar unchanged over it |
| Old photo | still used on About (Our story) and New Patients (Getting here), so kept; not used as a share image or in structured data |
| Our Team at 1440px | two cards then the third centred under them; 390 and 768px one card per row as before |
| Every page in the sitemap (55) and every internal link, photo, stylesheet and script on them (258) | all 200, or a redirect to a 200; no mention of the removed team member, her photo or `support-team` |
| `/support-team` and `/our-team/support-team` | 308 to `/our-team` |
| Imported dashboard (v2.3.0 state), migrate then pull | homepage photo and description changed, About and New Patients untouched; the pull gave back the repository's v2.4.0 content byte for byte |
| Dashboard where the homepage photo had been changed, plus a section still using the removed photo | photo left alone; the section named as a warning in the build log |
| `BUILD_WITHOUT_DB=1 npm run build` with a database configured | no migration or pull, builds from the files |
| `npm run build`, `npm run qa` | clean, no warnings; editor parity 58 of 58 |
| `update-and-deploy.sh` against a copy of the GitHub repository (with a local `.env` pointing at a database, and a `.vercel` folder) | backup branch pushed; main committed and pushed; the pushed tree is identical to the zip file for file; `.env` and `.vercel` kept and not committed; the database not touched; cms moved forward |
| The same script with a zip that does not build | stopped before committing, folder put back exactly as it was, nothing pushed to main |

## 13. Version 2.5.0: role titles and AHPRA fields, run on 6 November 2026

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.4.0 against v2.5.0, whole HTML including titles, descriptions, share tags and structured data | 52 identical; the other 3 (the profiles) differ only by the removed "[VERIFY reg. no.]" marker |
| A test copy with sample numbers for Dr Nish and Zoe, Dr Nav left empty, and Zoe's title changed | numbers shown on the Our Team cards, homepage slides and profiles, Dr Nav shows nothing; the new title appears on her card, profile, Google title and description, structured data, FAQ and Check-ups; the Our Team intro read "two dental hygienists"; Person structured data has the AHPRA identifier only for the two filled in |
| Empty numbers at 390 and 1440px | no AHPRA line and no "[VERIFY" anywhere on Our Team, the homepage or the profiles |
| "TBC", "XXXX" and "DEN123" as a number | the build stops and names the line to fix |
| `npm run qa:roles` on v2.4.0 content | 26 typed role titles and registration placeholders found |
| `npm run qa:roles` on v2.5.0 content | none |
| Imported dashboard (v2.4.0 state), migrate then pull | 30 spots changed; the pull gave back the repository's v2.5.0 content byte for byte |
| Dashboard with a reworded FAQ answer and Zoe's Google title edited | those two left alone and named in the build log; the other 28 changed. Undoing the migration put everything back |
| Page editor on Zoe's page, then save | role words shown as shaded words, empty AHPRA placeholder hidden; after typing and saving, both placeholders are still in the saved wording |
| `update-toothncare-v2.5.0.sh` against a copy of the GitHub repository, started on the cms branch, with a local `.env` pointing at a database and a `.vercel` folder | switched to main, pulled, backup branch pushed, build passed without touching the database, committed and pushed; the pushed tree is identical to the zip file for file; `.env` and `.vercel` kept and not committed; cms moved forward |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |

## 14. Version 2.6.0: reception photo, run on 11 November 2026

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.5.0 against v2.6.0, whole HTML | 53 identical; About and New Patients differ only by the photo file and its description |
| Every internal link, photo, stylesheet and script on those pages (259) | all 200, or a redirect to a 200 |
| `img-d7098759b1` on any page | none |
| About Us photo at 390, 768 and 1440px | slot 340 x 212, 718 x 448 and 538 x 430, as before; whole sign and tooth logo in frame |
| New Patients photo at 390, 768 and 1440px | slot 340 x 128, 718 x 272 and 1150 x 437, as before; whole sign and tooth logo in frame |
| Imported dashboard (v2.5.0 state), migrate then pull | both slots changed; the pull gave back the repository's v2.6.0 content byte for byte |
| Dashboard where the About Us photo had been changed | About left alone and named as a warning in the build log; New Patients changed. Undoing the migration put the old file name back |
| `update-toothncare-v2.6.0.sh` against a copy of the GitHub repository, started on the cms branch, with a local `.env` pointing at a database and a `.vercel` folder | switched to main, pulled, backup branch pushed, build passed without touching the database, committed and pushed; the pushed tree is identical to the zip file for file; `.env` and `.vercel` kept and not committed; cms moved forward |
| The same script with a zip that does not build | stopped before committing, folder put back exactly as it was, nothing pushed |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |

## 15. Version 2.7.0: team roster, support team, hygienist removed, run on 11 November 2026

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.5.0 (live) against v2.7.0, whole HTML | 51 identical; Our Team (intro, Dr Rav, support team), Home (Dr Rav's slide, Zoe now 04/) and the 2.6.0 photo on About and New Patients are the only differences. FAQ, Check-ups, Zoe's profile and the other token pages are identical |
| "hygienist" on any page of the built site | none |
| Every internal link, photo, stylesheet and script (260) | all 200, or a redirect to a 200 |
| `/support-team`, `/our-team/support-team` | 308 to `/our-team#support-team` |
| Our Team and the homepage slider at 320, 390, 768, 1440 and 1920px, both support team layouts | no sideways scrolling; support cards 2 to a row on phones, 4 on tablets, 5 on wide screens, short last rows centred; slider has 4 slides and 4 dots, no script errors |
| `npm run qa:roles` with a hygienist put back in the config and in the Team list | both found, fails |
| Imported dashboard (v2.5.0 state), migrate then pull | the pull gave back the repository's v2.7.0 content byte for byte (Our Team, Home, Team list, redirects) |
| Dashboard with Dr Nish's card wording edited and a "Holly" already in the Team list | the cards section left alone and named in the log; the support team section still added; Holly not added twice. Undoing the migration removed only what it added (the practice's Holly kept) |
| `update-toothncare-v2.7.0.sh` against a copy of the GitHub repository (v2.5.0 on main), started on the cms branch, with a local `.env` and a `.vercel` folder | switched to main, pulled, backup branch pushed, build passed without touching the database, committed and pushed; pushed tree identical to the zip; `.env` and `.vercel` kept; cms moved forward |
| The same script with a zip that does not build | stopped before committing, folder put back exactly as it was, nothing pushed |
| Team screen in the browser | listed the 12 support staff; adding, renaming, reordering and removing saved and survived a reload; the Our Team page editor preview showed the change |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |

## 16. Version 2.7.1: favicon, run on 13 November 2026

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.7.0 against v2.7.1, whole HTML | the only difference on every page is the four icon and manifest lines in the head |
| `/favicon.ico`, `/icon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`, `/site.webmanifest` | all 200 with the right content type |
| Blog and dashboard sign in page | icon present |
| Icon at 16, 32 and 48px on light and dark backgrounds | tooth outline readable at 16px |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |
| `update-toothncare-v2.7.1.sh` against a copy of the GitHub repository | committed and pushed; pushed tree identical to the zip |

## 17. Version 2.8.0: team roles, Dr Rav, Dr Dimple (hidden), practice photos, go live guide, run on 17 November 2026

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.7.1 against v2.8.0, whole HTML, with the www address change set aside | 45 identical; the 15 photo slots on 9 pages, Dr Rav's AHPRA line (Our Team, Home), the support team list and the removed old-site fallbacks are the only differences |
| Every internal link, photo, stylesheet and script (265) | all 200, or a redirect to a 200 |
| Every address in the old site's sitemap (334), plus every service page in all 21 suburb folders and each folder with and without the closing slash (741 in all) | all end on a 200 in at most three hops |
| "hygienist", "Dimple", "Ravneet" on any built page | none |
| "orthodontist" on any built page | only the general FAQ question (and its structured data) |
| `npm run qa:roles` with "Orthodontist" typed into Our Team | found, fails |
| Our Team at 320, 390, 768, 1024, 1440 and 1920px | no sideways scrolling; support team 2 to a row on phones, 4 on tablets, 5 on wide screens (5, 5, 2 centred); 12 people, each once, role under the name, in the order Holly, Kathryn, Jorja, Ton, then the Clinical Care Coordinators |
| Homepage slider | 4 slides and 4 dots, Dr Rav 03/ with her AHPRA line, Zoe 04/; no script errors |
| `DR_DIMPLE.show = true` (built, then put back) | Dr Dimple card after Dr Rav, slide 04/ with Zoe 05/, 5 dots, intro "Four dentists, an oral health therapist and a support team ..."; no sideways scrolling at any width |
| `specialistOrthodontics` true as well | role "Orthodontist", intro "Three dentists, a specialist orthodontist, an oral health therapist ..." |
| New photos at 390 and 1440px | every slot loads, cover cropped as before, no photo twice on a page; files 31 to 237 KB, no EXIF or GPS |
| Imported dashboard (v2.7.1 state), migrate then pull | 15 photos and 9 wording or layout changes made, order updated, 42 redirects added; the pull gave back the repository's v2.8.0 content byte for byte (pages, Team list, redirects) |
| Undoing both migrations, then pull | the repository's v2.7.1 content byte for byte |
| Dashboard with Dr Rav's slider name, an Our Clinic photo and its caption edited, Kathryn moved and Holly given a role line | those left alone and named in the build log; everything else changed; Holly's role line kept. Undoing put back only what the migration changed |
| Team screen in the browser | role line placeholders show the website's wording; hiding Malal, a role line for Holly and moving Riley all saved and survived a reload; the Our Team preview showed them |
| Page editor, Dr Rav's photo | the team photo help appears under the photo |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |

## 18. Version 2.8.1: Dr Dimple shown, Mursal, share picture, Contact note, run on 19 November 2026

| Check | Result |
| --- | --- |
| Start point | `origin/main` at `ca579ba` (v2.8.0); the live preview shows v2.8.0 (support team in one list, Dr Rav's AHPRA line) |
| Every page in the sitemap (55), v2.8.0 against v2.8.1 | the share picture changes on every page (the site default) and on the 11 pages that name it, in `og:image` and structured data; Contact loses the note; Our Team gains Dr Dimple's card, "Four dentists" and Mursal; Home gains Dr Dimple's slide. Nothing else differs |
| Every internal link, photo, stylesheet and script (265) | all 200, or a redirect to a 200 |
| "Mursel", "hygienist", `img-0451df991a` on any built page | none |
| "orthodontist" on any built page | only the general FAQ question (and its structured data); "orthodontics" only in the menu and service pages |
| Our Team at 320, 390, 768, 1024, 1440 and 1920px | no sideways scrolling; dentist cards two to a row from 901px with Zoe centred under them (one column below); support team 2, 4 or 5 to a row, 12 people, Mursal 6th |
| Homepage slider | 5 slides and 5 dots: Dr Nish 01/, Dr Nav 02/, Dr Rav 03/, Dr Dimple 04/, Zoe 05/; no script errors |
| `specialistOrthodontics = true` (built, then put back) | card "Specialist Orthodontist", intro "Three dentists, a specialist orthodontist, an oral health therapist ..."; `qa:roles` passes; no sideways scrolling at any width |
| Imported dashboard (v2.8.0 state), migrate then pull | Mursal renamed, share picture changed on 11 pages (structured data on 11), Contact note removed; the pull gave back the repository's v2.8.1 content byte for byte |
| Undoing the migration, then pull | the repository's v2.8.0 content byte for byte |
| Dashboard with the name changed to "Mursal B", Morpeth's share picture changed and the Contact wording edited | all three left alone (the build log says the name and the Contact note were left as they are); the other 10 pages' share picture changed |
| `npm run build`, `npm run qa` | clean; editor parity 58 of 58 |

## 19. Version 2.9.0: go-live check of the dashboard, URLs and SEO, run on 20 November 2026

How it was run: the production build (`next start`) against a local Postgres
16 database made **from the migrations alone** (no copy of anyone's data),
seeded the way Vercel's first build seeds it, with a stand-in for Vercel Blob
(a dummy `BLOB_READ_WRITE_TOKEN`, so the real Blob plugin code runs) and a
stand-in for SMTP2GO that records what would be sent. Two local test logins,
one Admin and one Editor, with made-up addresses (`@example.com`) and test
passwords; no real login was created anywhere. Every screen was driven in
Chromium (Playwright) as each role. Every test edit was put back: after
"Reset to the repository's content" the pull gave back the repository's
content byte for byte.

### Dashboard, Editor and Admin

| Area | Check | Editor | Admin | Note |
| --- | --- | --- | --- | --- |
| Sign in | wrong password message is plain | - | pass | That email and password do not match. Please try again. |
| Sign in | forgotten password help on the sign-in page | - | pass |  |
| Sign in | signs in | - | pass |  |
| Sidebar | Dashboard opens | pass | pass |  |
| Sidebar | Pages opens | pass | pass |  |
| Sidebar | Blog Posts opens | pass | pass |  |
| Sidebar | Media Library opens | pass | pass |  |
| Sidebar | Team opens | pass | pass |  |
| Sidebar | Enquiries opens | pass | pass |  |
| Sidebar | SEO opens | pass | pass |  |
| Sidebar | Site Settings opens | pass | pass |  |
| Sidebar | Redirects opens | - | pass |  |
| Sidebar | Users opens | - | pass |  |
| Users | adds an editor with a temporary password | - | pass |  |
| Sign out | signs out to the sign-in page | - | pass |  |
| Sign in | temporary password goes to Choose a new password | pass | - |  |
| Sign in | new password saved, dashboard opens | pass | - | http://localhost:3000/admin |
| Sidebar | Redirects and Users not shown | pass | - | Dashboard/Pages/Blog Posts/Media Library/Team/Enquiries/SEO/Site Settings |
| Dashboard | no Import or Reset tools for the practice | pass | - |  |
| Restrictions | /admin/users refused | pass | - | 404 -> /admin/users |
| Restrictions | /admin/redirects refused | pass | - | 404 -> /admin/redirects |
| Restrictions | /cms refused | pass | - | 200 -> /cms/unauthorized |
| Restrictions | cannot change a page address (slug) through the API | pass | - | the request is accepted but the address stays "about" |
| Restrictions | cannot delete a page | pass | - | DELETE 403 |
| Restrictions | cannot add a redirect | pass | - | POST 403 |
| Restrictions | cannot add a user | pass | - | POST 403 |
| Restrictions | cannot hide the whole site from Google | pass | - | the request is accepted but the switch stays off |
| Restrictions | cannot change enquiry recipients | pass | - | the request is accepted but the list is unchanged |
| Restrictions | cannot see tracking IDs | pass | - | not in the settings an Editor receives |
| Media Library | upload JPG (0.7 MB) | pass | - | Photo uploaded. Click it to add a description. |
| Media Library | upload PNG | pass | - | Photo uploaded. Click it to add a description. |
| Media Library | upload large phone photo (7.6 MB, 4032 x 3024) | pass | - | made smaller in the browser and sent as 0.92 MB; stored as a 2400 x 1800 WebP |
| Media Library | upload iPhone HEIC photo | pass | - | test-iphone-photo.heic is an iPhone photo in HEIC format, which this browser cannot open. Please upload it as a JPG: on the iPhone, open Settings, Camera, Forma |
| Media Library | search finds the photo | pass | - | 1 shown for "test phone" |
| Media Library | edit a description | pass | - | Saved. |
| Media Library | Replace everywhere (upload a replacement) | pass | - | Photo replaced everywhere it is used. Publish website to put it live. |
| Media Library | delete an unused photo | pass | - | Photo deleted.; asked: Delete this photo? It is not used anywhere on the website. |
| Page editor | edit words in place, accent word kept | pass | pass | We’re here to care today today; We’re here to care today |
| Page editor | change a button's link | pass | pass |  |
| Page editor | replace the hero photo (under its overlay) | pass | pass | a Media Library photo (/api/media/file/...) |
| Page editor | edit the photo description | pass | pass |  |
| Page editor | desktop and mobile view | pass | pass | mobile frame 390px; mobile frame 390px |
| Page editor | unsaved changes warning before leaving | pass | pass | You have unsaved changes. Leave without saving?; You have unsaved changes. Leave without saving? |
| Page editor | Save changes | pass | pass |  |
| Page editor | View the page (preview link) | pass | pass | / |
| Page editor | SEO tab: title, description, share picture and the address note | pass | pass |  |
| Page editor | SEO tab: Hide from Google and canonical for GYA | - | pass |  |
| Page editor | Sections: hide and show a section | pass | pass | Get to know us; Get to know us |
| Page editor | Sections: drag to reorder | pass | pass | Hero banner / Explore our services / We’re here to care / Get to know us -> Hero banner / We’re here to care / Explore our services / Get to know us; Hero banne |
| Page editor | footer opening hours are editable | pass | pass | c:footer/answer-1; c:footer/answer-1 |
| Page editor | Publish website gives a plain answer | pass | pass | Publishing is not set up yet.; Publishing is not set up yet. |
| Team | team photo on the Our Team page shows the photo help (4:3, colour automatic) | pass | pass |  |
| Pages | every page opens in the editor with editable words (58) | pass | - | 58 of 58 |
| Page editor | SEO tab: no Hide from Google switch for the practice | pass | - |  |
| Team | edit a role line and save | pass | pass | Holly saved. Press Publish website when you are ready.; Holly saved. Press Publish website when you are ready. |
| Team | add a support team photo and save | pass | pass | Holly saved. Press Publish website when you are ready.; Holly saved. Press Publish website when you are ready. |
| Team | photo help on the Team screen (4:3, at least 800 x 600, colour automatic) | pass | pass |  |
| Media Library | deleting a photo that is in use warns first, with where it is used | - | pass | This photo is still used on the Dentist in East Maitland page, Holly on the Team screen, the blog post "Test post from the dashboard check". Delete it anyway? T |
| Site Settings | opening hours explained (edited in the footer and on Contact) | pass | pass |  |
| Site Settings | health funds explained (part of the approved wording, ask GYA) | pass | pass |  |
| Site Settings | GYA-only fields shown to GYA | - | pass |  |
| Site Settings | change the phone number and save | pass | pass | Settings saved. Press Publish website to put them live.; Settings saved. Press Publish website to put them live. |
| SEO screen | title and description verdicts shown | pass | pass | Good, Too long, Yes, Short, Missing; Good, Too long, Short |
| SEO screen | Worth a look filter | pass | pass | 23 rows; 22 rows |
| SEO screen | Edit pop-up opens | pass | pass |  |
| Media Library | deleting a photo that is in use is refused, with where it is used | pass | - | This photo is still used on the Dentist in East Maitland page, Holly on the Team screen. Replace it there first, or use Upload a replacement to change it everyw |
| Site Settings | GYA-only fields (tracking, enquiry recipients, hide from Google) not shown | pass | - |  |
| Blog | write with a heading, a list, a link and an inline photo | pass | - | h2, list, link to /contact and an inline photo saved |
| Blog | featured photo and share picture chosen | pass | - | 2 photo slots |
| Blog | publish the post | pass | - | status published in the dashboard |
| Enquiries | Contact form sends | pass (visitor) | - | Thank you. Your message is on its way and we will be in touch shortly. |
| Enquiries | email handed to SMTP2GO (stand-in): recipients and from-address | pass (visitor) | - | to reception@toothncare.com.au and rowayne@gyaclients.com, from "Tooth n Care Website" website@toothncare.com.au (the first run also went to the SmileOX placeholder: fixed, see below) |
| Enquiries | the enquiry is listed, with the page it came from | pass | - |  |
| Enquiries | tick Followed up | pass | - |  |
| Enquiries | add a note | pass | - |  |
| Enquiries | download as CSV | pass | - | 200 text/csv; charset=utf-8 |
| Enquiries | enquiries and the CSV need a sign in | pass (visitor) | - | CSV 401, list 403 |
| Enquiries | attachments | pass (visitor) | - | the Contact form takes no attachments, so there is nothing to download |
| Publish | upload a photo in the Media Library, put it on the Home page, save | pass | - | test-photo-1mb-2.webp, served from /api/media/file/ |
| Publish | a build from the database shows the edits (words, link, photo description, uploaded photo) | - | pass | Home has the edited heading, link, description and the uploaded photo |
| Publish | the check after the build accepts dashboard photos (/api/media/file) | - | pass | build passed; the local Blob stand-in cannot serve the file, so it is a warning, not a failure |
| Publish | the published post is on /blog, has its own page and is in the sitemap | - | pass | /blog/test-post-from-the-dashboard-check 200, in sitemap.xml |
| Publish | Reset to the repository's content, then pull: content/ is byte for byte the release | - | pass | diff -r: no differences (pages, team, site settings, posts, redirects) |
| Blog | unpublish a post (back to a draft) | pass | - | status published -> draft |
| Blog | delete the post | pass | - |  |
| Pages | every page opens in the editor with editable words (58), no errors | pass | pass | 58 of 58; 58 of 58 |

A dash means the line does not apply to that role (for example Users and
Redirects are GYA only) or was run once for both.

### Database and build

| Check | Result |
| --- | --- |
| Start point | `origin/main` at `f15e43b` (v2.8.1) |
| Brand new database, `payload migrate` | all 14 migrations run (failed at `20261104` before the fix) |
| Media Library with a Blob token, before `20261120_090000` | 500 on `/api/media` (columns `prefix` and `_objectkey` missing); after it: 200, uploads work |
| `payload migrate:create` after all migrations | "No schema changes detected" |
| Imported database (v2.8.1 state), migrate then pull | 37 values marked, 11 redirects added, the SmileOX placeholder removed; the pull gave back the repository's v2.9.0 content byte for byte |
| Running the v2.9.0 migration a second time | nothing changed ("37 already marked", 0 redirects added) |
| Database edited in the dashboard (team name, Contact wording, a share picture, the Teeth Whitening cost wording), then migrate | the edits kept; the Teeth Whitening wording named in the build log as edited; everything else marked |
| Undoing the migration (`migrate:down`), then pull | the v2.8.1 content byte for byte, apart from the placeholder recipient, which is not put back by design |
| Database build (`npm run build` with the test database) after dashboard edits | the edits, the uploaded photo and the published post are on the built site; the post is on `/blog` and in the sitemap; the check after the build passed (the uploaded photo could not be served by the stand-in, so it is a warning) |
| `npm run build` (repository content), `npm run qa` | clean: typecheck, banned words (0 em dashes), secrets, images, roles, editor parity 58 of 58, `qa:golive` 15 of 15, the check after the build |

### Website

| Check | Result |
| --- | --- |
| Every page in the sitemap (55), v2.8.1 against v2.9.0 | 31 identical. 24 differ, all from the go-live switch: the $199 offer strip and suburb offer sections gone, the cost cards and FAQ answers that name an unconfirmed offer gone, `[VERIFY]` notes gone from Offers, Teeth Whitening and FAQ (Privacy and Terms, which are not in the sitemap, also lose theirs), the Offers and Payment Options descriptions without the hidden offers |
| Every internal link, photo, stylesheet and script (265) | all 200, or a redirect to a 200 |
| Old addresses (770) | 1 same address, 769 in one redirect, 0 chains, 0 not found |
| Every page in the sitemap plus Privacy and Terms (57): canonical on www, no `vercel.app` or bare-domain address, no `[VERIFY]` or "to be confirmed", no "$199", "5% seniors", "seniors discount" or "discounted rate", every link and picture 200 directly (5,175) | 0 problems |
| The same page check against the v2.8.1 build | fails on 24 pages for the offer words and on Offers, Teeth Whitening, FAQ, Privacy and Terms for `[VERIFY]` (so the check works) |
| GA4 ID set in Site Settings with the current Privacy Policy (tried, then put back) | the build stops with a plain message |
| Go-live switch with dates (`npm run qa:golive`) | hidden before the start date, shown on the first and last day with the end date for the browser, hidden the day after; "+" offers need both; whitening needs its price confirmed |
| Enquiry recipients | reception and rowayne@gyaclients.com only; a placeholder or made-up SmileOX address in any setting is skipped |
| Em dashes in the repository | 0 |

## 20. What could not be tested here

| What | Why | What to do |
| --- | --- | --- |
| A real enquiry arriving in both inboxes | No SMTP2GO key and no access to the mailboxes | Send one from the preview address once the key is set, and confirm it lands at reception and at rowayne@gyaclients.com (and the SmileOX intake address once it is added) |
| Neon and Vercel Blob | They live in your Vercel account | Everything was tested against a local Postgres with the same migrations and a Blob stand-in. On the preview: `docs/CHROME-DASHBOARD-CHECK.md` (uploads, a test post, runtime logs, the read-only column check) |
| The live deploy hook | Created in your Vercel project | The button is wired and reports clearly when the hook is missing |
| Publish website with a real deploy hook, and dashboard photos served from Blob | Need the Vercel project | `docs/CHROME-DASHBOARD-CHECK.md` lines 5, 9 and 12 |
| The live site's raw HTML (tracking codes, verification tags, every title) | Only a summary of the live pages could be read from here | `bash scripts/seo/export-live-site.sh` on a Mac, then upload the zip |
