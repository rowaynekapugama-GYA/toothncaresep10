/**
 * The page editor must show exactly the page the website renders.
 *
 * For every page this renders the body twice from the repository content:
 * plain, and marked for the visual editor. With the editor's markers taken
 * out, the two must be byte for byte the same. It also counts the editable
 * words, photos and links, and fails if a page has none.
 *
 *   npm run qa:editor
 */
import fs from 'node:fs'
import path from 'node:path'
import { allPageFiles as allSlugs, getChrome, getPage } from '../src/lib/content'
import { siteTokens } from '../src/lib/site'
import { renderBody } from '../src/dashboard/render'
import { chromeFieldEditable } from '../src/dashboard/pages'

/** Unwrap the editor's token markers, including a token whose value holds its own markup (Dr Rav's AHPRA line, v2.9.1). */
function unwrapTokens(html: string): string {
  const OPEN = /<span class="pd-tok" contenteditable="false" data-pdt="[^"]*">/g
  let out = ''
  let i = 0
  let m: RegExpExecArray | null
  while ((m = OPEN.exec(html))) {
    const re = /<span\b[^>]*>|<\/span>/g
    re.lastIndex = m.index + m[0].length
    let depth = 1
    let t: RegExpExecArray | null
    let close = -1
    while ((t = re.exec(html))) {
      if (t[0][1] === '/') { if (--depth === 0) { close = t.index; break } } else depth++
    }
    if (close < 0) break
    out += html.slice(i, m.index) + html.slice(m.index + m[0].length, close)
    i = close + '</span>'.length
    OPEN.lastIndex = i
  }
  return out + html.slice(i)
}

const strip = (html: string) => unwrapTokens(html)
  .replace(/<pd-e data-pde="[^"]*" data-t="[a-z]+">/g, '')
  .replace(/<\/pd-e>/g, '')
  .replace(/ data-(pde|pdi|pda|pdh|pds|pdc|pdo)="[^"]*"/g, '')

const chrome = getChrome()
const tokens = siteTokens()
let bad = 0
const totals = { words: 0, photos: 0, links: 0 }
const report: string[] = []
for (const slug of allSlugs()) {
  const page = getPage(slug)!
  const plain = renderBody(page, { chrome, tokens })
  const marked = renderBody(page, { chrome, tokens, editable: true, editableChrome: { footer: chromeFieldEditable } })
  const words = (marked.match(/<pd-e /g) ?? []).length
  const photos = (marked.match(/ data-pdi="/g) ?? []).length
  const links = (marked.match(/ data-pdh="/g) ?? []).length
  totals.words += words
  totals.photos += photos
  totals.links += links
  const same = strip(marked) === plain
  if (!same || words === 0) {
    bad++
    const a = strip(marked)
    let i = 0
    while (i < a.length && a[i] === plain[i]) i++
    report.push(`  ${slug}: ${same ? 'nothing editable' : `differs at ${i}: ${JSON.stringify(a.slice(i, i + 80))} vs ${JSON.stringify(plain.slice(i, i + 80))}`}`)
  }
}
const out = `editor parity: ${allSlugs().length - bad} of ${allSlugs().length} pages identical with the markers removed; `
  + `${totals.words} editable pieces of wording, ${totals.photos} photos and ${totals.links} links marked`
console.log(out)
for (const r of report) console.log(r)
fs.mkdirSync(path.join(process.cwd(), 'docs'), { recursive: true })
process.exit(bad ? 1 : 0)
