#!/usr/bin/env node
/**
 * URL parity: does every address from the old site still lead somewhere, in one hop?
 *
 *   node scripts/seo/check-url-parity.mjs --base https://toothncaresep10.vercel.app
 *   node scripts/seo/check-url-parity.mjs --base https://www.toothncare.com.au --site https://www.toothncare.com.au
 *
 * Options
 *   --base URL     the site to test (default http://localhost:3000)
 *   --list FILE    old addresses, one per line (a path or a full URL, anything after a tab
 *                  is a note); CSV files work too (the column named url, or the first column).
 *                  Repeat for several files. Default: docs/seo/old-urls.txt
 *   --old FILE     the live-site export CSV (scripts/seo/export-live-site.sh): its title,
 *                  description, H1, canonical and robots are compared with the new pages
 *   --site URL     the address canonicals must use (default https://www.toothncare.com.au)
 *   --pages        also check every page in the new sitemap (and the Privacy Policy and
 *                  Terms, which are kept out of it): 200, no [VERIFY] or "to be
 *                  confirmed" text, canonical
 *                  and og:url on --site, no vercel.app or bare-domain addresses, and every
 *                  internal link and picture answering 200 with no redirect. A photo uploaded
 *                  in the dashboard (/api/media/file/...) that does not answer is a warning
 *   --absent TEXT  (with --pages) fail if a page shows this text; repeat for several
 *   --strict-media make that a failure too (use it on the preview, not in the build)
 *   --out FILE     write every row as CSV (default docs/seo/url-parity-<date>.csv, or none with --no-out)
 *   --quiet        only the summary
 *
 * Exit code 1 if an old address ends in a 404 or other error, or takes more than one
 * redirect, or (with --pages) a page check fails. Nothing secret is printed or needed.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt }
const all = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []))
const has = (name) => args.includes(name)

const BASE = String(opt('--base', 'http://localhost:3000')).replace(/\/+$/, '')
const SITE = String(opt('--site', 'https://www.toothncare.com.au')).replace(/\/+$/, '')
const LISTS = all('--list').length ? all('--list') : ['docs/seo/old-urls.txt']
const OLD = opt('--old', '')
const today = new Date().toISOString().slice(0, 10)
const OUT = has('--no-out') ? '' : opt('--out', `docs/seo/url-parity-${today}.csv`)
const QUIET = has('--quiet')
const ABSENT = all('--absent')
const HUBS = new Set(['/', '/areas-we-serve', '/services'])
const MAX_HOPS = 6

// ---------------------------------------------------------------- CSV helpers
function parseCsv(text) {
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((x) => x !== ''))
}
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }

/** The path (with any query) of an old address, whatever host it was written with. */
function toPath(raw) {
  const s = String(raw || '').trim()
  if (!s || s.startsWith('#')) return ''
  try {
    if (/^https?:\/\//i.test(s)) { const u = new URL(s); return (u.pathname || '/') + u.search }
  } catch { return '' }
  return s.startsWith('/') ? s : `/${s}`
}

function readList(file) {
  const text = readFileSync(file, 'utf8')
  const out = []
  if (/\.csv$/i.test(file)) {
    const rows = parseCsv(text)
    const head = rows[0].map((h) => h.trim().toLowerCase())
    let col = head.findIndex((h) => ['url', 'address', 'page', 'top pages', 'landing page'].includes(h))
    const start = col >= 0 ? 1 : 0
    if (col < 0) col = 0
    for (const r of rows.slice(start)) { const p = toPath(r[col]); if (p) out.push({ path: p, from: path.basename(file) }) }
  } else {
    for (const line of text.split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue
      const [u, note] = line.split('\t')
      const p = toPath(u)
      if (p) out.push({ path: p, from: note?.trim() || path.basename(file) })
    }
  }
  return out
}

// ---------------------------------------------------------------- page facts
const decode = (s) => String(s ?? '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&nbsp;/g, ' ').replace(/&ndash;/g, '-').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const metaContent = (html, name) => {
  const re = new RegExp(`<meta\\b[^>]*(?:name|property)=["']${name}["'][^>]*>`, 'i')
  const tag = re.exec(html)?.[0] ?? ''
  return decode(/content=["']([^"']*)["']/i.exec(tag)?.[1] ?? '')
}
function facts(html, headers) {
  const robotsHeader = headers?.get?.('x-robots-tag') ?? ''
  const robots = [metaContent(html, 'robots'), robotsHeader].filter(Boolean).join(', ')
  return {
    title: decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]),
    description: metaContent(html, 'description'),
    h1: decode(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]),
    canonical: /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1] ?? /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i.exec(html)?.[1] ?? '',
    ogUrl: metaContent(html, 'og:url'),
    robots,
    indexable: !/noindex/i.test(robots),
  }
}

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'GYA URL parity check' } })
    } catch (e) {
      if (attempt === 2) throw e
      await new Promise((r) => setTimeout(r, 400))
    }
  }
}

