/**
 * Production build. Pulls whatever the dashboard holds into the content files
 * first, then builds the static site from those files, so the public pages
 * never talk to the database at request time.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

// Vercel sets these for real. Locally they live in .env, which this script
// has to read itself because it runs before Next starts.
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
    if (!match) continue
    const value = match[2].replace(/^["']|["']$/g, '')
    if (!process.env[match[1]]) process.env[match[1]] = value
  }
}

const run = (command, args) => {
  const res = spawnSync(command, args, { stdio: 'inherit', shell: false })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

const quiet = (command, args) => spawnSync(command, args, { stdio: 'inherit', shell: false }).status

const UNSET_MARKER = 'set-PAYLOAD_SECRET-before-deploying'

// BUILD_WITHOUT_DB=1 is a check build on someone's computer (update-and-deploy.sh):
// it must not run migrations on, or pull content from, the live database even
// when a local .env points at it. Vercel never sets it.
const withoutDb = process.env.BUILD_WITHOUT_DB === '1'

if (process.env.DATABASE_URL && !withoutDb) {
  // Dashboard sessions are signed with PAYLOAD_SECRET. With a database attached
  // and the placeholder secret from the public repository, anyone could forge
  // an administrator session, so refuse to build rather than go live like that.
  const secret = process.env.PAYLOAD_SECRET || ''
  if (!secret || secret === UNSET_MARKER || secret.length < 32) {
    console.error(
      '\n> stopped: DATABASE_URL is set but PAYLOAD_SECRET is missing or too short.\n'
        + '  Add PAYLOAD_SECRET in Vercel, Settings, Environment Variables: any random\n'
        + '  string of 32 characters or more. Then redeploy.\n',
    )
    process.exit(1)
  }

  console.log('> applying database migrations')
  run('npx', ['payload', 'migrate', '--force-accept-warning'])

  console.log('> pulling content from the dashboard')
  const status = quiet('npx', ['tsx', 'scripts/pull-content.ts'])
  if (status !== 0) {
    console.log('> could not pull content, building from the files already in the repo')
  }
} else {
  console.log(withoutDb
    ? '> BUILD_WITHOUT_DB=1, building from the content files in the repo without touching the database'
    : '> no DATABASE_URL, building from the content files in the repo')
}

console.log('> building the site')
run('npx', ['next', 'build'])
