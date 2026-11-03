#!/usr/bin/env node
/**
 * No page may point at a picture on somebody else's server. Everything the
 * site shows must live in this repository or in the practice's own storage.
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN = ['content', 'src', 'public/styles']
const EXTS = ['.json', '.ts', '.tsx', '.css', '.mjs']

// the practice's own media storage is fine, as is Google Fonts and the map embed
const ALLOWED_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.google.com',
  'schema.org',
  'apac.dentalhub.online',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'api.smtp2go.com',
  'blob.vercel-storage.com',
  'toothncare.com.au',
  'toothncare.vercel.app',
]

const URL_RE = /https?:\/\/([a-z0-9.-]+)[^\s"'<>)\\]*\.(?:jpe?g|png|gif|webp|avif|svg)/gi

function walk(dir, out = []) {
  for (const entry of globSync('*', { cwd: dir, withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (EXTS.includes(path.extname(entry.name))) out.push(full)
  }
  return out
}

let found = 0
for (const base of SCAN) {
  for (const file of walk(path.join(ROOT, base))) {
    const text = readFileSync(file, 'utf8')
    let m
    URL_RE.lastIndex = 0
    while ((m = URL_RE.exec(text))) {
      const host = m[1].toLowerCase()
      if (ALLOWED_HOSTS.some((h) => host === h || host.endsWith('.' + h))) continue
      const line = text.slice(0, m.index).split('\n').length
      found++
      console.log(`FOUND ${path.relative(ROOT, file)}:${line}  ${m[0].slice(0, 90)}`)
    }
  }
}

console.log(found === 0 ? '\nno pictures are loaded from another site' : `\n${found} external picture references`)
process.exit(found > 0 ? 1 : 0)
