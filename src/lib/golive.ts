/**
 * The go-live switches (src/golive.config.ts) applied to page markup.
 *
 * Content marks what depends on a switch:
 *   - a "[VERIFY]" note:        <span class="verify">[VERIFY] the note.</span>
 *   - words that are an offer:  <span class="offer offer-newPatient">...</span>
 *     (a class, not a data attribute, because the page editor keeps classes)
 *   - a card or FAQ answer in a section layout:
 *                               <!--offer:newPatient--> ... <!--/offer-->
 *   - a whole section:          the section's data-offer attribute
 * Several offers joined with "+" (newPatient+seniors) show only when all do.
 *
 * The public site leaves out what is switched off. The dashboard keeps it all
 * (so an edit never loses the hidden words) and outlines it instead.
 */
import { GO_LIVE, OFFERS, type Offer, type OfferKey } from '@/golive.config'

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Today in Sydney, as YYYY-MM-DD. */
export function todayInSydney(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export type OfferState = { active: boolean; end: string; reason: string }

export function offerState(key: string, today = todayInSydney()): OfferState {
  const o = (OFFERS as Record<string, Offer>)[key]
  if (!o) return { active: false, end: '', reason: `unknown offer "${key}"` }
  if (o.priceConfirmed === false) return { active: false, end: '', reason: 'price not confirmed' }
  if (o.ongoing) return { active: true, end: '', reason: 'ongoing' }
  if (!DAY.test(o.start) || !DAY.test(o.end)) return { active: false, end: '', reason: 'no offer period' }
  if (today < o.start) return { active: false, end: '', reason: `starts ${o.start}` }
  if (today > o.end) return { active: false, end: '', reason: `ended ${o.end}` }
  return { active: true, end: o.end, reason: `until ${o.end}` }
}

/** A "+" list of offers: shown only when every one is. The earliest end date wins. */
function stateOf(keys: string, today: string): OfferState {
  let end = ''
  for (const k of keys.split('+').map((x) => x.trim()).filter(Boolean)) {
    const s = offerState(k, today)
    if (!s.active) return s
    if (s.end && (!end || s.end < end)) end = s.end
  }
  return { active: true, end, reason: end ? `until ${end}` : 'ongoing' }
}

export function offerKeys(): OfferKey[] {
  return Object.keys(OFFERS) as OfferKey[]
}

/** Index of the </span> that closes the <span ...> opened at `from`. */
function closingSpan(html: string, from: number): number {
  const re = /<span\b[^>]*>|<\/span>/gi
  re.lastIndex = from
  let depth = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') {
      depth--
      if (depth === 0) return m.index
    } else depth++
  }
  return -1
}

/** Quick test: is anything on this piece marked at all ("verify", "offer" or "offer offer-<key>")? */
// "offer" as a whole class name: class="offer offer-whitening", never class="offer-tag" (v2.10.0 fix)
const MARKED = /class="(?:verify|offer)(?=[\s"])/

const OPEN_MARK = /<span\b(?=[^>]*\bclass="(verify|offer)(?=[\s"])[^"]*")[^>]*>/gi

/** Rewrites the marked spans; `decide` returns 'drop', 'keep' or a replacement opening tag. */
function eachMarkedSpan(html: string, decide: (kind: string, tag: string) => 'drop' | 'keep' | 'unwrap' | { open: string }): { html: string; dropped: number } {
  let out = ''
  let i = 0
  let dropped = 0
  OPEN_MARK.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = OPEN_MARK.exec(html))) {
    const close = closingSpan(html, m.index)
    if (close < 0) break
    const end = close + '</span>'.length
    const verdict = decide(m[1].toLowerCase(), m[0])
    if (verdict === 'drop') {
      // also take the one space in front, so no double space is left, unless the
      // marked words end with their own space ("the <span>$199 </span>first")
      let cut = m.index
      const endsWithSpace = /\s$/.test(html.slice(m.index + m[0].length, close))
      if (!endsWithSpace && cut > 0 && html[cut - 1] === ' ' && cut > i) cut--
      out += html.slice(i, cut)
      dropped++
    } else if (verdict === 'keep') {
      out += html.slice(i, end)
    } else if (verdict === 'unwrap') {
      out += html.slice(i, m.index) + html.slice(m.index + m[0].length, close)
    } else {
      out += html.slice(i, m.index) + verdict.open + html.slice(m.index + m[0].length, end)
    }
    i = end
    OPEN_MARK.lastIndex = end
  }
  return { html: out + html.slice(i), dropped }
}

const BLOCK = /<!--offer:([a-zA-Z+]+)-->([\s\S]*?)<!--\/offer-->/g
const attr = (tag: string, name: string) => (new RegExp(`\\b${name}="([^"]*)"`, 'i').exec(tag)?.[1] ?? '')
/** The offer named by an "offer offer-<key>" class. An unnamed one counts as switched off. */
const offerOfTag = (tag: string) => /\boffer-([a-zA-Z]+)\b/.exec(attr(tag, 'class'))?.[1] ?? 'unnamed'

/** FAQ numbers ("01/", "02/") counted again after an answer is left out. */
function renumber(html: string): string {
  let n = 0
  return html.replace(/(<span class="acc-num">)(\d{1,2})\/(<\/span>)/g, (_w, a: string, d: string, b: string) => {
    n++
    return `${a}${String(n).padStart(d.length, '0')}/${b}`
  })
}

