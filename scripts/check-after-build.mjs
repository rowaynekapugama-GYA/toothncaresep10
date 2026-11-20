/**
 * Runs after `next build` (scripts/build.mjs): starts the built site on a spare
 * local port and checks it before Vercel publishes it.
 *   - every old address in docs/seo/old-urls.txt answers 200 directly or after
 *     exactly one redirect (scripts/seo/check-url-parity.mjs)
 *   - every page in the sitemap answers 200, has no [VERIFY] text, has its
 *     canonical on the live address, and links only to pages and pictures that
 *     answer 200 directly
 *   - a GA4 or Meta Pixel ID in Site Settings only with a Privacy Policy that
 *     no longer says the site uses only necessary cookies
 *   - no offer switched off in src/golive.config.ts shows its words ($199, the
 *     seniors discount, the discounted whitening rate) on any public page
 * A failure stops the build. If the local server cannot start at all, the
 * check is skipped with a warning (it cannot tell either way).
 * Set POSTBUILD_CHECK=0 to skip it. npm run qa:built runs it again on the last build.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

if (process.env.POSTBUILD_CHECK === '0') {
  console.log('> POSTBUILD_CHECK=0, skipping the check after the build')
  process.exit(0)
}

// npm run qa:built checks the last build without building again
if (!existsSync('.next/BUILD_ID')) {
  if (process.argv.includes('--require-build')) {
    console.error('> no build to check: run npm run build first (or BUILD_WITHOUT_DB=1 npm run build)')
    process.exit(1)
  }
  console.log('> no build found, nothing to check')
  process.exit(0)
}

const PORT = Number(process.env.POSTBUILD_PORT || 3998)
const base = `http://127.0.0.1:${PORT}`

// GO_LIVE.legalApproved in src/golive.config.ts: a reminder, never a failure
try {
  const cfg = readFileSync('src/golive.config.ts', 'utf8')
  const by = /legalApproved:\s*\{\s*by:\s*'([^']*)'/.exec(cfg)?.[1] ?? ''
  if (!by) console.log('\n> NOTE: the Privacy Policy and Terms are not marked as approved by the practice yet (GO_LIVE.legalApproved in src/golive.config.ts). Do not switch the domain until they are.\n')
} catch { /* no config, nothing to say */ }

// Offers switched off in src/golive.config.ts: their tell-tale words must not reach a public page.
// (Read with a pattern so this check needs no TypeScript; the dates are Sydney dates.)
const OFFER_WORDS = { newPatient: ['$199'], seniors: ['5% seniors', 'seniors discount'], whitening: ['discounted rate'] }
const absent = []
try {
  const cfg = readFileSync('src/golive.config.ts', 'utf8')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  for (const [key, words] of Object.entries(OFFER_WORDS)) {
    const body = new RegExp(`\\n\\s*${key}:\\s*\\{([^}]*)\\}`).exec(cfg)?.[1] ?? ''
    const ongoing = /ongoing:\s*true/.test(body)
    const start = /start:\s*'(\d{4}-\d{2}-\d{2})'/.exec(body)?.[1] ?? ''
    const end = /end:\s*'(\d{4}-\d{2}-\d{2})'/.exec(body)?.[1] ?? ''
    const priced = !/priceConfirmed:\s*false/.test(body)
    const active = priced && (ongoing || (start && end && start <= today && today <= end))
    if (!active) absent.push(...words)
  }
} catch { /* no config, nothing to hide */ }

console.log(`> checking the built site on ${base}`)
// its own process group, so stopping it also stops the server process it starts
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, NODE_ENV: 'production' } })
const stop = () => {
  try { process.kill(-server.pid, 'SIGTERM') } catch { try { server.kill('SIGTERM') } catch { /* already gone */ } }
  server.stdout.destroy(); server.stderr.destroy()
}
process.on('exit', stop)
let log = ''
server.stdout.on('data', (d) => { log += d })
server.stderr.on('data', (d) => { log += d })

let up = false
for (let i = 0; i < 90 && !up; i++) {
  await new Promise((r) => setTimeout(r, 1000))
  try { const r = await fetch(`${base}/sitemap.xml`); up = r.status === 200 } catch { /* not yet */ }
}
if (!up) {
  stop()
  console.log('> WARNING: the built site would not start locally, so the URL and page check was skipped.')
  console.log(log.split('\n').slice(-15).join('\n'))
  process.exit(0)
}
// Tracking IDs (Site Settings) and the Privacy Policy must agree: the policy says the site uses
// only necessary cookies, which stops being true once GA4 or the Meta Pixel is switched on.
let privacyProblem = ''
try {
  const t = JSON.parse(readFileSync('content/site-settings.json', 'utf8')).tracking ?? {}
  const on = [t.ga4 ? 'Google Analytics (GA4)' : '', t.metaPixel ? 'the Meta Pixel' : ''].filter(Boolean)
  if (on.length) {
    const html = await (await fetch(`${base}/privacy-policy`)).text()
    if (/only the cookies necessary/i.test(html)) privacyProblem = `${on.join(' and ')} ${on.length > 1 ? 'are' : 'is'} switched on in Site Settings, but the Privacy Policy still says the site uses only the cookies necessary for it to work. Update the Cookies and website analytics part (naming the providers) before publishing.`
  }
} catch { /* no settings file or no page: nothing to compare */ }

// The address the site was built for (the same order as siteUrl() in src/lib/urls.ts). Before the
// domain switch that is the preview address on Vercel: canonicals point there, and the pages are kept
// out of Google on purpose. On the real domain every page must be indexable (v2.9.2).
const LIVE = 'https://www.toothncare.com.au'
const site = (process.env.NEXT_PUBLIC_SERVER_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  || LIVE).replace(/\/+$/, '')
const live = site === LIVE && process.env.VERCEL_ENV !== 'preview'
console.log(`> the site's address for this build: ${live ? site : 'the preview address (not the live domain yet)'}`)
const res = spawnSync(process.execPath, ['scripts/seo/check-url-parity.mjs', '--base', base, '--site', site, '--pages', '--no-out', ...(live ? [] : ['--allow-noindex']), ...absent.flatMap((w) => ['--absent', w])], { stdio: 'inherit' })
stop()
if (privacyProblem) console.error(`\n> PRIVACY: ${privacyProblem}`)
if (res.status !== 0 || privacyProblem) {
  console.error('\n> STOPPED: the check after the build found problems (above). Fix them, or set POSTBUILD_CHECK=0 to publish anyway.')
  process.exit(1)
}
console.log('> check after the build passed')
process.exit(0)
