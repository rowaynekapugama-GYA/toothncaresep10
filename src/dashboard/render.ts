/**
 * The page as the visual editor shows it (GYA standard dashboard, after the
 * Coastal Dental and Precision Dental editors).
 *
 * The page is built from the same parts, stylesheets and scripts as the live
 * site, and every editable spot is marked:
 * - words become <pd-e data-pde="s:<section>|f3" data-t="text|rich">...</pd-e>, clicked to edit in place;
 *   practice details inside them ({{site:phone}}) are locked chips that fill in from Site Settings;
 * - photos get data-pdi (the photo field) and data-pda (its description field);
 * - links get data-pdh (the address field);
 * - each section's own element gets data-pds, so the Sections tab can scroll to it.
 * Words inside <option>, <script>, <style>, <title>, <textarea> or an SVG drawing are
 * not marked; they are edited in the Sections tab form instead.
 *
 * With marking off, renderPageHtml gives the page exactly as the website renders it,
 * which scripts/qa-editor.ts uses to prove the markers change nothing else.
 */
import type { Chrome, Field, Page, Part } from '@/lib/parts'
import { applyTokens } from '@/lib/tokens'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Figtree:wght@300;400;500;600;700&family=Great+Vibes&display=swap'

const RAW = new Set(['script', 'style', 'title', 'textarea', 'option'])
const PH = /\{\{([a-z][a-z0-9-]*)\}\}/g
const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'track', 'wbr'])

const attrEsc = (v: string) => v.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;').replace(/"/g, '&quot;')

function openTag(tag: string, attrs: Record<string, string | null>, tokens: Record<string, string>, extra = ''): string {
  let out = `<${tag}`
  for (const [k, v] of Object.entries(attrs)) {
    out += v === null ? ` ${k}` : ` ${k}="${attrEsc(applyTokens(v, tokens))}"`
  }
  return `${out}${extra}>`
}

/** Practice details inside words become locked chips; tokens inside tags are left alone. */
function chips(v: string): string {
  return v
    .split(/(<[^>]*>)/)
    .map((seg) => (seg.startsWith('<') ? seg : seg.replace(/\{\{site:([a-zA-Z0-9]+)\}\}/g,
      '<span class="pd-tok" contenteditable="false" data-pdt="$1">{{site:$1}}</span>')))
    .join('')
}

