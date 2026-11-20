# URL parity and SEO switch check (v2.9.0, 20 November 2026)

What happens to every address of the current website (www.toothncare.com.au,
the custom PHP site on Bluehost) when the domain points at the new site, and
what the SEO team needs to check or send.

## 1. Where the old addresses come from

`docs/seo/old-urls.txt` lists **770 addresses**, one per line with its source:

| Source | Addresses |
| --- | --- |
| The live sitemap (`www.toothncare.com.au/sitemap.xml`) | 334 |
| The same suburb pattern as the sitemap (the live sitemap file is cut off part way through Louth Park, so the other suburb folders' service pages are added by pattern) | 382 |
| Every suburb folder written without its closing slash (`/maitland`) | 21 |
| A link on the live homepage that is not in the sitemap | 1 |
| Addresses from earlier redirect rules (old profile and service folders) | 32 |

The 741 in the v2.8.0 notes were the first three rows before the folders
without a slash and the earlier rule addresses were added.

The old site is not WordPress (custom PHP with a `/cmadmin/` back end), so
there are no `/wp-content/`, `?p=` or feed addresses to cover.

**Still to add when they arrive:** the Google Search Console export (Pages and
Links reports) and an Ahrefs or Semrush top pages and backlinks export. Add
each address to `docs/seo/old-urls.txt` (or pass the CSV with `--list`) and
run the check again. See section 7.

## 2. Result (v2.9.0 build, checked locally and after every build)

| Result | Addresses |
| --- | --- |
| Same address, answers 200 (the homepage) | 1 |
| One redirect (308, permanent) to a page that answers 200 | 769 |
| Redirect chains (two or more hops) | **0** |
| Not found or error | **0** |

Every row, with the new page's title, description, H1, canonical and whether
it can be indexed: `docs/seo/url-parity-2026-11-20.csv`.

**Fixed in v2.9.0:** the suburb folders written with a closing slash
(`/maitland/`) took two hops (the slash was removed first, then the folder
redirected). Next.js no longer removes closing slashes by itself; 11 rules now
send each folder straight to its page, and a last general rule removes a
closing slash from anything else in one hop.

## 3. Redirects to a general page (38)

| Old addresses | Go to | Why |
| --- | --- | --- |
| `/services.htm` and the 21 suburb copies (`/maitland/services.htm` and so on) | `/services` | The old list of services; `/services` is the same list. A real match. |
| 8 suburb folders with no page of their own, with and without the closing slash (16): Aberglasslyn, Gillieston Heights (`/gilleston-heights/`), Green Hills, Louth Park, Oakhampton, Raworth, Raymond Terrace, Tarro | `/areas-we-serve` | No suburb page exists. Google may treat these as "soft 404s" and stop ranking them for those suburb names. **SEO team to decide** whether those 8 suburbs need their own pages (the 10 existing suburb pages show the pattern). |

## 4. Titles and descriptions (for the SEO team, not changed here)

Every new page's title and description is in the CSV. Against the old site:

- Old titles use "Best Dental Clinic" and similar wording. The new titles do not
  (AHPRA), so most titles change.
- The old `about.htm` title has a typo, "Eat Maitland".
- The old `services.htm` description has the phone number +61-431-194-825,
  which is not the practice number (02 4933 4667).
- The dashboard's SEO screen marks 22 pages "Worth a look", mostly
  descriptions longer than Google shows. Shortening them is copy work for the
  content team; nothing was changed here.

A full old-against-new comparison needs the live export (section 7): with
`--old` the CSV fills in the old title, description, H1, canonical and robots
next to the new ones and marks every change.

## 5. Canonicals, sitemap and internal links

- Every page's canonical and `og:url` is `https://www.toothncare.com.au/...`
  (www, no `.htm`, no closing slash). The old site's canonicals are the
  `.htm` addresses on www, so www stays the main address.
- No page links to a `vercel.app` address or to the bare domain.
- Every internal link and picture answers 200 directly (no link goes through a
  redirect): 5,175 checked.
- **Sitemap: 55 addresses.** 58 pages, less the Privacy Policy, Terms and the
  "page not found" page, which are left out on purpose (they are still public
  and are checked the same way). Blog posts are added as they are published.
  The old sitemap had 334 because every service page was repeated in 21 suburb
  folders.

## 6. Search Console, tracking and verification

- **Search Console verification:** no `google-site-verification` tag on the
  live homepage and no Google TXT record in DNS were found, so the current
  property is probably verified another way (or not at all). Recommended: a
  **Domain property** verified by a DNS TXT record at Webpulse (Rowayne adds the
  record), which keeps working through the switch and covers www and the bare
  domain. Then submit `https://www.toothncare.com.au/sitemap.xml`.
- **Tracking:** the live site shows no GA4, Google Tag Manager, Universal
  Analytics or Meta Pixel code. It has a tawk.to chat widget (the new site has
  no chat; tell the practice). The new site's GA4 and Meta Pixel slots (Site
  Settings, GYA only) are empty, which matches the Privacy Policy ("only the
  cookies necessary"). If an ID is added, the build now stops until the
  Privacy Policy's cookies part names the provider.
- Confirm all of this with the export (section 7): its last column lists any
  tracking or verification code found on every page.

## 7. Scripts

Export the live site (run on a Mac before the switch, takes a few minutes, no
logins):

```
bash scripts/seo/export-live-site.sh
```

It writes `live-site-export-<date>.csv`, the files list and a zip in
Downloads. Upload the zip to the Claude chat, or run the check with it:

```
node scripts/seo/check-url-parity.mjs --base https://toothncaresep10.vercel.app \
  --list docs/seo/old-urls.txt --list ~/Downloads/live-site-export-<date>.csv \
  --old ~/Downloads/live-site-export-<date>.csv --pages
```

After the switch, the same check against the real domain:

```
node scripts/seo/check-url-parity.mjs --base https://www.toothncare.com.au --pages --strict-media
```

The build runs the check by itself (`scripts/check-after-build.mjs`): a 404 or
a redirect chain on any old address, a `[VERIFY]` note, unconfirmed wording,
an offer that is switched off, or a broken link stops the build.

## 8. What the SEO team needs to send

1. Search Console: Pages report (indexed pages) and Links report (top linked
   pages), last 12 months.
2. Ahrefs or Semrush: top pages by traffic, and backlinks with their target
   address.
3. Their decision on the 8 suburbs without a page (section 3).
4. Any title or description changes they want before the switch (section 4).
5. Who owns the Search Console property and GA (if any), to add GYA.
