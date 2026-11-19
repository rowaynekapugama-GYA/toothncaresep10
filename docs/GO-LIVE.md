# Going live on toothncare.com.au

Written 17 November 2026 for v2.8.0. Nothing here has been changed at the
domain, the DNS host or Vercel: this is the plan for the switch.

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

All 308 (permanent). Tested on the v2.8.0 build: all 334 listed addresses,
plus every suburb folder with and without the closing slash and every service
page in all 21 suburb folders (741 addresses), end on a working page in at
most three hops.

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
3. In the dashboard, **Site Settings**, enquiry recipients:
   `reception@toothncare.com.au`, the SmileOx intake address and
   `rowayne@gyaclients.com`. The address compiled in as a last resort still
   has a placeholder for SmileOx (`smileox-intake-PLACEHOLDER@...` in
   `src/site.config.ts`): replace it once the practice sends the real one.
4. Send a test enquiry and check it arrives at all three addresses and under
   **Enquiries**. (The "[VERIFY] form endpoint not yet connected" note under
   the form was removed in v2.8.1: the form is connected, and every enquiry is
   saved in the dashboard even if an email fails.)

## 7. Before the switch

- [ ] The practice has approved the staging site.
- [ ] DNS login from Nish (section 1).
- [ ] TTLs lowered the day before.
- [ ] SMTP2GO domain verified, variables set, a test enquiry received at all
      three addresses.
- [ ] Every go-live blocker in section 7a answered by the practice and the
      matching `[VERIFY]` note removed (they show on the live pages).
- [x] Share image: since v2.8.1 the shopfront photo without the NOW OPEN
      A-frame, cropped to 1200 x 630 (`/images/img-b0fc5965f7.jpg`), everywhere.
- [ ] Editor logins created for Nish and Christine through **Users** (once
      their email addresses are confirmed).
- [ ] `ALLOW_FIRST_USER` not set anywhere.

## 7a. Go-live blockers: questions for the practice

These `[VERIFY]` notes are visible on the pages and stay until the practice
answers. Nothing in them is changed without the practice's wording (prices and
legal text especially).

| Page | Note on the page (exact) | Question to ask | When answered |
| --- | --- | --- | --- |
| Offers, Philips ZOOM in-chair whitening card | "[VERIFY price]" where the price goes, and "[VERIFY] current price and RRP comparison to be confirmed before publishing." | What is the exact price of in-chair whitening, what does it include, and when does the offer start and end? If you want to show it against the usual price, what is the usual price? (AHPRA: price, inclusions and offer period must all be stated.) | Put the price and period in, remove both notes |
| Teeth Whitening, cost | "[VERIFY] current pricing to be confirmed before publication." | What does in-chair Philips ZOOM whitening cost now, and the take-home trays? Is the in-chair price still "a discounted rate"? | Add the prices, remove the note |
| FAQ, orthodontics | "[VERIFY] whether the practice is a current Invisalign provider and licensed to use the brand name - until that's confirmed we describe the treatment generically." | Is the practice a current Invisalign provider (listed on the Invisalign Doctor Locator)? If yes, the page can name Invisalign; if no, it keeps "clear aligners". | Remove the note either way |
| Privacy Policy, cookies | "[VERIFY] if analytics are added before launch, this section must be updated to name the provider and explain the opt-out." | Will Google Analytics and the Meta Pixel be switched on at launch? If yes, the practice (and its solicitor, if it wishes) needs to approve wording that names them and explains how to opt out. | Update the section, remove the note |
| Privacy Policy, review | "[VERIFY] to be reviewed by the practice, and by a solicitor if the practice wishes, before going live." | Has the practice (or its solicitor) read and approved the Privacy Policy? | Remove the note |
| Terms, review | "[VERIFY] to be reviewed by the practice, and by a solicitor if the practice wishes, before going live." | Has the practice (or its solicitor) read and approved the Terms? | Remove the note |

Not a `[VERIFY]` note, but the same AHPRA rule: the other offers on Offers (new
patient first visit $199, seniors 5% off) state the price and inclusions but
no offer period. Ask whether they are ongoing (say so) or end on a date.

Also waiting on the practice before go live:

- The DNS login for toothncare.com.au (Webpulse) from Nish.
- The email addresses Nish and Christine want for their dashboard logins.
- The SmileOx intake address for enquiries.

Wanted but not blocking: AHPRA numbers for Dr Nish, Dr Nav and Zoe; Dr
Dimple's full name, AHPRA number and whether she holds specialist
registration in Orthodontics; how Dr Rav would like her name shown, a bio and
a photo; support team photos with written consent.

## 8. After the switch

- [ ] `https://toothncare.com.au` and `http://www.toothncare.com.au` both land
      on `https://www.toothncare.com.au` with a padlock.
- [ ] Spot check old addresses: `/dental-implants.htm`, `/maitland/`,
      `/maitland/dental-implants.htm`, `/meet-our-teams.htm`.
- [ ] Send a test enquiry from the live form; check all three inboxes and
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
- [ ] GA4 and Meta Pixel IDs in **Site Settings**, **Tracking**, and a real
      visit showing in GA4 Realtime.
- [ ] A week later: Vercel logs and Search Console for 404s from old
      addresses not covered above.
- [ ] After 30 days with no issues: cancel the old hosting, keeping the DNS
      (or move the DNS somewhere the practice controls first).

## 9. Worth raising with the practice (not part of the switch)

These are about the practice's email, not the website, and should only be
changed with whoever manages their Google Workspace:

- The SPF record does not include Google (`include:_spf.google.com`), so mail
  the practice sends through Gmail can fail SPF checks.
- There is no Google DKIM key (`google._domainkey`) and no DMARC record. Gmail
  and Yahoo now expect both for reliable delivery.