/** Follow redirects one at a time from BASE + path. */
async function follow(p) {
  const hops = []
  let url = BASE + p
  for (let i = 0; i <= MAX_HOPS; i++) {
    let res
    try { res = await get(url) } catch (e) { return { status: 'error', hops, final: url, error: String(e.message || e) } }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), url)
      hops.push(res.status)
      // a redirect to the same site keeps testing against BASE (the live host may differ)
      url = next.origin === new URL(BASE).origin || next.origin === new URL(SITE).origin ? BASE + next.pathname + next.search + next.hash : next.href
      continue
    }
    const html = res.status === 200 && (res.headers.get('content-type') || '').includes('html') ? await res.text() : ''
    return { status: res.status, hops, final: url, html, headers: res.headers }
  }
  return { status: 'loop', hops, final: url }
}

// ---------------------------------------------------------------- old addresses
const seen = new Set()
const list = []
for (const f of LISTS) {
  if (!existsSync(f)) { console.error(`cannot find ${f}`); process.exit(2) }
  for (const r of readList(f)) if (!seen.has(r.path)) { seen.add(r.path); list.push(r) }
}
const old = new Map()
if (OLD) {
  const rows = parseCsv(readFileSync(OLD, 'utf8'))
  const head = rows[0].map((h) => h.trim().toLowerCase())
  const ix = (n) => head.indexOf(n)
  for (const r of rows.slice(1)) {
    const p = toPath(r[ix('url')])
    if (p) old.set(p, { title: r[ix('title')] ?? '', description: r[ix('meta_description')] ?? '', h1: r[ix('h1')] ?? '', canonical: r[ix('canonical')] ?? '', robots: r[ix('meta_robots')] ?? '', status: r[ix('status')] ?? '' })
  }
}

const rows = []
const counts = { 'same path 200': 0, 'one redirect': 0, 'redirect chain': 0, 'not found or error': 0 }
let toHub = 0
const queue = [...list]
async function worker() {
  while (queue.length) {
    const item = queue.shift()
    const r = await follow(item.path)
    const finalPath = (() => { try { return new URL(r.final).pathname } catch { return '' } })()
    let result
    if (r.status === 200 && r.hops.length === 0) result = 'same path 200'
    else if (r.status === 200 && r.hops.length === 1) result = 'one redirect'
    else if (r.status === 200) result = 'redirect chain'
    else result = 'not found or error'
    counts[result]++
    const hub = r.status === 200 && r.hops.length > 0 && HUBS.has(finalPath)
    if (hub) toHub++
    const f = r.html ? facts(r.html, r.headers) : {}
    const o = old.get(item.path)
    rows.push({
      old: item.path, from: item.from, result, status: r.status, hops: r.hops.length, codes: r.hops.join(' '),
      final: finalPath + (r.final.includes('#') ? r.final.slice(r.final.indexOf('#')) : ''), hub: hub ? 'yes' : '',
      newTitle: f.title ?? '', newDescription: f.description ?? '', newH1: f.h1 ?? '', newCanonical: f.canonical ?? '', newIndexable: f.indexable === undefined ? '' : f.indexable ? 'yes' : 'no',
      oldTitle: o?.title ?? '', oldDescription: o?.description ?? '', oldH1: o?.h1 ?? '', oldCanonical: o?.canonical ?? '',
      oldIndexable: o ? (/noindex/i.test(o.robots) ? 'no' : 'yes') : '',
      titleChanged: o && f.title !== undefined ? (decode(o.title) !== f.title ? 'yes' : '') : '',
      descriptionChanged: o && f.description !== undefined ? (decode(o.description) !== f.description ? 'yes' : '') : '',
      indexFlip: o && f.indexable !== undefined && (/noindex/i.test(o.robots) ? 'no' : 'yes') !== (f.indexable ? 'yes' : 'no') ? 'yes' : '',
    })
  }
}
await Promise.all(Array.from({ length: 8 }, worker))
rows.sort((a, b) => a.old.localeCompare(b.old))

