import fs from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import type { Chrome, Page, Part, Redirect } from '@/lib/parts'
import { pageToDoc, partToSectionDoc } from '@/sitekit/sync'
import { DEFAULTS } from '@/site.config'

/**
 * Loads the website into the dashboard from the files the site is built from.
 *
 * This is the only implementation. The Import button and `npm run seed` both
 * call it, so they cannot drift apart. They did once: the button skipped the
 * team and the search engine defaults, which only showed up after an Import on
 * a real deployment.
 *
 * It reads the same content/*.json files that pull-content.ts writes, so an
 * import followed by a pull gives back the same bytes.
 *
 * Safe to run more than once. Anything already there is left alone unless
 * `overwrite` is true, which puts it all back to how the repository has it.
 */

const CONTENT = path.join(process.cwd(), 'content')

const CHROME_TITLES: Record<string, string> = {
  header: 'Site header',
  footer: 'Site footer',
  mobileMenu: 'Mobile menu',
  progress: 'Reading progress bar',
  stickyCall: 'Sticky call button',
}

type Result = { created: number; updated: number }

function read<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, rel), 'utf8')) as T
}

function readIfThere<T>(rel: string): T | null {
  const file = path.join(CONTENT, rel)
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as T) : null
}

export async function importContent(payload: Payload, { overwrite = false } = {}): Promise<Result> {
  let created = 0
  let updated = 0

  const upsertPage = async (pageSlug: string, data: Record<string, unknown>) => {
    const found = await payload.find({
      collection: 'pages',
      where: { pageSlug: { equals: pageSlug } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0]) {
      if (!overwrite) return
      await payload.update({ collection: 'pages', id: found.docs[0].id, data: data as never, depth: 0 })
      updated++
      return
    }
    await payload.create({ collection: 'pages', data: data as never, depth: 0 })
    created++
  }

  // ---- pages -------------------------------------------------------------
  const slugs = fs
    .readdirSync(path.join(CONTENT, 'pages'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .sort()

  for (const slug of slugs) {
    const page = read<Page>(`pages/${slug}.json`)
    await upsertPage(
      slug,
      pageToDoc(page, {
        title: page.name || page.meta?.title || slug,
        sortOrder: slug === 'index' ? -1 : 0,
      }) as unknown as Record<string, unknown>,
    )
  }

  // ---- header, footer and the rest of the shared furniture ---------------
  const chrome = read<Chrome>('site-chrome.json')
  for (const [name, part] of Object.entries(chrome.parts) as [string, Part][]) {
    await upsertPage(`_chrome-${name}`, {
      title: CHROME_TITLES[name] ?? name,
      pageSlug: `_chrome-${name}`,
      path: '/',
      isChrome: true,
      sortOrder: -10,
      sections: [partToSectionDoc(part)],
      order: '[]',
      jsonLd: '[]',
      bodyScripts: '[]',
      headScripts: '[]',
      chromeOverrides: '{}',
    })
  }

  // ---- team --------------------------------------------------------------
  // Names, roles and wording come from the pages the practice approved.
  // Never add a qualification or registration number that was not supplied.
  const team =
    readIfThere<Record<string, unknown>[]>('team.json') ??
    (() => {
      const initial = path.join(process.cwd(), 'docs', 'build-notes', 'team-initial.json')
      return fs.existsSync(initial)
        ? (JSON.parse(fs.readFileSync(initial, 'utf8')) as Record<string, unknown>[])
        : []
    })()

  for (const [index, member] of team.entries()) {
    const found = await payload.find({
      collection: 'team',
      where: { name: { equals: member.name as string } },
      limit: 1,
      depth: 0,
    })
    const data = {
      name: member.name,
      role: member.role ?? '',
      credentials: member.credentials ?? '',
      registration: member.registration ?? '',
      bio: member.bio ?? '',
      profileUrl: member.profileUrl ?? '',
      sortOrder: index,
      hidden: false,
    }
    if (found.docs[0]) {
      if (!overwrite) continue
      await payload.update({ collection: 'team', id: found.docs[0].id, data: data as never, depth: 0 })
      updated++
      continue
    }
    await payload.create({ collection: 'team', data: data as never, depth: 0 })
    created++
  }

  // ---- redirects ---------------------------------------------------------
  for (const r of read<Redirect[]>('redirects.json')) {
    const found = await payload.find({
      collection: 'redirects',
      where: { from: { equals: r.from } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0]) continue
    await payload.create({ collection: 'redirects', data: r as never, depth: 0 })
    created++
  }

  // ---- practice details --------------------------------------------------
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as { phone?: string }
  if (overwrite || !settings.phone) {
    await payload.updateGlobal({
      slug: 'site-settings',
      depth: 0,
      data: {
        practiceName: DEFAULTS.practiceName,
        tagline: DEFAULTS.tagline,
        colours: DEFAULTS.colours,
        phone: DEFAULTS.phone,
        email: DEFAULTS.email,
        address: DEFAULTS.address,
        hours: DEFAULTS.hours.map((h) => ({ ...h })),
        bookingUrl: DEFAULTS.bookingUrl,
        mapEmbed: DEFAULTS.mapEmbed,
        mapUrl: DEFAULTS.mapUrl,
        directionsUrl: DEFAULTS.directionsUrl,
        socials: DEFAULTS.socials,
        enquiryRecipients: DEFAULTS.enquiryRecipients.map((address) => ({ address })),
        tracking: DEFAULTS.tracking,
        features: DEFAULTS.features,
      } as never,
    })
  }

  // ---- search engine defaults --------------------------------------------
  const seo = (await payload.findGlobal({ slug: 'seo', depth: 0 })) as { defaultTitle?: string }
  if (overwrite || !seo.defaultTitle) {
    const saved = readIfThere<{ defaultTitle?: string; defaultDescription?: string; noindexSite?: boolean }>(
      'seo.json',
    )
    const home = read<Page>('pages/index.json')
    await payload.updateGlobal({
      slug: 'seo',
      depth: 0,
      data: {
        defaultTitle: saved?.defaultTitle ?? home.meta?.title ?? DEFAULTS.practiceName,
        defaultDescription: saved?.defaultDescription ?? home.meta?.description ?? '',
        noindexSite: Boolean(saved?.noindexSite),
      } as never,
    })
  }

  await payload.updateGlobal({
    slug: 'site-status',
    depth: 0,
    data: { imported: true, lastChangedAt: new Date().toISOString() } as never,
  })

  return { created, updated }
}
