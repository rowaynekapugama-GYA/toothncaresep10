#!/usr/bin/env node
/**
 * Role titles live in one place: src/team.config.ts. The pages only hold
 * placeholders such as {{site:zoeRole}}. This fails if a role title has been
 * typed into a page, its Google title or description, or its structured data,
 * so the next change of title cannot miss a spot.
 *
 * Not checked: content/team.json (the dashboard's own team list, not shown on
 * the website), blog posts (they may talk about hygienists in general), and
 * degree or scheme names ("Bachelor of Oral Health", "Oral Health Fee For
 * Service Scheme"), which are not role titles.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ROLE = /\b(oral health therapists?|dental hygienists?|hygienists?|dental therapists?|dental prosthetists?|prosthetists?|\bOHT\b)/gi
// "[VERIFY ...]" style placeholders next to registration details
const PLACEHOLDER = /(\[VERIFY reg[^\]]*\]|AHPRA[^<"]{0,40}(TBC|XXXX|TBA))/gi

const files = readdirSync(path.join(ROOT, 'content', 'pages')).filter((f) => f.endsWith('.json'))
const chrome = path.join(ROOT, 'content', 'site-chrome.json')
let found = 0

function check(file, where, text) {
  if (typeof text !== 'string' || !text) return
  for (const re of [ROLE, PLACEHOLDER]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) {
      found++
      const ctx = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' ')
      console.log(`FOUND ${file} ${where}: "${m[0]}"  ...${ctx}...`)
    }
  }
}

for (const f of files) {
  const page = JSON.parse(readFileSync(path.join(ROOT, 'content', 'pages', f), 'utf8'))
  for (const [k, v] of Object.entries(page.meta ?? {})) check(f, `meta.${k}`, v)
  ;(page.jsonLd ?? []).forEach((b, i) => check(f, `schema #${i + 1}`, typeof b === 'string' ? b : JSON.stringify(b)))
  for (const s of page.sections ?? []) {
    check(f, `${s.key} (layout)`, s.template)
    for (const fld of s.fields ?? []) check(f, `${s.key} / ${fld.id}`, fld.value)
  }
}
check('site-chrome.json', 'menu and footer', readFileSync(chrome, 'utf8'))

console.log(found === 0
  ? 'role titles: none typed into the pages; all come from src/team.config.ts'
  : `\n${found} role titles or registration placeholders typed into the pages. Use the {{site:...}} placeholders from src/team.config.ts instead.`)
process.exit(found > 0 ? 1 : 0)