/** Fill a part's {{fN}} placeholders with its values, marking each editable spot. */
export function markTemplate(template: string, scope: string, fields: Field[], canEdit: (f: Field) => boolean = () => true): string {
  const byId = new Map(fields.map((f) => [f.id, f]))
  const value = (id: string) => byId.get(id)?.value ?? ''
  const ref = (id: string) => `${scope}|${id}`
  let svg = 0
  let out = ''
  let i = 0
  const n = template.length

  const text = (s: string) => s.replace(PH, (_m, id: string) => {
    const f = byId.get(id)
    if (!f) return ''
    const v = value(id)
    if (svg > 0 || (f.type !== 'richtext' && f.type !== 'text') || !canEdit(f)) return v
    return `<pd-e data-pde="${ref(id)}" data-t="${f.type === 'richtext' ? 'rich' : 'text'}">${chips(v)}</pd-e>`
  })

  const tag = (t: string, name: string, closing: boolean) => {
    if (closing) return t
    const marks: string[] = []
    const filled = t.replace(/([\w:-]+)=("([^"]*)"|'([^']*)')/g, (whole, attrName: string) => {
      if (!/\{\{[a-z][a-z0-9-]*\}\}/.test(whole)) return whole
      const a = attrName.toLowerCase()
      const id = [...whole.matchAll(PH)].map((m) => m[1])[0]
      const f = byId.get(id)
      if (f && svg === 0 && canEdit(f)) {
        if (name === 'img' && a === 'src' && f.type === 'image') marks.push(`data-pdi="${ref(id)}"`)
        else if (name === 'img' && a === 'alt' && f.type === 'alt') marks.push(`data-pda="${ref(id)}"`)
        else if (name === 'a' && a === 'href' && f.type === 'href') marks.push(`data-pdh="${ref(id)}"`)
      }
      return whole.replace(PH, (_m, fid: string) => value(fid))
    })
    if (!marks.length) return filled
    return filled.replace(/^<([a-zA-Z][\w:-]*)/, `<$1 ${marks.join(' ')}`)
  }

  while (i < n) {
    const lt = template.indexOf('<', i)
    out += text(template.slice(i, lt < 0 ? n : lt))
    if (lt < 0) break
    if (template.startsWith('<!--', lt)) {
      const end = template.indexOf('-->', lt)
      const stop = end < 0 ? n : end + 3
      out += template.slice(lt, stop).replace(PH, (_m, id: string) => value(id))
      i = stop
      continue
    }
    const m = /^<(\/?)([a-zA-Z][\w:-]*)/.exec(template.slice(lt, lt + 64))
    if (!m) { out += '<'; i = lt + 1; continue }
    let j = lt + m[0].length
    let q: string | null = null
    while (j < n) {
      const c = template[j]
      if (q) { if (c === q) q = null } else if (c === '"' || c === "'") q = c
      else if (c === '>') break
      j++
    }
    const t = template.slice(lt, j + 1)
    const name = m[2].toLowerCase()
    const closing = m[1] === '/'
    out += tag(t, name, closing)
    i = j + 1
    if (closing) {
      if (name === 'svg' && svg > 0) svg--
      continue
    }
    if (name === 'svg' && !t.endsWith('/>')) svg++
    if (RAW.has(name)) {
      const close = template.toLowerCase().indexOf(`</${name}`, i)
      const stop = close < 0 ? n : close
      out += template.slice(i, stop).replace(PH, (_m, id: string) => value(id))
      i = stop
    }
  }
  return out
}

/** The same substitution the live site does (lib/parts renderPart). */
function plainInner(part: Part, overrides?: Record<string, string>): string {
  let out = part.template
  for (const f of part.fields) out = out.split(`{{${f.id}}}`).join(overrides?.[f.id] ?? f.value ?? '')
  return out
}

function isEmptySlot(part: Part): boolean {
  const images = part.fields.filter((f) => f.type === 'image')
  return images.length > 0 && images.every((f) => !f.value)
}

function partHtml(part: Part, inner: string, tokens: Record<string, string>, extra = ''): string {
  const open = openTag(part.tag, part.attrs, tokens, extra)
  if (VOID.has(part.tag)) return open
  return `${open}${applyTokens(inner, tokens)}</${part.tag}>`
}

