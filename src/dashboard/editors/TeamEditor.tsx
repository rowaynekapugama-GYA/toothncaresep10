'use client'
/**
 * The support team on Our Team: add, rename, regroup, reorder or remove people.
 * The dentists' and Zoe's cards are part of the Our Team page itself and are
 * edited there; this screen links to it.
 */
import React, { useState } from 'react'
import Link from 'next/link'
import { api, mediaSrc } from '../lib/client'
import { MediaPicker, type MediaDoc } from '../ui/MediaPicker'
import { Notice } from '../ui/fields'
import { PublishButton } from '../ui/PublishButton'
import { useToast } from '../ui/Toast'
import { Icon } from '../ui/icons'

export type Member = {
  id: number | string
  name: string
  patientExperience: boolean
  clinicalCare: boolean
  roleLine: string
  photo: MediaDoc | null
  sortOrder: number
  hidden: boolean
}

type Labels = { patientExperience: string; clinicalCare: string; layout: 'groups' | 'combined' }

const payloadOf = (m: Member) => ({
  name: m.name.trim(),
  patientExperience: m.patientExperience,
  clinicalCare: m.clinicalCare,
  roleLine: m.roleLine.trim(),
  photo: m.photo ? m.photo.id : null,
  sortOrder: m.sortOrder,
  hidden: m.hidden,
})

