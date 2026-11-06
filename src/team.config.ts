/**
 * Tooth n Care: the ONE place for practitioner role titles and AHPRA details.
 *
 * Everything the website says about these comes from here: the Our Team cards,
 * the homepage team slider, the profile pages, the FAQ and Check-ups answers,
 * photo descriptions, the titles and descriptions Google shows, and the
 * structured data (schema). The page content holds placeholders such as
 * {{site:zoeRole}} that fill in from this file when the site is built, in the
 * same way the phone number fills in from Site Settings.
 *
 * To change something: edit the value below, commit, push. Vercel rebuilds and
 * every page updates. Nothing else needs touching.
 *
 * What is NOT here, on purpose: names as shown on cards, photos and bios. The
 * practice edits those itself in the dashboard (Pages, then Our Team or the
 * person's profile page), as with every GYA site.
 *
 * Rules (AHPRA, and the GYA project rules):
 *   - Titles and registration numbers come from the practice, in writing.
 *     Never guess one.
 *   - An empty ahpraNumber shows NOTHING on the website. No placeholder.
 *   - Use a protected title only if the person holds that registration.
 *
 * Dental Board of Australia registered divisions, for reference
 * (https://www.dentalboard.gov.au):
 *   Dentist
 *   Dental Hygienist
 *   Dental Therapist
 *   Oral Health Therapist
 *   Dental Prosthetist
 * AHPRA registration numbers are three letters and ten digits. For the dental
 * divisions they start with DEN, for example DEN0001234567.
 */

export const DIVISIONS = [
  'Dentist',
  'Dental Hygienist',
  'Dental Therapist',
  'Oral Health Therapist',
  'Dental Prosthetist',
] as const

export type Division = (typeof DIVISIONS)[number]

export type Practitioner = {
  /** Full name, for reference and for the structured data. */
  name: string
  /**
   * The role title, written in Title Case as it appears on a card
   * ("Oral Health Therapist"). The lower case and sentence case versions used
   * in the middle or at the start of a sentence are worked out from it.
   * null: this person's title is not managed here (the dentists' titles are
   * part of the page wording).
   */
  roleTitle: string | null
  /** AHPRA registration number, e.g. DEN0001234567. Empty shows nothing. */
  ahpraNumber: string
  /** Optional. One of the divisions above. Only used in the structured data. */
  ahpraDivision: Division | ''
  /** The profile page, if there is one. For reference. */
  profilePath: string | null
}

// ---------------------------------------------------------------------------
// The oral health team (the two staff Christine wrote about on 5 Nov 2026)
// ---------------------------------------------------------------------------

export const ORAL_HEALTH_TEAM = {
  /**
   * The shared heading for the oral health team. Used where the site names the
   * group rather than a person: the Our Team page description in Google
   * ("Meet the dentists, oral health therapist and support team ...").
   * TODO: awaiting from client. Nish is confirming the heading both staff fall
   * under, or whether each has their own named role.
   */
  heading: 'Oral Health Therapist',
  /**
   * How the Our Team intro names the two of them, mid-sentence:
   * "Three dentists, an oral health therapist, a hygienist and a support team ..."
   * Leave empty to have it worked out from the two role titles below
   * (two different titles: "an oral health therapist, a hygienist";
   * the same title twice: "two oral health therapists").
   * Fill it in only if that does not read right.
   */
  inTeamSentence: '',
}

// ---------------------------------------------------------------------------
// Everyone registered with AHPRA who appears on the site (and the one to come)
// ---------------------------------------------------------------------------

export const PRACTITIONERS = {
  nish: {
    name: 'Dr Nisheeth Agrawal',
    roleTitle: null,
    ahpraNumber: '', // TODO: awaiting from client
    ahpraDivision: '', // TODO: awaiting from client (expected: Dentist)
    profilePath: '/dr-nisheeth-agrawal',
  },
  nav: {
    name: 'Dr Navneet Karan',
    roleTitle: null,
    ahpraNumber: '', // TODO: awaiting from client
    ahpraDivision: '', // TODO: awaiting from client (expected: Dentist)
    profilePath: '/dr-navneet-karan',
  },
  zoe: {
    name: 'Zoe Xu',
    roleTitle: 'Oral Health Therapist', // TODO: awaiting from client (Nish to confirm)
    ahpraNumber: '', // TODO: awaiting from client
    ahpraDivision: '', // TODO: awaiting from client
    profilePath: '/zoe-xu',
  },
  /**
   * The second member of the oral health team. Not on the website yet: the
   * name, card and photo come when Nish and Christine send them. Until then
   * the title is only used by the Our Team intro sentence.
   */
  oralHealth2: {
    name: '', // TODO: awaiting from client (full name, correct spelling, from Nish)
    roleTitle: 'Hygienist', // TODO: awaiting from client (Nish to confirm)
    ahpraNumber: '', // TODO: awaiting from client
    ahpraDivision: '', // TODO: awaiting from client
    profilePath: null,
  },
} satisfies Record<string, Practitioner>

