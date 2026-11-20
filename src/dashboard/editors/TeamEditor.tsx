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
import { TeamPhotoHelp } from '../ui/TeamPhotoHelp'

export type Member = {
  id: number | string
  name: string
  patientExperience: boolean
  clinicalCare: boolean
  roleLine: string
  photo: MediaDoc | null
  /** a photo GYA loaded from an email (public/images), shown if no photo is chosen */
  photoPath: string
  /** permission confirmed: only then does the photo show on the website (v2.9.1) */
  photoApproved: boolean
  sortOrder: number
  hidden: boolean
}

type Labels = {
  patientExperience: string
  clinicalCare: string
  layout: 'groups' | 'combined'
  /** the role lines worked out from the groups ticked (combined layout) */
  roles: { patientExperience: string; clinicalCare: string; both: string }
}

const derivedRole = (m: Pick<Member, 'patientExperience' | 'clinicalCare'>, r: Labels['roles']) =>
  m.patientExperience && m.clinicalCare ? r.both : m.patientExperience ? r.patientExperience : m.clinicalCare ? r.clinicalCare : 'Tick a group'

const payloadOf = (m: Member) => ({
  name: m.name.trim(),
  patientExperience: m.patientExperience,
  clinicalCare: m.clinicalCare,
  roleLine: m.roleLine.trim(),
  photo: m.photo ? m.photo.id : null,
  photoPath: m.photoPath,
  photoApproved: m.photoApproved,
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
      const m: Member = { id: r.doc.id, name, patientExperience: draft.patientExperience, clinicalCare: draft.clinicalCare, roleLine: '', photo: null, photoPath: '', photoApproved: false, sortOrder, hidden: false }
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
        The dentists and Zoe are on the Our Team page itself: <Link href={ourTeamHref}>edit the Our Team page</Link> to change their words or photos.
        This list is the support team shown underneath them, in this order.
        {labels.layout === 'combined' ? ' Each person is shown once, with their role line under their name.' : null}
      </Notice>
      <Notice tone="warn">
        Use first names exactly as each person likes them spelt. A photo only shows on the website once <b>Show photo on website (permission confirmed)</b> is ticked:
        only switch this on once the staff member has agreed to their photo appearing on the website.
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
              <th>Photo</th><th>Show photo on website (permission confirmed)</th><th>On website</th><th />
            </tr>
          </thead>
          <tbody>
            {!rows.length ? <tr><td colSpan={9} className="empty">No one listed yet.</td></tr> : null}
            {rows.map((m, i) => (
              <tr key={String(m.id)}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn small" aria-label={`Move ${m.name} up`} disabled={busy || i === 0} onClick={() => move(i, -1)}>{Icon.arrowUp()}</button>{' '}
                  <button className="btn small" aria-label={`Move ${m.name} down`} disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)}>{Icon.arrowDown()}</button>
                </td>
                <td><input className="input" aria-label="Name" style={{ minWidth: 110 }} value={m.name} onChange={(e) => set(m.id, { name: e.target.value })} /></td>
                <td><input type="checkbox" aria-label={`${m.name}: ${labels.patientExperience}`} checked={m.patientExperience} onChange={(e) => set(m.id, { patientExperience: e.target.checked })} /></td>
                <td><input type="checkbox" aria-label={`${m.name}: ${labels.clinicalCare}`} checked={m.clinicalCare} onChange={(e) => set(m.id, { clinicalCare: e.target.checked })} /></td>
                {labels.layout === 'combined'
                  ? <td><input className="input" aria-label={`${m.name}: role line`} placeholder={derivedRole(m, labels.roles)} title="Leave empty to use the wording shown, from the groups ticked" value={m.roleLine} onChange={(e) => set(m.id, { roleLine: e.target.value })} /></td>
                  : null}
                <td style={{ whiteSpace: 'nowrap' }}>
                  {m.photo || m.photoPath
                    ? <><img src={m.photo ? mediaSrc(m.photo, 'thumb') : m.photoPath} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6, verticalAlign: 'middle' }} />{' '}
                      <button className="btn small" onClick={() => setPicking(m)}>Replace</button>{' '}
                      <button className="btn small" onClick={() => set(m.id, { photo: null, photoPath: '', photoApproved: false })}>Remove photo</button></>
                    : <button className="btn small" onClick={() => setPicking(m)}>{Icon.upload()} Choose photo</button>}
                </td>
                <td>
                  <label className="check" title="Only switch this on once the staff member has agreed to their photo appearing on the website.">
                    <input type="checkbox" aria-label={`Show ${m.name}'s photo on website (permission confirmed)`} disabled={!m.photo && !m.photoPath} checked={m.photoApproved && (!!m.photo || !!m.photoPath)} onChange={(e) => set(m.id, { photoApproved: e.target.checked })} />
                    <span>{!m.photo && !m.photoPath ? 'No photo yet' : m.photoApproved ? 'Shown' : 'Not shown'}</span>
                  </label>
                </td>
                <td><label className="check"><input type="checkbox" aria-label={`Show ${m.name} on the website`} checked={!m.hidden} onChange={(e) => set(m.id, { hidden: !e.target.checked })} /><span>{m.hidden ? 'Hidden' : 'Shown'}</span></label></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn small primary" disabled={!dirty(m)} onClick={() => save(m)}>Save</button>{' '}
                  <button className="btn small danger" onClick={() => remove(m)}>{Icon.trash()} Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="help" style={{ marginTop: 10 }}>
        {labels.layout === 'combined'
          ? 'The role line in grey is what the website shows; type over it only to change the wording for that person. '
          : 'Someone in both groups appears under both headings. '}
        Untick On website to take someone off the website for now without removing them (then Save).
        A photo shows only once its permission box is ticked: only switch this on once the staff member has agreed to their photo appearing on the website.
        Changes show on the website after Publish website.
      </p>
      <TeamPhotoHelp />
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
