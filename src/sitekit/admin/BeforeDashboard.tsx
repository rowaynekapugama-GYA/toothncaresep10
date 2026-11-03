'use client'

import { useCallback, useEffect, useState } from 'react'

type Status = {
  lastChangedAt?: string | null
  lastPublishedAt?: string | null
  imported?: boolean
}

type Enquiry = {
  id: string | number
  name?: string
  email?: string
  phone?: string
  sourcePage?: string
  createdAt?: string
}

function when(value?: string | null) {
  if (!value) return 'never'
  const d = new Date(value)
  return d.toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })
}

export function BeforeDashboard() {
  const [status, setStatus] = useState<Status | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([
        fetch('/api/globals/site-status?depth=0', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/enquiries?limit=5&sort=-createdAt&depth=0', { credentials: 'include' }).then((r) => r.json()),
      ])
      setStatus(s as Status)
      setEnquiries(((e as { docs?: Enquiry[] }).docs ?? []).slice(0, 5))
    } catch {
      setStatus({})
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const call = async (label: string, url: string, body?: unknown) => {
    setBusy(label)
    setNote(null)
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      })
      const data = (await res.json()) as { message?: string; error?: string }
      setNote(
        res.ok
          ? { tone: 'ok', text: data.message ?? 'Done.' }
          : { tone: 'bad', text: data.error ?? 'That did not work. Please try again.' },
      )
      await load()
    } catch {
      setNote({ tone: 'bad', text: 'That did not work. Please try again.' })
    } finally {
      setBusy(null)
    }
  }

  const changed = status?.lastChangedAt ? new Date(status.lastChangedAt).getTime() : 0
  const published = status?.lastPublishedAt ? new Date(status.lastPublishedAt).getTime() : 0
  const waiting = changed > published

  return (
    <section className="tnc-dash">
      <div className="tnc-dash__welcome">
        <h2>Welcome to your website dashboard</h2>
        <p>
          Change wording and pictures here, then press <strong>Publish website</strong>. Your changes
          go live a couple of minutes later.
        </p>
      </div>

      <div className={`tnc-dash__publish${waiting ? ' is-waiting' : ''}`}>
        <div>
          <strong>{waiting ? 'You have changes waiting to publish' : 'Everything is published'}</strong>
          <span>
            Last change {when(status?.lastChangedAt)}. Last published {when(status?.lastPublishedAt)}.
          </span>
        </div>
        <button
          type="button"
          className="tnc-btn tnc-btn--primary"
          disabled={busy !== null}
          onClick={() => call('publish', '/api/publish-site')}
        >
          {busy === 'publish' ? 'Publishing...' : 'Publish website'}
        </button>
      </div>

      {note ? <p className={`tnc-dash__note tnc-dash__note--${note.tone}`}>{note.text}</p> : null}

      <div className="tnc-dash__cards">
        <a className="tnc-card" href="/admin/collections/pages">
          <b>Edit a page</b>
          <span>Change wording, pictures and buttons.</span>
        </a>
        <a className="tnc-card" href="/admin/collections/posts/create">
          <b>Write a blog post</b>
          <span>Share news from the practice.</span>
        </a>
        <a className="tnc-card" href="/admin/collections/media">
          <b>Media Library</b>
          <span>Upload and replace pictures.</span>
        </a>
        <a className="tnc-card" href="/admin/globals/site-settings">
          <b>Site Settings</b>
          <span>Phone, hours, address and booking link.</span>
        </a>
      </div>

      <div className="tnc-dash__enquiries">
        <h3>Latest enquiries</h3>
        {enquiries.length === 0 ? (
          <p className="tnc-muted">No enquiries yet.</p>
        ) : (
          <ul>
            {enquiries.map((e) => (
              <li key={String(e.id)}>
                <a href={`/admin/collections/enquiries/${e.id}`}>
                  <b>{e.name || 'Someone'}</b>
                  <span>{e.email || e.phone || ''}</span>
                  <em>{when(e.createdAt)}</em>
                </a>
              </li>
            ))}
          </ul>
        )}
        <a className="tnc-link" href="/admin/collections/enquiries">
          See all enquiries
        </a>
      </div>

      {!status?.imported ? (
        <div className="tnc-dash__setup">
          <strong>First time setup</strong>
          <p>
            Bring the website wording and pictures into the dashboard. This only needs doing once.
          </p>
          <div className="tnc-dash__setup-actions">
            <button
              type="button"
              className="tnc-btn"
              disabled={busy !== null}
              onClick={() => call('import', '/api/import-content')}
            >
              {busy === 'import' ? 'Importing...' : 'Import website content'}
            </button>
            <button
              type="button"
              className="tnc-btn"
              disabled={busy !== null}
              onClick={() => call('media', '/api/import-media')}
            >
              {busy === 'media' ? 'Importing...' : 'Import pictures into the Media Library'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BeforeDashboard
