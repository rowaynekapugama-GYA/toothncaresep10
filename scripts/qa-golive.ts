/**
 * The go-live switches (src/lib/golive.ts) on fixed dates, so a change to them
 * cannot quietly show an unconfirmed offer or hide a confirmed one. The offers
 * are switched on and off in memory here only; src/golive.config.ts is not
 * touched. npm run qa:golive
 */
import { OFFERS } from '../src/golive.config'
import { applyGoLive, applyGoLiveText, applyGoLiveScript, sectionHidden, goLiveTokens } from '../src/lib/golive'
import fs from 'node:fs'
let failed = 0
const ok = (name: string, v: boolean) => { if (!v) failed++; console.log(`${v ? 'PASS' : 'FAIL'}  ${name}`) }
const offers = JSON.parse(fs.readFileSync('content/pages/offers.json', 'utf8'))
const tpl = offers.sections.find((s: any) => s.key === 'offers-03-current').template as string
const idx = JSON.parse(fs.readFileSync('content/pages/index.json', 'utf8')).bodyScripts[0].inline as string
const span = 'What the <span class="offer offer-newPatient">$199 </span>first visit actually involves.'
ok('off: card markers removed', !/<!--offer:newPatient/.test(applyGoLive(tpl, '2026-11-23')) && !applyGoLive(tpl, '2026-11-23').includes('$199'))
ok('off: inline span removed', applyGoLive(span, '2026-11-23') === 'What the first visit actually involves.')
ok('off: section hidden', sectionHidden({ 'data-offer': 'newPatient' }, '2026-11-23'))
ok('off: search entry neutral', !applyGoLiveScript(idx, '2026-11-23').includes('$199'))
Object.assign(OFFERS.newPatient, { start: '2026-11-23', end: '2026-12-31' })
ok('dated, before start: still off', sectionHidden({ 'data-offer': 'newPatient' }, '2026-11-22'))
ok('dated, first day: on', !sectionHidden({ 'data-offer': 'newPatient' }, '2026-11-23'))
ok('dated, last day: on, with end date for the browser', applyGoLive(span, '2026-12-31').includes('data-offer-end="2026-12-31"'))
ok('dated, day after: off again', applyGoLive(span, '2027-01-01') === 'What the first visit actually involves.')
ok('on: search entry as approved', applyGoLiveScript(idx, '2026-12-01') === idx)
ok('on: description names the $199 visit', goLiveTokens('2026-12-01').offersSummary.startsWith('New patient visit for $199'))
ok('newPatient+seniors needs both', applyGoLive('<!--offer:newPatient+seniors-->X<!--/offer-->', '2026-12-01') === '')
Object.assign(OFFERS.seniors, { ongoing: true })
ok('newPatient+seniors both on: shown, ends with the dated one', applyGoLive('<!--offer:newPatient+seniors-->X<!--/offer-->', '2026-12-01').includes('offer-end:2026-12-31'))
Object.assign(OFFERS.whitening, { ongoing: true, priceConfirmed: false })
ok('whitening ongoing but price not confirmed: off', applyGoLiveText('ZOOM<span class="offer offer-whitening"> at a discounted rate</span>') === 'ZOOM')
Object.assign(OFFERS.whitening, { priceConfirmed: true })
ok('whitening price confirmed: on, mark removed in text', applyGoLiveText('ZOOM<span class="offer offer-whitening"> at a discounted rate</span>') === 'ZOOM at a discounted rate')
ok('verify notes always dropped', applyGoLive('A. <span class="verify">[VERIFY] check.</span>') === 'A.')

console.log(failed ? `\n${failed} go-live check${failed === 1 ? '' : 's'} failed` : '\ngo-live switches: all checks passed')
process.exit(failed ? 1 : 0)
