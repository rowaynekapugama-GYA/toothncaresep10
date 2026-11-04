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
import { allSlugs, getChrome, getPage } from '../src/lib/content'
import { siteTokens } from '../src/lib/site'
import { renderBody } from '../src/dashboard/render'
import { chromeFieldEditable } from '../src/dashboard/pages'

const strip = (html: string) => html
  .replace(/<span class="pd-tok" contenteditable="false" data-pdt="[^"]*">/g, '\u0000')
  .replace(/\u0000([^<]*?)<\/span>/g, '$1')
  .replace(/<pd-e data-pde="[^"]*" data-t="[a-z]+">/g, '')
  .replace(/<\/pd-e>/g, '')
  .replace(/ data-(pde|pdi|pda|pdh|pds|pdc)="[^"]*"/g, '')

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
