/**
 * The support team section on Our Team, built from the dashboard's Team list
 * (content/team.json on the website, the database in the dashboard preview).
 * The page holds the placeholder {{site:supportTeam}}; this fills it in.
 *
 * Who appears: anyone ticked as a Patient Experience Coordinator or a Clinical
 * Care Coordinator, in the Team list's order. Headings, role lines and the
 * layout come from SUPPORT_TEAM in src/team.config.ts. Until someone has a
 * photo, their card shows the first letter of their name.
 */
import { SUPPORT_TEAM } from '@/team.config'

export type SupportMember = {
  name: string
  patientExperience?: boolean | null
  clinicalCare?: boolean | null
  /** optional wording for the role line in the combined layout */
  roleLine?: string | null
  /** photo address, if one has been chosen */
  photo?: string | null
  hidden?: boolean | null
}

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const isSupport = (m: SupportMember) => !m.hidden && !!String(m.name ?? '').trim() && (!!m.patientExperience || !!m.clinicalCare)

function roleOf(m: SupportMember): string {
  if (m.roleLine && m.roleLine.trim()) return m.roleLine.trim()
  if (m.patientExperience && m.clinicalCare) return SUPPORT_TEAM.both
  return m.patientExperience ? SUPPORT_TEAM.patientExperience.role : SUPPORT_TEAM.clinicalCare.role
}

function card(m: SupportMember, withRole: boolean): string {
  const name = String(m.name).trim()
  const initial = name.charAt(0).toUpperCase()
  const photo = m.photo
    ? `<img src="${esc(m.photo)}" alt="${esc(name)}, ${esc(roleOf(m).toLowerCase())} at Tooth n Care" loading="lazy" width="800" height="600">`
    : `<span class="st-mono" aria-hidden="true">${esc(initial)}</span>`
  return `<div class="tcard st-card"><div class="st-photo">${photo}</div><div class="st-body">`
    + (withRole ? `<span class="tcard-role">${esc(roleOf(m))}</span>` : '')
    + `<h4 class="st-name">${esc(name)}</h4></div></div>`
}

const grid = (people: SupportMember[], withRole: boolean) =>
  `<div class="st-grid">${people.map((m) => card(m, withRole)).join('')}</div>`

/** The HTML for the section, or nothing if no one is listed. */
export function supportTeamHtml(members: SupportMember[], layout = SUPPORT_TEAM.layout): string {
  const people = members.filter(isSupport)
  if (!people.length) return ''
  if (layout === 'combined') return `<div class="st-groups st-combined rv">${grid(people, true)}</div>`
  const groups = [
    { heading: SUPPORT_TEAM.patientExperience.heading, people: people.filter((m) => m.patientExperience) },
    { heading: SUPPORT_TEAM.clinicalCare.heading, people: people.filter((m) => m.clinicalCare) },
  ].filter((g) => g.people.length)
  return `<div class="st-groups">${groups
    .map((g) => `<div class="st-group rv"><h3 class="st-heading">${esc(g.heading)}</h3>${grid(g.people, false)}</div>`)
    .join('')}</div>`
}

export function supportTeamTokens(members: SupportMember[]): Record<string, string> {
  return { supportTeam: supportTeamHtml(members) }
}
