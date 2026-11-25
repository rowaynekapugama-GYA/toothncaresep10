# Going live on toothncare.com.au

Written 17 November 2026 for v2.8.0, updated 20 November 2026 for v2.9.0
(the go-live check) and v2.9.1. Nothing here has been changed at the domain,
the DNS host or Vercel: this is the plan for the switch.

- **Client approval:** Christine confirmed on 20 Nov 2026 that the practice is
  happy to go ahead (Rowayne, 11:01 AM, on the existing handover).
- **Go-live process starts Monday 23 Nov 2026** (about 8 hours of process
  and checks, per Rowayne to Christine, 20 Nov, 2:06 PM, after her "Ok all
  good to go ahead" at 2:00 PM). The exact switch time is to be confirmed.
- This is a status update only: nothing here asks for the site to be published
  or for logins to be created.

## 0. Where v2.9.0 leaves things (20 November 2026)

- **Dashboard:** every Editor and Admin check passed on a local copy of the
  production build with a database made from the migrations alone (results in
  `docs/VERIFICATION.md` section 19). Fixed on the way: photo uploads with Vercel
  Blob (two database columns were missing, so the Media Library failed with
  Blob switched on), large phone photos, iPhone photos, deleting a photo that is
  still in use, and the Editor role (page addresses, hiding a page from Google,
  enquiry recipients and the whole-site noindex switch are now GYA only).
  Still to check on Vercel itself: `docs/CHROME-DASHBOARD-CHECK.md`.
- **Old addresses:** all 770 known addresses land on a working page in one
  redirect, no chains, no 404s. The build now stops if that changes.
  `docs/SEO-URL-PARITY.md`.
- **[VERIFY] notes and offers:** the go-live switch (`src/golive.config.ts`,
  section 7a) keeps every `[VERIFY]` note and every offer without a confirmed
  period off the public pages. Nothing in the wording was changed: the words
  are still in the dashboard, outlined, and come back when the switch says so.
- **Handover:** logins are created only after the switch, by
  `docs/HANDOVER-STEPS-FOR-GYA.md`. The practice guide is
  `docs/Tooth-n-Care-Website-Guide.pdf`.
- **Privacy Policy and Terms:** treated as approved with the whole site
  (Christine, 20 Nov 2026; both pages were on the preview she reviewed, linked
  from every page's footer). `GO_LIVE.legalApproved` records it. GYA has asked
  her to confirm in one line that the approval includes those two pages.
- **Before the launch date:** the rest of section 7.

## 1. Where things are today

Looked up on 17 November 2026 through public DNS. Every answer came from
`162.241.153.127`, the server that hosts the old website.

| What | Record | Value today |
| --- | --- | --- |
| Nameservers (who hosts the DNS) | NS | `ns1.webpulsesolution.org`, `ns2.webpulsesolution.org` |
| Zone last changed | SOA serial | `2026111401` (14 November 2026) |
| Bare domain | A `toothncare.com.au` | `162.241.153.127` (the old site, a Bluehost server run by Webpulse) |
| www | CNAME `www` | `toothncare.com.au` |
| mail | CNAME `mail` | `toothncare.com.au` |
| Email | MX | Google Workspace: `1 aspmx.l.google.com`, `5 alt1.aspmx.l.google.com`, `5 alt2.aspmx.l.google.com`, `10 alt3.aspmx.l.google.com`, `10 alt4.aspmx.l.google.com` |
| SPF | TXT `toothncare.com.au` | `v=spf1 ip4:162.241.153.127 +a +mx +ip4:162.215.209.64 ~all` |
| DKIM (old server) | TXT `default._domainkey` | a cPanel key (`v=DKIM1; k=rsa; p=MIIBIjAN...AQAB;`) |
| DKIM (Google) | TXT `google._domainkey` | none |
| DMARC | TXT `_dmarc` | none |
| IPv6 | AAAA | none |
| CAA | CAA | none (so Vercel can issue the certificate) |

**Who hosts the DNS:** Webpulse (Webpulse Solution), through their nameservers.
The records are changed in Webpulse's control panel (cPanel, Zone Editor), or
by Webpulse on request. **Still needed from Nish:** that login, or the
registrar login for the domain so we can see who controls the nameservers.

**Email:** the practice's email runs on Google Workspace and does not depend on
the website. The switch only touches the `A` record for the bare domain and the
`www` record; the email records stay exactly as they are.

## 2. www or the bare domain

The old site uses `https://www.toothncare.com.au` as its address (its pages
and sitemap say www, and Google lists it that way). So:

- **Main address:** `https://www.toothncare.com.au`
- `https://toothncare.com.au` sends a **308 permanent redirect** to www.

This keeps the site on the address Google already knows.

## 3. The switch, step by step

### The day before

1. In Webpulse's Zone Editor, lower the TTL on the `A` record for
   `toothncare.com.au` and on the `www` CNAME to **300** seconds (they are
   14400 today, four hours). This makes the change, and any roll back, take
   minutes rather than hours.
2. Keep the old hosting account active for at least 30 days after the switch.

### In Vercel (project `toothncaresep10`)

1. **Settings, Domains, Add**: `www.toothncare.com.au`. Then add
   `toothncare.com.au`, and when Vercel asks, choose **Redirect to
   www.toothncare.com.au** with **308**. Make www the primary domain.
2. Vercel then shows the exact records it wants for each. Use the values it
   shows. At the time of writing they are normally:

| Host | Type | Value | TTL |
| --- | --- | --- | --- |
| `toothncare.com.au` (`@`) | A | `76.76.21.21` (or the IP Vercel shows) | 300 |
| `www` | CNAME | `cname.vercel-dns.com` (or the value Vercel shows) | 300 |

3. **Settings, Environment Variables, Production**: set
   `NEXT_PUBLIC_SERVER_URL` to `https://www.toothncare.com.au` (no trailing
   slash). This is the one setting that moves canonicals, the sitemap,
   robots.txt, `og:` tags and the structured data to the live address.
   Then **Redeploy** the latest production deployment.

### At Webpulse (DNS)

1. **Change** the `A` record for `toothncare.com.au` from `162.241.153.127` to
   the Vercel IP.
2. **Change** the `www` CNAME from `toothncare.com.au` to the Vercel value.
3. **Change** the `mail` CNAME to an `A` record pointing at `162.241.153.127`
   (only if anything still uses `mail.toothncare.com.au`, such as an old
   webmail bookmark). Today it follows the bare domain, so without this it
   would start pointing at Vercel.
4. **Add** the SMTP2GO records (section 6).
5. **Keep, untouched:** all five MX records, the SPF TXT record, the
   `default._domainkey` TXT record, and any other TXT record (for example a
   Google site verification) that is there on the day.

Vercel issues the HTTPS certificate on its own once the records resolve,
usually within minutes.

### Rolling back

Put the `A` record back to `162.241.153.127` and the `www` CNAME back to
`toothncare.com.au`. With a 300 second TTL the old site is back within minutes.

## 4. What switches with the domain, and what does not

| Item | How it follows the domain | Checked |
| --- | --- | --- |
| Canonical tags, `og:url`, `og:image` | `siteUrl()` in `src/lib/urls.ts`: `NEXT_PUBLIC_SERVER_URL` first | local build: every canonical and `og:` address absolute |
| `sitemap.xml`, `robots.txt` (`Sitemap:` and `Host:` lines) | the same | local build |
| Structured data (`Dentist`, `Person`, FAQ) | the same; page content still holds `https://toothncare.vercel.app/...` in places, which `src/lib/jsonld.ts` rewrites at build time | no `vercel.app` address in any built page |
| Fallback when no variable is set | `DEFAULTS.siteUrl` in `src/site.config.ts`, now `https://www.toothncare.com.au` | |
| Preview and `*.vercel.app` addresses | every response on a `*.vercel.app` host carries `X-Robots-Tag: noindex, nofollow` (`next.config.mjs`), so the preview address never competes with the real one | |
| Dashboard | sign in at `https://www.toothncare.com.au/admin` after the switch. The preview address stops being accepted for saving changes once the custom domain is the production domain (it is no longer in the allowed origins in `src/payload.config.ts`) | |
| Enquiry emails | sent from `MAIL_FROM` (default `website@toothncare.com.au`) through SMTP2GO; not tied to the website address | |

Hard coded and fine to leave: `src/dashboard/brand.ts` shows
`toothncare.com.au` as a label in the dashboard; `scripts/qa-images.mjs` lists
`toothncare.vercel.app` as an allowed host.

Removed in v2.8.0: the homepage team slider pointed at photos on the old site
(`www.toothncare.com.au/uploaded-files/team/...`) as a fallback. Those
addresses would stop working at the switch, so they are gone.

## 5. Old addresses

The old site's sitemap lists 334 addresses: 44 top level pages, 21 suburb
folders, and the same 31 service pages inside each suburb folder (the sitemap
file is cut off part way through Louth Park, so the other suburb folders'
pages are not listed, but they follow the same pattern and are covered the
same way).

| Old address | Goes to | Rules |
| --- | --- | --- |
| Top level pages, such as `/dental-implants.htm`, `/meet-our-teams.htm` | the matching new page | 76 (since v2.3.0) |
| Old profile and service folders, such as `/our-team/zoe-xu`, `/services/orthodontics/clear-braces` | the matching new page | included above |
| Suburb service pages, such as `/maitland/dental-implants.htm` | the same page as the top level rule (`/dental-implants`) | 31 (v2.8.0) |
| Suburb folders, such as `/maitland/` | the suburb page (`/dentist-maitland`), or `/areas-we-serve` for suburbs without one of their own | 11 (v2.8.0) |

All 308 (permanent). Since v2.9.0, 770 addresses (the 334 in the sitemap,
the same pattern in every suburb folder, every folder with and without the
closing slash, and the addresses of earlier redirect rules;
`docs/seo/old-urls.txt`) are checked after every build: each lands on a
working page in **one** redirect, or the build stops. The 11 suburb folder
rules now also match the folder with its closing slash, which used to take
two hops. Details and the SEO team's list: `docs/SEO-URL-PARITY.md`.

Suburb folders without a page of their own (to `/areas-we-serve`):
Aberglasslyn, Gillieston Heights (`/gilleston-heights/`), Green Hills, Louth
Park, Oakhampton, Raworth, Raymond Terrace and Tarro. Bolwarra and Bolwarra
Heights go to `/dentist-lorn-bolwarra`, Beresfield and Woodberry to
`/dentist-beresfield-woodberry`, Maitland and South Maitland to
`/dentist-maitland`.

**Would show the 404 page:** old picture and file addresses
(`/uploaded-files/...`, `/images/...` from the old site, `/css/`, `/js/`) and
the old admin (`/cmadmin/`). Nothing links to them from search results that
matters; Google drops them.

## 6. Forms and SMTP2GO

The contact form posts to `/api/enquiry`, which saves the enquiry in the
dashboard (**Enquiries**) and emails it through SMTP2GO.

1. In SMTP2GO, **Sending, Verified Senders, Add Sender Domain**:
   `toothncare.com.au`. SMTP2GO then lists three CNAME records (a return path
   such as `em123456`, a DKIM key such as `s123456._domainkey`, and a tracking
   `link`). Add them at Webpulse exactly as shown and press **Verify**.
   They sit alongside the Google Workspace records and do not affect them.
2. In Vercel, Production: `SMTP2GO_API_KEY` (from SMTP2GO, **Sending, API
   Keys**), `MAIL_FROM` (for example `website@toothncare.com.au`) and
   `MAIL_TO` (comma separated, used only if Site Settings has no recipients).
3. In the dashboard, **Site Settings**, enquiry recipients (GYA only):
   `reception@toothncare.com.au` and `rowayne@gyaclients.com`. Add the
   SmileOx intake address there once the practice sends the real one. Until
   then no SmileOx address is used anywhere (v2.9.0 took the placeholder out,
   and the form never emails an address that looks like a placeholder).
4. Send a test enquiry and check it arrives at both addresses and under
   **Enquiries**. (The "[VERIFY] form endpoint not yet connected" note under
   the form was removed in v2.8.1: the form is connected, and every enquiry is
   saved in the dashboard even if an email fails.)

## 7. Before the switch

- [x] The practice has approved the staging site (Christine, 20 Nov 2026).
- [x] Go-live process starts Monday 23 Nov 2026 (about 8 hours of process
      and checks). The exact switch time is to be confirmed.
- [x] Privacy Policy and Terms: approved with the whole site (Christine,
      20 Nov 2026), recorded in `GO_LIVE.legalApproved`.
- [ ] Christine's one-line confirmation that the approval includes the
      Privacy Policy and Terms (asked for; Rowayne to decide if it is needed
      before the switch).
- [ ] DNS login from Nish (section 1).
- [ ] TTLs lowered the day before.
- [ ] SMTP2GO domain verified, variables set, a test enquiry received at both
      addresses. Check that Vercel's `MAIL_TO` (if set) holds no made-up
      SmileOX address: the form now skips one, but it should not be there.
- [ ] v2.9.0 deployed to the preview and `docs/CHROME-DASHBOARD-CHECK.md` run
      (Blob uploads, a test post, the runtime logs, the read-only Neon check).
- [ ] `docs/SEO-URL-PARITY.md` sent to the SEO team; their exports added and
      the check run again.
- [x] `[VERIFY]` notes: kept off the public pages by the go-live switch since
      v2.9.0 (section 7a). The answers are still wanted.
- [x] Share image: since v2.8.1 the shopfront photo without the NOW OPEN
      A-frame, cropped to 1200 x 630 (`/images/img-b0fc5965f7.jpg`), everywhere.
- [ ] `PUBLISH_HOOK_URL` set in Vercel (Production) to a deploy hook on the
      `main` branch, so **Publish website** works. Until then it says
      "Publishing is not set up yet." and changes only go live with the next push.
- [ ] `ALLOW_FIRST_USER` not set anywhere.
- [ ] No practice logins yet: they come after the switch
      (`docs/HANDOVER-STEPS-FOR-GYA.md`).

## 7a. The go-live switch and what each hidden item needs

`src/golive.config.ts` (GYA only, the practice cannot change it). With
`goLive: true` (the default since v2.9.0):

- no `[VERIFY]` note reaches a public page (the build stops if one does), and
- an offer shows only once its period is known: `ongoing: true` (the practice
  confirms in writing it has no end date) or a `start` and `end` date
  (`'YYYY-MM-DD'`, Sydney time). A dated offer drops off by itself after its
  end date: at the next build, and in visitors' browsers on the day.

Change a value, commit and push (or run the next update script); Vercel
rebuilds. The dashboard still shows every hidden word, card and answer with a
dashed outline and a yellow note, so editing a page never loses them.

| Hidden on the website | Where | What brings it back |
| --- | --- | --- |
| $199 or no-gap new patient first visit | Home offer strip, Offers card, New Patients card, 10 suburb pages' offer section, the six service cost cards, Check-ups and Scale, Clean & Oral Hygiene cost wording, four FAQ answers and the FAQ structured data, the Offers description, the site search list | The offer period from the practice: `OFFERS.newPatient` gets `ongoing: true` or `start` and `end` |
| 5% seniors discount | Offers card, Payment Options card and description, one FAQ answer (needs both offers) | The same for `OFFERS.seniors` |
| Philips ZOOM in-chair whitening, $750 including a take-home whitening kit valued at $350 at no extra cost (price from Nish via Christine, 21 Nov 2026, in since v2.9.3, `priceConfirmed: true`) | Offers card, Teeth Whitening cost wording | The offer period from the practice (`ongoing: true`, or `start` and `end`). Also: "at a discounted rate" needs the usual price it is discounted from, or GYA takes those words out; and the practice should be able to show the kit is worth $350 |
| "[VERIFY] offer period, and the usual price behind discounted rate..." | Offers, whitening card | The same answer as above. The note stays hidden either way |
| "[VERIFY] whether the practice is a current Invisalign provider..." | FAQ, orthodontics (and its structured data) | Invisalign yes or no. Yes: GYA may name Invisalign. No: it stays "clear aligners". The note stays hidden either way |
| "[VERIFY] if analytics are added before launch..." | Privacy Policy, cookies | Only matters if GA4 or the Meta Pixel is switched on. The build stops if an ID is set while the policy still says "only the cookies necessary" |
| "[VERIFY] to be reviewed by the practice..." | Privacy Policy and Terms | Approved with the whole site (Christine, 20 Nov 2026), recorded in `GO_LIVE.legalApproved`. The note stays hidden |

Generic wording is left where an offer is hidden: the FAQ keeps "Yes. New
patients can book online any time." and the Offers page keeps the CDBS card.
The approved wording comes back exactly as it was once the offer is on.

Not changed by the switch: the CDBS card ($0 bulk billed, a government
scheme, with its terms) and the "Offers current as of August 2026 ... next
review February 2027" line under the cards.

Still waiting on the practice (not blocking): AHPRA numbers for Dr Nish, Dr Nav
and Zoe; Dr Dimple's AHPRA number and whether she holds specialist
registration in Orthodontics (her full name, Dr Dimple Sharma, arrived with
Nish's bios on 21 Nov 2026); how Dr Rav would like her name shown and her
qualifications; the exact names of Dr Nav's and Dr Dimple's further
qualifications; the whitening offer period; the SmileOX intake address.

## 7b. Dr Rav before launch (v2.9.1, photo v2.9.2, bio v2.9.3)

Nish asked for Dr Rav before launch (Christine, 20 Nov 2026). She is on the
website as a dentist: Our Team card "Dr Rav", role Dentist, her AHPRA line
(DEN0002297808), and her homepage slide. Since v2.9.2 both show her photo
(Christine, 20 Nov 2026, 5:35 PM, taken in reception to match the other
dentists' portraits; Dr Nish and Dr Nav keep theirs). What the dentists have,
side by side:

| | Dr Nish | Dr Nav | Dr Rav | Dr Dimple |
| --- | --- | --- | --- | --- |
| Photo on the card | yes | yes | yes (v2.9.2) | letter D |
| Short bio on the card | yes (v2.9.3, from his own bio) | yes (v2.9.3) | yes (v2.9.3) | yes (v2.9.3) |
| Qualifications | on the profile page | on the profile page (BDS, FRACDS) | ready on her profile page, empty | no |
| AHPRA line | ready, number not supplied yet | ready, number not supplied yet | shown | ready, number not supplied yet |
| Own profile page | `/dr-nisheeth-agrawal` | `/dr-navneet-karan` | ready at `/dr-rav`, switched off | no |
| Homepage slide | photo, bio, interests, View profile | the same | photo, name, AHPRA line, bio (v2.9.3); View profile ready | letter D, name, bio (v2.9.3) |
| Related cards on other pages | on Dr Nav's page | on Dr Nish's page | none (her own page links Dr Nish and Dr Nav) | none |
| Structured data (Person) | on the profile page | on the profile page | ready on her profile page, with the AHPRA number | none |

**Bios (v2.9.3).** Nish sent bios for Dr Nish, Dr Nav, Dr Rav, Zoe and
Dr Dimple (to Christine, 20 Nov 2026 10:30 PM; forwarded 21 Nov 2026
7:50 AM). The Our Team cards, Dr Rav's and Dr Dimple's homepage slides and
Dr Rav's (hidden) profile page use the shortened versions Rowayne wrote for
the cards (21 Nov 2026, 7:51 AM). Dr Nish's bio says more than 20 years in
dentistry and the Hunter since 2008, so every "nearly ten years" on the site
was corrected (his card, slide, profile page and its description and
structured data, and ten suburb pages). Not added until the practice confirms
the exact names: Dr Nav's Postgraduate Diploma in Aesthetic and Restorative
Dentistry and ICOI Fellowship; Dr Dimple's Bachelor of Dental Surgery and
Master of Dental Surgery in Orthodontics (her title stays Dentist). Zoe's
profile already lists her two degrees, as in the new bio.

**Missing for Dr Rav** (from the practice, in writing):

1. Her qualifications: degree, university and year.
2. Whether to show "Dr Rav" or her full name. Nish's bio calls her
   "Dr Ravneet Kaur"; the AHPRA register (16 Nov 2026) has "Dr Ravneet Kaur
   Arora", which the site keeps for the structured data
   (`PRACTITIONERS.rav.showFullName` in `src/team.config.ts`).
3. Optional: languages or areas of interest she would like listed.

Her profile page has the photo and the bio and can go on with one switch
(`PRACTITIONERS.rav.profilePage`), but would show no qualifications yet.

Her photo arrived on 20 Nov 2026 and is on her card, her slide and her
(hidden) profile page, including its structured data.

**When they arrive:** the photo and bio go on her card and slide in the
dashboard (the practice can do this too: `docs/CLIENT-GUIDE.md`, "Adding a new
dentist's photo and bio"). For her profile page, GYA fills in
`content/pages/dr-rav.json` (bio and qualifications; the photo and the
structured data "image" are in since v2.9.2), then sets `PRACTITIONERS.rav.profilePage` to true. The build
stops if the page is switched on without its bio. Its address stays `/dr-rav`
whichever name is shown.

## 7c. Staff photos and permission log (v2.9.1, on in v2.9.3)

A support team photo shows on Our Team only once **Show photo on website
(permission confirmed)** is ticked for that person (Team screen, or
`photoApproved` in `content/team.json`). Rowayne asked for permission to be
confirmed before each one is used. The practice can tick it themselves after
go-live, or GYA can switch it in the repo.

| Person (as on the site) | Photo received | Permission (who confirmed, date) | Shown on site |
| --- | --- | --- | --- |
| Debbie (badge says "Deb") | 20 Nov 2026, Christine's email "Last minute staff photos", body "Deb" | Christine, 20 Nov 2026 5:57 PM ("given all ok consent to have photo up"); Rowayne, 21 Nov 2026 | yes (v2.9.3) |
| Kathryn | 20 Nov 2026 6:52 PM, Christine's email "Kathryn" | the same | yes (v2.9.3) |
| Riley | 20 Nov 2026 6:53 PM, Christine's email "Riley" | the same | yes (v2.9.3) |
| Layeba | 20 Nov 2026, Christine's email "Layeba" | the same | yes (v2.9.3) |
| Holly | 20 Nov 2026 7:54 PM, Christine's email "Holly" ("slightly better quality than my first"; the first was in the 5:57 PM email) | Christine, 20 Nov 2026 | yes (v2.9.3) |
| Christine | 20 Nov 2026 7:59 PM, Christine's email "Christine", her own photo ("used a different photo that I had in my phone") | Christine herself, sending it for the website | yes (v2.9.3) |

Each photo was matched to the person by the subject or body of Christine's
email, never by the picture. Cropped to 4:3 and resized only (800 x 600 sRGB
WebP, no metadata), eyes at the same height across the set; nothing edited.
The four were taken in the same spot, so the end of the practice sign shows at
the top left of each (the person stands too close to the edge of the frame for
a head and shoulders crop to leave it out). Kathryn wears the charcoal
uniform and the others dusty pink: left as it is.

**Switched on in v2.9.3.** Christine wrote "Holly / And given all ok consent
to have photo up" with the staff photos (20 Nov 2026, 5:57 PM), and Rowayne
asked on 21 Nov 2026 for the team photos to be added. Holly's and Christine's
photos use the same crop as the others (Christine's was taken closer, so her
head is a little larger and the top of her hair is cropped). To take a photo
down: dashboard, Team, untick **Show photo on website (permission
confirmed)** on that row, Save, Publish website.

Questions for the practice:

- Debbie or Deb? The site says "Debbie"; her badge says "Deb".
- If anyone on the support team is under 18, their permission should come from
  a parent or guardian as well.

## 7d. Nish's review of 21 Nov 2026 (v2.10.0): still to confirm

Christine, 21 Nov 2026 4:28 PM: Nish "has picked up a few more things ... so
maybe not so ready". **No domain switch until the practice approves v2.10.0.**

The homepage now has a New Patient Offer section (moved up, under "We're here
to care") and the menu has "New Patients & Offers". Like every offer, the
section and the "New Patient Offer" menu link stay off the public pages until
`OFFERS.newPatient` has its period (`ongoing: true`, or `start` and `end`) in
`src/golive.config.ts`. Before that can be set, the practice confirms in
writing:

| # | Question for the practice | Why |
| --- | --- | --- |
| 1 | When does the new patient offer start and end, or is it ongoing? | AHPRA: every offer shows its period |
| 2 | Is it for new patients of every age, or adults only? | Who qualifies |
| 3 | Is the gap waived for every health fund, or only participating funds? (The site says "participating health fund"; the old site said "ALL health fund patients") | The two disagree |
| 4 | Is the gap waived only when the fund pays at least $199, as the old site said? | Condition to print with the price |
| 5 | Is it still a flat $199 for patients without health cover? | The price |
| 6 | Does the first visit include all of: full exam, treatment plan, X-rays, scale and clean, fluoride? Which X-rays (for example two bitewings)? | Inclusions |
| 7 | Is anything excluded (for example a full mouth X-ray or 3D scan, or extra treatment found on the day)? | Conditions |
| 8 | Does the $50 deposit apply to every new patient booking, and does it always come off the visit? | Condition already on the site |
| 9 | Whitening: when does the $750 offer start and end, or is it ongoing? | AHPRA: period |
| 10 | Whitening: is the usual price $1,000 (the old site said "Usually $1000")? If not, we take out "discounted rate" | A discount needs the usual price |
| 11 | Whitening: what is the take-home kit worth on its own (the site says $350)? | The value has to be the real price |
| 12 | Saturdays: still 9am to 4pm, and does the $50 deposit apply to every booking or only Saturdays? | Old-site wording |
| 13 | Payment plans: still through humm, interest free? Any fees or minimum amount? | Old-site wording; credit terms |
| 14 | Kids: the old site said "Save $1056" under CDBS. The site now says up to $1,158 over two calendar years (the 2026 to 2027 cap). OK to keep that, without a "save" figure? | Government cap, changes each year |

Not used from the old site on purpose: "Save $1056" (out of date), "So why
wait!", "TODAY" and "In an EMERGENCY book your appointment today!" (urgency
wording), and "for free" (written "at no extra cost").

The Offers page's other cards (seniors 5%, whitening) are unchanged and stay
off until their periods are set.

## 8. After the switch

- [ ] `NEXT_PUBLIC_SERVER_URL` is `https://www.toothncare.com.au` in Vercel
      Production and the latest production deployment was redeployed after
      setting it (section 3).
- [ ] `https://toothncare.com.au` and `http://www.toothncare.com.au` both land
      on `https://www.toothncare.com.au` with a padlock.
- [ ] The URL check against the real domain:
      `node scripts/seo/check-url-parity.mjs --base https://www.toothncare.com.au --pages --strict-media`
      (0 chains, 0 not found, 0 problems).
- [ ] Sign in at `https://www.toothncare.com.au/admin`. The
      `toothncaresep10.vercel.app` address no longer accepts dashboard sign in
      and saving (expected: it is not an allowed origin once the custom domain
      is production); use the real address from now on.
- [ ] **Publish website** works: `PUBLISH_HOOK_URL` is a deploy hook on
      `main` (Vercel, Settings, Git, Deploy Hooks). Press it once and watch a
      deployment start.
- [ ] Send a test enquiry from the live form; check both inboxes and
      **Enquiries**.
- [ ] Email still arriving at the practice (send one to reception from an
      outside address).
- [ ] Google Search Console: add a **Domain** property for
      `toothncare.com.au` (verified with a TXT record at Webpulse), submit
      `https://www.toothncare.com.au/sitemap.xml`, and use URL Inspection on
      the home page. No change of address is needed: the domain stays the same.
- [ ] Google Business Profile: website link set to
      `https://www.toothncare.com.au/` and the booking link to the online
      booking page.
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] GA4 and Meta Pixel only once the practice has approved Privacy Policy
      wording that names them (the build stops otherwise). Then the IDs in
      **Site Settings**, **Tracking**, and a real visit in GA4 Realtime.
- [ ] Logins for the practice: `docs/HANDOVER-STEPS-FOR-GYA.md`.
- [ ] Tell the practice the old site's tawk.to chat box is gone.
- [ ] A week later: Vercel logs and Search Console for 404s from old
      addresses not covered above.
- [ ] After 30 days with no issues: cancel the old hosting, keeping the DNS
      (or move the DNS somewhere the practice controls first).
- [ ] Separate release after go-live: Next.js 16.4.5 (security fixes released
      3 November 2026; see the v2.9.0 CHANGELOG entry).

## 9. Worth raising with the practice (not part of the switch)

These are about the practice's email, not the website, and should only be
changed with whoever manages their Google Workspace:

- The SPF record does not include Google (`include:_spf.google.com`), so mail
  the practice sends through Gmail can fail SPF checks.
- There is no Google DKIM key (`google._domainkey`) and no DMARC record. Gmail
  and Yahoo now expect both for reliable delivery.