/** The public page: switched-off notes and offers left out. */
export function applyGoLive(html: string, today = todayInSydney()): string {
  if (!html || (!MARKED.test(html) && html.indexOf('<!--offer:') < 0)) return html
  let removed = 0
  let out = html.replace(BLOCK, (_w, keys: string, inner: string) => {
    const s = stateOf(keys, today)
    if (!s.active) { removed++; return '' }
    return s.end ? `<!--offer-end:${s.end}-->${inner}<!--/offer-end-->` : inner
  })
  const spans = eachMarkedSpan(out, (kind, tag) => {
    if (kind === 'verify') return GO_LIVE.goLive ? 'drop' : 'keep'
    const s = stateOf(offerOfTag(tag), today)
    if (!s.active) return 'drop'
    return s.end ? { open: tag.replace(/>$/, ` data-offer-end="${s.end}">`) } : 'keep'
  })
  out = spans.html
  removed += spans.dropped
  return removed && out.includes('class="acc-num"') ? renumber(out) : out
}

/** A section switched off by its data-offer attribute. */
export function sectionHidden(attrs: Record<string, string | null> | undefined, today = todayInSydney()): boolean {
  const keys = attrs?.['data-offer']
  return !!keys && !stateOf(keys, today).active
}

/** The end date to put on a section that shows until a date, or ''. */
export function sectionEnd(attrs: Record<string, string | null> | undefined, today = todayInSydney()): string {
  const keys = attrs?.['data-offer']
  return keys ? stateOf(keys, today).end : ''
}

/** Plain text (meta descriptions, structured data): switched-off parts out, the marks themselves removed. */
export function applyGoLiveText(text: string, today = todayInSydney()): string {
  if (!text || !MARKED.test(text)) return text
  return eachMarkedSpan(text, (kind, tag) => {
    if (kind === 'verify') return GO_LIVE.goLive ? 'drop' : 'unwrap'
    return stateOf(offerOfTag(tag), today).active ? 'unwrap' : 'drop'
  }).html.replace(/ {2,}/g, ' ').trim()
}

/** The little script that drops a dated offer on its last day in the visitor's browser too. */
export const OFFER_EXPIRY_SCRIPT = `(function(){try{var t=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());document.querySelectorAll('[data-offer-end]').forEach(function(e){if(e.getAttribute('data-offer-end')<t)e.remove()});var w=document.createTreeWalker(document.body,NodeFilter.SHOW_COMMENT),c,s=[];while((c=w.nextNode()))if(/^offer-end:/.test(c.nodeValue)&&c.nodeValue.slice(10)<t)s.push(c);s.forEach(function(c){var n=c.nextSibling;while(n&&!(n.nodeType===8&&n.nodeValue==='/offer-end')){var x=n.nextSibling;n.parentNode.removeChild(n);n=x}})}catch(e){}})();`

/** Every offer and its state, for the build log and the dashboard. */
export function offerReport(today = todayInSydney()): { key: string; label: string; state: OfferState }[] {
  return offerKeys().map((k) => ({ key: k, label: OFFERS[k].label, state: offerState(k, today) }))
}

/** The {{site:...}} keys this file provides, for the dashboard's friendly names. */
export const GOLIVE_TOKEN_KEYS = ['offersSummary', 'paymentOptionsSummary']

const list = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`)

/**
 * Descriptions that name offers (Google and link previews), built from what is
 * switched on. With every offer on they read exactly as the approved copy.
 */
export function goLiveTokens(today = todayInSydney()): Record<string, string> {
  const on = (k: string) => offerState(k, today).active
  const offers = [
    on('newPatient') ? 'New patient visit for $199 or no-gap' : '',
    'CDBS children\u2019s dental bulk billed',
    on('whitening') ? 'in-chair whitening' : '',
    on('seniors') ? 'a 5% seniors discount' : '',
  ].filter(Boolean)
  const pay = [
    'HICAPS on-the-spot claiming', 'all health funds welcome', 'CDBS bulk billed', 'DVA',
    'interest-free plans with Humm and DentiCare',
  ]
  return {
    offersSummary: `${list(offers)} - full terms shown up front.`,
    paymentOptionsSummary: on('seniors') ? `${pay.join(', ')}, and a 5% seniors discount.` : `${list(pay)}.`,
  }
}

/**
 * The home page's site search list names the $199 first visit. While that offer
 * is off, its entry points at the Offers page under the page's own title and
 * description instead, so a search for "offer" still finds the page.
 */
const SEARCH_NEW_PATIENT = '{"u": "offers.html", "t": "New Patient Offer", "d": "$199 or no-gap first visit for new patients.", "k": "offer offers deal 199 no gap new patient special"}'

export function applyGoLiveScript(js: string, today = todayInSydney()): string {
  if (!js || js.indexOf(SEARCH_NEW_PATIENT) < 0 || offerState('newPatient', today).active) return js
  const d = goLiveTokens(today).offersSummary.replace(/["\\]/g, '')
  return js.replace(SEARCH_NEW_PATIENT, `{"u": "offers.html", "t": "Current Offers", "d": "${d}", "k": "offer offers deal special cdbs"}`)
}