// ---------------------------------------------------------------- new pages
const mediaWarnings = []
const pageProblems = []
let pagesChecked = 0
let linksChecked = 0
if (has('--pages')) {
  const sm = await get(`${BASE}/sitemap.xml`)
  const xml = sm.status === 200 ? await sm.text() : ''
  if (!xml) pageProblems.push(`sitemap.xml answered ${sm.status}`)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  const checked = new Map()
  const check = async (p) => {
    if (checked.has(p)) return checked.get(p)
    const res = await get(BASE + p).catch(() => null)
    const v = res ? res.status : 'error'
    checked.set(p, v)
    return v
  }
  // pages kept out of the sitemap on purpose are public too: same checks
  for (const extra of ['/privacy-policy', '/terms']) if (!locs.some((l) => toPath(l) === extra)) locs.push(SITE + extra)
  for (const loc of locs) {
    if (!loc.startsWith(`${SITE}/`) && loc !== SITE) pageProblems.push(`sitemap entry not on ${SITE}: ${loc}`)
    const p = toPath(loc)
    const res = await get(BASE + p)
    pagesChecked++
    if (res.status !== 200) { pageProblems.push(`sitemap page ${p} answered ${res.status}`); continue }
    const html = await res.text()
    const f = facts(html, res.headers)
    const expect = SITE + (p === '/' ? '/' : p)
    if (/\[VERIFY/i.test(html)) pageProblems.push(`${p}: [VERIFY] text on the page`)
    // the words of a [VERIFY] note left behind when only the "[VERIFY]" label was marked
    const visible = html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
    const unconfirmed = visible.match(/[^.]{0,60}\b(to be confirmed|TBC|TBA)\b[^.]{0,40}/i)
    // words of an offer that is switched off (check-after-build passes them), anywhere in the
    // page: its text, descriptions, structured data and the site search list
    for (const w of ABSENT) if (html.includes(w)) pageProblems.push(`${p}: shows "${w}", but that offer is switched off in src/golive.config.ts`)
    if (unconfirmed) pageProblems.push(`${p}: unconfirmed wording on the page: "${unconfirmed[0].replace(/\s+/g, ' ').trim()}"`)
    // the home page may be written with or without its closing slash (both are the same address)
    const same = (v) => v === expect || (p === '/' && v === SITE)
    if (!same(f.canonical)) pageProblems.push(`${p}: canonical is ${f.canonical || 'missing'}, expected ${expect}`)
    if (f.ogUrl && !same(f.ogUrl)) pageProblems.push(`${p}: og:url is ${f.ogUrl}, expected ${expect}`)
    const bad = html.match(/https?:\/\/[a-z0-9.-]*vercel\.app[^"'\s<]*|https?:\/\/toothncare\.com\.au[^"'\s<]*/gi)
    if (bad) pageProblems.push(`${p}: points at ${[...new Set(bad)].slice(0, 3).join(', ')}`)
    if (!f.indexable && !/noindex/i.test(res.headers.get('x-robots-tag') || '')) pageProblems.push(`${p}: in the sitemap but marked noindex`)
    // internal links and pictures: straight to a 200
    const refs = new Set()
    for (const m of html.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)) refs.add(m[1])
    for (const m of html.matchAll(/<img\b[^>]*\ssrc=["']([^"']+)["']/gi)) refs.add(m[1])
    // the page's own stylesheets too (a new page without its styles looks broken, v2.9.1)
    for (const m of html.matchAll(/<link\b[^>]*\srel=["']stylesheet["'][^>]*\shref=["'](\/styles\/[^"']+)["']/gi)) refs.add(m[1])
    for (const ref of refs) {
      if (/^(mailto:|tel:|#|javascript:|data:)/i.test(ref)) continue
      let u
      try { u = new URL(ref, SITE + p) } catch { continue }
      if (u.origin !== new URL(SITE).origin && u.origin !== new URL(BASE).origin) continue
      // uploaded photos (/api/media/file/...) are real pictures and are checked; other API calls are not pages
      if ((u.pathname.startsWith('/api/') && !u.pathname.startsWith('/api/media/file/')) || u.pathname.startsWith('/_next/')) continue
      linksChecked++
      const st = await check(u.pathname + u.search)
      if (st === 200) continue
      // A photo uploaded in the dashboard is served from Vercel Blob. If Blob is slow or
      // out of reach during a build, that is a warning, never a failed build; the photo is
      // still in the page. --strict-media makes it a failure (the Chrome check uses it).
      if (u.pathname.startsWith('/api/media/file/') && !has('--strict-media')) { mediaWarnings.push(`${p}: uploaded photo ${u.pathname} answers ${st}`); continue }
      pageProblems.push(`${p}: link or picture ${u.pathname}${u.search} answers ${st}${st >= 300 && st < 400 ? ' (a redirect: link to the final address instead)' : ''}`)
    }
  }
}

// ---------------------------------------------------------------- report
const head = ['old', 'from', 'result', 'status', 'hops', 'codes', 'final', 'hub', 'newTitle', 'oldTitle', 'titleChanged', 'newDescription', 'oldDescription', 'descriptionChanged', 'newH1', 'oldH1', 'newCanonical', 'oldCanonical', 'newIndexable', 'oldIndexable', 'indexFlip']
if (OUT) {
  mkdirSync(path.dirname(OUT), { recursive: true })
  writeFileSync(OUT, [head.join(','), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(','))].join('\n') + '\n')
}
const fails = rows.filter((r) => r.result === 'redirect chain' || r.result === 'not found or error')
if (!QUIET) {
  for (const r of fails) console.log(`FAIL ${r.old} -> ${r.result}, ${r.status}${r.hops ? ` after ${r.hops} redirect${r.hops === 1 ? '' : 's'}` : ''} (${r.final})`)
  for (const p of pageProblems) console.log(`FAIL ${p}`)
  for (const w of [...new Set(mediaWarnings)]) console.log(`WARN ${w} (not a failure: check the photo in the Media Library)`)
}
console.log(`\nURL parity against ${BASE}: ${rows.length} old addresses`)
for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`)
console.log(`  of which sent to a hub page (/, /areas-we-serve, /services): ${toHub}`)
if (old.size) console.log(`  titles changed: ${rows.filter((r) => r.titleChanged).length}, descriptions changed: ${rows.filter((r) => r.descriptionChanged).length}, indexable flips: ${rows.filter((r) => r.indexFlip).length}`)
if (has('--pages')) console.log(`  new pages checked: ${pagesChecked}, internal links and pictures checked: ${linksChecked}, problems: ${pageProblems.length}, uploaded photo warnings: ${new Set(mediaWarnings).size}`)
if (OUT) console.log(`  every row: ${OUT}`)
process.exit(fails.length || pageProblems.length ? 1 : 0)