export function TeamEditor({ initial, ourTeamHref, labels }: { initial: Member[]; ourTeamHref: string; labels: Labels }) {
  const toast = useToast()
  const [rows, setRows] = useState<Member[]>(initial)
  const [saved, setSaved] = useState<Record<string, string>>(() => Object.fromEntries(initial.map((m) => [String(m.id), JSON.stringify(payloadOf(m))])))
  const [draft, setDraft] = useState({ name: '', patientExperience: false, clinicalCare: false })
  const [picking, setPicking] = useState<Member | null>(null)
  const [busy, setBusy] = useState(false)

  const dirty = (m: Member) => saved[String(m.id)] !== JSON.stringify(payloadOf(m))
  const set = (id: Member['id'], patch: Partial<Member>) => setRows((x) => x.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  async function save(m: Member) {
    if (!m.name.trim()) { toast('Please give this person a name.', 'bad'); return }
    if (!m.patientExperience && !m.clinicalCare) { toast(`Tick at least one group for ${m.name}, or remove them.`, 'bad'); return }
    try {
      await api(`/api/team/${m.id}?depth=0`, { method: 'PATCH', body: payloadOf(m) })
      setSaved((s) => ({ ...s, [String(m.id)]: JSON.stringify(payloadOf(m)) }))
      toast(`${m.name.trim()} saved. Press Publish website when you are ready.`, 'good')
    } catch (e) { toast((e as Error).message, 'bad') }
  }

  async function add() {
    const name = draft.name.trim()
    if (!name) { toast('Please type a name.', 'bad'); return }
    if (!draft.patientExperience && !draft.clinicalCare) { toast('Tick at least one group.', 'bad'); return }
    setBusy(true)
    try {
      const sortOrder = Math.max(100, ...rows.map((r) => r.sortOrder)) + 1
      const r = await api<{ doc: { id: number | string } }>('/api/team?depth=0', {
        method: 'POST',
        body: { name, patientExperience: draft.patientExperience, clinicalCare: draft.clinicalCare, roleLine: '', sortOrder, hidden: false },
      })
      const m: Member = { id: r.doc.id, name, patientExperience: draft.patientExperience, clinicalCare: draft.clinicalCare, roleLine: '', photo: null, sortOrder, hidden: false }
      setRows((x) => [...x, m])
      setSaved((s) => ({ ...s, [String(m.id)]: JSON.stringify(payloadOf(m)) }))
      setDraft({ name: '', patientExperience: false, clinicalCare: false })
      toast(`${name} added. Press Publish website when you are ready.`, 'good')
    } catch (e) { toast((e as Error).message, 'bad') } finally { setBusy(false) }
  }

  async function remove(m: Member) {
    if (!window.confirm(`Remove ${m.name} from the website?`)) return
    try {
      await api(`/api/team/${m.id}`, { method: 'DELETE' })
      setRows((x) => x.filter((y) => y.id !== m.id))
      toast(`${m.name} removed. Press Publish website when you are ready.`, 'good')
    } catch (e) { toast((e as Error).message, 'bad') }
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    const a = rows[i]
    const b = rows[j]
    // swap places; if two people share an order number, give them distinct ones
    const ao = b.sortOrder === a.sortOrder ? a.sortOrder + dir : b.sortOrder
    const bo = a.sortOrder
    setBusy(true)
    try {
      await api(`/api/team/${a.id}?depth=0`, { method: 'PATCH', body: { sortOrder: ao } })
      await api(`/api/team/${b.id}?depth=0`, { method: 'PATCH', body: { sortOrder: bo } })
      const next = rows.slice()
      next[i] = { ...b, sortOrder: bo }
      next[j] = { ...a, sortOrder: ao }
      setRows(next)
      setSaved((s) => ({
        ...s,
        [String(a.id)]: JSON.stringify(payloadOf({ ...a, sortOrder: ao })),
        [String(b.id)]: JSON.stringify(payloadOf({ ...b, sortOrder: bo })),
      }))
    } catch (e) { toast((e as Error).message, 'bad') } finally { setBusy(false) }
  }

  return (
    <>
      <Notice>
        Dr Nish, Dr Nav, Dr Rav and Zoe are on the Our Team page itself: <Link href={ourTeamHref}>edit the Our Team page</Link> to change their words or photos.
        This list is the support team shown underneath them, in this order.
      </Notice>
      <Notice tone="warn">
        Use first names exactly as each person likes them spelt, and only add a photo once that person has said in writing they are happy for it to be on the website.
      </Notice>

      <div className="panel">
        <h2>Add a person</h2>
        <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field"><label htmlFor="t-name">First name</label><input id="t-name" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="field" style={{ flex: '0 0 auto' }}><label className="check"><input type="checkbox" checked={draft.patientExperience} onChange={(e) => setDraft({ ...draft, patientExperience: e.target.checked })} /><span>{labels.patientExperience}</span></label></div>
          <div className="field" style={{ flex: '0 0 auto' }}><label className="check"><input type="checkbox" checked={draft.clinicalCare} onChange={(e) => setDraft({ ...draft, clinicalCare: e.target.checked })} /><span>{labels.clinicalCare}</span></label></div>
          <div className="field" style={{ flex: '0 0 auto' }}><button className="btn primary" disabled={busy} onClick={add}>{Icon.plus()} Add</button></div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th><th>Name</th><th>{labels.patientExperience}</th><th>{labels.clinicalCare}</th>
              {labels.layout === 'combined' ? <th>Role line (optional)</th> : null}
              <th>Photo</th><th />
            </tr>
          </thead>
          <tbody>
            {!rows.length ? <tr><td colSpan={7} className="empty">No one listed yet.</td></tr> : null}
            {rows.map((m, i) => (
              <tr key={String(m.id)}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn small" aria-label={`Move ${m.name} up`} disabled={busy || i === 0} onClick={() => move(i, -1)}>{Icon.arrowUp()}</button>{' '}
                  <button className="btn small" aria-label={`Move ${m.name} down`} disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)}>{Icon.arrowDown()}</button>
                </td>
                <td><input className="input" aria-label="Name" value={m.name} onChange={(e) => set(m.id, { name: e.target.value })} /></td>
                <td><input type="checkbox" aria-label={`${m.name}: ${labels.patientExperience}`} checked={m.patientExperience} onChange={(e) => set(m.id, { patientExperience: e.target.checked })} /></td>
                <td><input type="checkbox" aria-label={`${m.name}: ${labels.clinicalCare}`} checked={m.clinicalCare} onChange={(e) => set(m.id, { clinicalCare: e.target.checked })} /></td>
                {labels.layout === 'combined'
                  ? <td><input className="input" aria-label="Role line" placeholder="from the groups ticked" value={m.roleLine} onChange={(e) => set(m.id, { roleLine: e.target.value })} /></td>
                  : null}
                <td style={{ whiteSpace: 'nowrap' }}>
                  {m.photo
                    ? <><img src={mediaSrc(m.photo, 'thumb')} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6, verticalAlign: 'middle' }} />{' '}
                      <button className="btn small" onClick={() => set(m.id, { photo: null })}>Remove photo</button></>
                    : <button className="btn small" onClick={() => setPicking(m)}>{Icon.upload()} Choose photo</button>}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn small primary" disabled={!dirty(m)} onClick={() => save(m)}>Save</button>{' '}
                  <button className="btn small danger" onClick={() => remove(m)}>{Icon.trash()} Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="help" style={{ marginTop: 10 }}>Someone in both groups appears under both headings. Changes show on the website after Publish website.</p>
      <p style={{ marginTop: 14 }}><PublishButton /></p>
      {picking ? (
        <MediaPicker
          title={`Photo for ${picking.name}`}
          onClose={() => setPicking(null)}
          onPick={(doc) => { set(picking.id, { photo: doc }); setPicking(null) }}
        />
      ) : null}
    </>
  )
}
