import Link from 'next/link'
import { payloadClient, requireUser, siteStatus } from '@/dashboard/lib/server'
import { PublishButton } from '@/dashboard/ui/PublishButton'
import { Icon } from '@/dashboard/ui/icons'
import { when } from '@/dashboard/lib/format'
import { ImportButtons } from '@/dashboard/editors/ImportButtons'
import { BRAND } from '@/dashboard/brand'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard' }

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-AU', { timeZone: BRAND.timeZone, hour: 'numeric', hour12: false }).format(new Date()))
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default async function Home() {
  const u = await requireUser()
  const payload = await payloadClient()
  const status = await siteStatus(payload)
  const home = await payload.find({ collection: 'pages', where: { pageSlug: { equals: 'index' } }, limit: 1, depth: 0, overrideAccess: true, select: { pageSlug: true } })
  const enquiries = await payload.find({ collection: 'enquiries', limit: 5, sort: '-createdAt', depth: 0, overrideAccess: true })
  const pages = await payload.find({ collection: 'pages', where: { isChrome: { not_equals: true } }, limit: 5, sort: '-updatedAt', depth: 0, overrideAccess: true, select: { title: true, updatedAt: true } })
  const posts = await payload.find({ collection: 'posts', limit: 5, sort: '-updatedAt', depth: 0, overrideAccess: true, select: { title: true, updatedAt: true, _status: true } })
  const counts = {
    pages: (await payload.count({ collection: 'pages', where: { isChrome: { not_equals: true } }, overrideAccess: true })).totalDocs,
    posts: (await payload.count({ collection: 'posts', where: { _status: { equals: 'published' } }, overrideAccess: true })).totalDocs,
    drafts: (await payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } }, overrideAccess: true })).totalDocs,
    open: (await payload.count({ collection: 'enquiries', where: { followedUp: { not_equals: true } }, overrideAccess: true })).totalDocs,
  }
  const empty = counts.pages === 0
  const homeId = home.docs[0]?.id
  const recent = [
    ...pages.docs.map((p) => ({ href: `/admin/pages/${p.id}`, label: String(p.title), at: String(p.updatedAt), kind: 'Page' })),
    ...posts.docs.map((p) => ({ href: `/admin/posts/${p.id}`, label: String(p.title), at: String(p.updatedAt), kind: p._status === 'published' ? 'Post' : 'Draft post' })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 6)

  return (
    <>
      <div className="panel welcome">
        <h1>{greeting()}, {u.name || u.email.split('@')[0]}</h1>
        <p style={{ marginTop: 6 }}>This is where you keep the {BRAND.name} website up to date. Change wording and photos, write blog posts and update practice details, then press Publish website.</p>
        <div className="actions" style={{ marginTop: 12 }}>
          <PublishButton />
          <a className="btn" href="/" target="_blank" rel="noopener">{Icon.external()} View the website</a>
        </div>
      </div>

      {empty ? (
        <div className="notice warn">{Icon.warn()}<div className="grow">
          <p><b>The dashboard has no content yet.</b> {u.role === 'admin' ? 'Load the website into it with Import below.' : 'Please ask GYA to finish setting it up.'}</p>
        </div></div>
      ) : status.waiting ? (
        <div className="notice warn">{Icon.warn()}<div className="grow">
          <p><b>You have changes waiting to publish.</b> They are saved in the dashboard but are not on the website yet.</p>
          <p className="help" style={{ margin: 0 }}>Last change {status.lastChangedAt ? new Date(status.lastChangedAt).toLocaleString('en-AU', { timeZone: BRAND.timeZone }) : ''}.</p>
        </div><PublishButton /></div>
      ) : (
        <div className="notice good">{Icon.check()}<div className="grow">
          <p><b>The website is up to date.</b> {status.lastPublishedAt ? `Last published ${new Date(status.lastPublishedAt).toLocaleString('en-AU', { timeZone: BRAND.timeZone })}${status.lastPublishedBy ? ` by ${status.lastPublishedBy}` : ''}.` : ''}</p>
        </div></div>
      )}
      {!status.hookConfigured ? (
        <div className="notice info">{Icon.info()}<div className="grow"><p>Publishing is not switched on yet: the publish hook has not been added. GYA will set this up.</p></div></div>
      ) : null}

      <div className="stat-row" style={{ marginBottom: 18 }}>
        <div className="stat"><b>{counts.pages}</b><span>Pages</span></div>
        <div className="stat"><b>{counts.posts}</b><span>Published posts</span></div>
        <div className="stat"><b>{counts.drafts}</b><span>Draft posts</span></div>
        <div className="stat"><b>{counts.open}</b><span>Enquiries to follow up</span></div>
      </div>

      <div className="panel">
        <h2>Quick actions</h2>
        <div className="quick">
          <Link href={homeId ? `/admin/pages/${homeId}` : '/admin/pages'}>{Icon.pages()}<span>Edit the homepage<small>Wording, photos and sections</small></span></Link>
          <Link href="/admin/posts/new">{Icon.posts()}<span>Write a blog post<small>Appears on the Blog</small></span></Link>
          <Link href="/admin/media">{Icon.media()}<span>Upload photos<small>Add to the Media Library</small></span></Link>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><h2>Latest enquiries</h2><Link className="btn small" href="/admin/enquiries">See all</Link></div>
          {!enquiries.docs.length ? <p className="empty">No enquiries yet. Form submissions from the website appear here.</p> : (
            <ul className="list-plain">
              {enquiries.docs.map((e) => (
                <li key={e.id}><span className="grow"><b>{String(e.name)}</b> <span className="help">{String(e.sourcePage || '')}</span><br />
                  <span className="help">{when(String(e.createdAt))} &middot; {String(e.phone || e.email || '')}</span></span>
                  {e.followedUp ? <span className="chip good">Followed up</span> : <span className="chip warn">To do</span>}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel">
          <h2>Recently edited</h2>
          {!recent.length ? <p className="empty">Nothing yet.</p> : (
            <ul className="list-plain">
              {recent.map((r) => (
                <li key={r.href}><span className="grow"><Link href={r.href}>{r.label}</Link><br /><span className="help">{r.kind} &middot; {new Date(r.at).toLocaleString('en-AU', { timeZone: BRAND.timeZone })}</span></span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {u.role === 'admin' ? <ImportPanel empty={empty} /> : null}
    </>
  )
}

function ImportPanel({ empty }: { empty: boolean }) {
  return (
    <div className="panel">
      <h2>Import (GYA only)</h2>
      <p className="help">Loads the website from the repository into the dashboard: the pages, header and footer, team, redirects, practice details and SEO defaults, then the 42 photographs into the Media Library. Safe to run again: anything already in the dashboard is kept. Reset puts every page back to how the repository has it.</p>
      <ImportButtons empty={empty} />
    </div>
  )
}