function stickyBar(tokens: Record<string, string>): string {
  const call = '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path>'
  const svg = (inner: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
  return `<div class="sticky-bar" aria-label="Quick actions"><a class="sb-call" href="${attrEsc(tokens.phoneHref ?? '')}" aria-label="Call ${attrEsc(tokens.practiceName ?? '')} on ${attrEsc(tokens.phone ?? '')}">${svg(call)}Call</a><a class="sb-book" href="${attrEsc(tokens.bookingUrl ?? '')}" target="_blank" rel="noopener">${svg('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"></rect><path d="M8 2.5v4M16 2.5v4M3.5 9.5h17"></path><path d="m9.5 14.5 2 2 3.5-3.8"></path>')}Book Online</a></div>`
}

export type RenderOptions = {
  chrome: Chrome
  tokens: Record<string, string>
  /** mark every editable spot for the visual editor */
  editable?: boolean
  /** extra markup for the end of <head> */
  head?: string
  /** run the page's own scripts (on by default) */
  scripts?: boolean
  /** shared parts whose words can be edited on the page, with the rule for which fields */
  editableChrome?: Record<string, (f: Field) => boolean>
}

/** The body of a page, part by part, in the order the live site writes it. */
export function renderBody(page: Page, o: RenderOptions): string {
  const ov = page.chromeOverrides ?? {}
  const out: string[] = []
  for (const step of page.order) {
    if (step === 'jsonLd') continue
    if (step.startsWith('section:')) {
      const s = page.sections[Number(step.slice(8))]
      if (!s || isEmptySlot(s)) continue
      out.push(o.editable
        ? partHtml(s, markTemplate(s.template, `s:${s.key}`, s.fields), o.tokens, ` data-pds="${attrEsc(s.key)}"`)
        : partHtml(s, plainInner(s), o.tokens))
      continue
    }
    if (step.startsWith('script:')) {
      if (o.scripts === false) continue
      const sc = page.bodyScripts[Number(step.slice(7))]
      if (!sc) continue
      out.push(sc.src
        ? `<script${sc.type ? ` type="${attrEsc(sc.type)}"` : ''} src="${attrEsc(sc.src)}" async></script>`
        : `<script>${sc.inline ?? ''}</script>`)
      continue
    }
    const part = o.chrome.parts[step]
    const rule = o.editable ? o.editableChrome?.[step] : undefined
    if (part && rule && !ov[step]) {
      out.push(partHtml(part, markTemplate(part.template, `c:${step}`, part.fields, rule), o.tokens, ` data-pdc="${step}" data-pds="c:${step}"`))
    } else if (part) {
      out.push(partHtml(part, plainInner(part, ov[step]), o.tokens, o.editable ? ` data-pdc="${step}"` : ''))
    }
    if (step === 'stickyCall') out.push(stickyBar(o.tokens))
  }
  return out.join('')
}

/** A whole HTML document for the page, for the editor's preview frame. */
export function renderPageHtml(page: Page, o: RenderOptions): string {
  const hasForm = page.sections.some((s) => s.template.includes('id="enquiryForm"'))
  const css = [
    '/styles/globals.css',
    `/styles/pages/${page.slug}.a.css`,
    '/styles/common.css',
    `/styles/pages/${page.slug}.b.css`,
    '/styles/mobile-fixes.css',
    ...(hasForm ? ['/styles/forms.css'] : []),
  ]
  const title = page.meta?.title ?? ''
  return `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
    + `<link rel="stylesheet" href="${attrEsc(FONTS)}">`
    + css.map((h) => `<link rel="stylesheet" href="${h}">`).join('')
    + `<title>${title.replace(/</g, '&lt;')}</title><meta name="robots" content="noindex, nofollow">${o.head ?? ''}</head>`
    + `<body>${renderBody(page, o)}</body></html>`
}

/** Styles that make the page editable without changing how it looks. */
export const EDIT_CSS = `<style id="pd-edit-css">
pd-e{outline:1px dashed transparent;outline-offset:3px;border-radius:2px;cursor:text;transition:outline-color .15s,background-color .15s}
pd-e:hover{outline-color:rgba(79,216,210,.85)}
pd-e:focus{outline:2px solid #4FD8D2;background-color:rgba(79,216,210,.10)}
pd-e:empty{display:inline-block;min-width:4ch}
pd-e:empty::before{content:'Add words';opacity:.45;font-style:italic}
.pd-tok{background:rgba(79,216,210,.22);border-radius:3px;padding:0 2px;cursor:default}
img[data-pdi]{cursor:pointer}
img[data-pdi]:hover{outline:3px solid rgba(79,216,210,.9);outline-offset:-3px}
img.pd-sel,img.pd-sel:hover{outline:3px solid #4FD8D2;outline-offset:-3px}
.pd-flash{animation:pdflash 1.4s ease}
@keyframes pdflash{0%,40%{box-shadow:inset 0 0 0 4px #4FD8D2}100%{box-shadow:inset 0 0 0 4px rgba(79,216,210,0)}}
.rv{opacity:1!important;transform:none!important}
.acc-body{max-height:none!important;opacity:1!important;margin-top:14px!important}
#progress{display:none!important}
</style>`