// ===========================================================================
// Nothing below here needs editing.
// ===========================================================================

export type PractitionerKey = keyof typeof PRACTITIONERS
const KEYS = Object.keys(PRACTITIONERS) as PractitionerKey[]

const AHPRA_FORMAT = /^[A-Z]{3}\d{10}$/

function fail(message: string): never {
  throw new Error(`src/team.config.ts: ${message}`)
}

/** Text that ends up inside HTML attributes and JSON must not contain these. */
function checkText(where: string, s: string): string {
  if (/["<>\\{}]/.test(s)) fail(`${where} "${s}" may not contain " < > \\ { or }`)
  return s.trim().replace(/\s+/g, ' ')
}

export function normaliseAhpra(key: string, raw: string): string {
  const n = String(raw ?? '').replace(/\s+/g, '').toUpperCase()
  if (n && !AHPRA_FORMAT.test(n)) {
    fail(`${key}.ahpraNumber "${raw}" is not an AHPRA registration number (three letters and ten digits, e.g. DEN0001234567)`)
  }
  return n
}

const lower = (t: string) => t.toLowerCase()
const sentence = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t)
/** "an oral health therapist", "a hygienist", "a dental therapist" */
const withArticle = (t: string) => (t ? `${/^[aeiou]/i.test(t) ? 'an' : 'a'} ${lower(t)}` : t)
const plural = (t: string) => (/s$/i.test(t) ? t : `${t}s`)

/** The smallest piece of markup that shows a registration number. */
export function ahpraHtml(num: string): string {
  return num ? `<span class="ahpra-reg">AHPRA Reg. No. ${num}</span>` : ''
}

/** The {{site:...}} keys this file provides, for the dashboard's friendly names. */
export const TEAM_TOKEN_KEYS: string[] = [
  'oralHealthHeading',
  'oralHealthHeadingLower',
  'oralHealthTeamInSentence',
  ...KEYS.flatMap((k) => [`${k}Role`, `${k}RoleLower`, `${k}RoleSentence`, `${k}RoleA`, `${k}Ahpra`, `${k}AhpraNumber`, `${k}AhpraDivision`]),
]

/** The values of the {{site:...}} placeholders. Throws (and stops the build) on a malformed entry. */
export function teamTokens(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of KEYS) {
    const p = PRACTITIONERS[k] as Practitioner
    const title = p.roleTitle ? checkText(`${k}.roleTitle`, p.roleTitle) : ''
    const num = normaliseAhpra(k, p.ahpraNumber)
    if (p.ahpraDivision && !DIVISIONS.includes(p.ahpraDivision)) {
      fail(`${k}.ahpraDivision "${p.ahpraDivision}" must be one of: ${DIVISIONS.join(', ')}`)
    }
    out[`${k}Role`] = title
    out[`${k}RoleLower`] = lower(title)
    out[`${k}RoleSentence`] = sentence(title)
    out[`${k}RoleA`] = withArticle(title)
    out[`${k}Ahpra`] = ahpraHtml(num)
    out[`${k}AhpraNumber`] = num
    out[`${k}AhpraDivision`] = p.ahpraDivision
  }

  const heading = checkText('ORAL_HEALTH_TEAM.heading', ORAL_HEALTH_TEAM.heading)
  out.oralHealthHeading = heading
  out.oralHealthHeadingLower = lower(heading)

  const a = PRACTITIONERS.zoe.roleTitle ?? ''
  const b = PRACTITIONERS.oralHealth2.roleTitle ?? ''
  const given = checkText('ORAL_HEALTH_TEAM.inTeamSentence', ORAL_HEALTH_TEAM.inTeamSentence)
  out.oralHealthTeamInSentence = given
    || (lower(a) === lower(b) ? `two ${plural(lower(a))}` : [withArticle(a), withArticle(b)].filter(Boolean).join(', '))
  return out
}
