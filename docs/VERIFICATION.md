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

## 11. What could not be tested here

| What | Why | What to do |
| --- | --- | --- |
| A real enquiry arriving in all three inboxes | No SMTP2GO key and no access to the mailboxes | Send one from the preview address once the key is set, and confirm it lands at reception, at the SmileOx intake address and at rowayne@gyaclients.com |
| Neon and Vercel Blob | They live in your Vercel account | Follow section 1 of `README-CMS.md`. Everything was tested against a local Postgres with the same migrations. |
| The live deploy hook | Created in your Vercel project | The button is wired and reports clearly when the hook is missing |
