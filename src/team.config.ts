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
  /** Optional. A shorter name for the cards ("Dr Rav"); see showFullName. */
  shortName?: string
  /** Optional. true shows the full name above on the cards instead of shortName. */
  showFullName?: boolean
  /**
   * Optional. true puts this person's profile page (and the View profile links
   * to it) on the website. Only for a page that is kept hidden until ready.
   */
  profilePage?: boolean
}

// ---------------------------------------------------------------------------
// The oral health team (Zoe; the hygienist is leaving, Christine 11 Nov 2026)
// ---------------------------------------------------------------------------

export const ORAL_HEALTH_TEAM = {
  /**
   * The heading for the oral health team. Used where the site names the group
   * rather than a person: the Our Team page description in Google
   * ("Meet the dentists, oral health therapist and support team ...").
   * Confirmed by Nish, 11 Nov 2026: "Oral health therapists for Zoe".
   */
  heading: 'Oral Health Therapist',
  /**
   * How the Our Team intro names the oral health team, mid-sentence:
   * "Three dentists, an oral health therapist and a support team ..."
   * Leave empty to have it worked out from the role titles of the people with
   * a roleTitle below (one person: "an oral health therapist"; two with the
   * same title: "two oral health therapists"; different titles: "an oral
   * health therapist, a dental hygienist"). Fill it in only if that does not
   * read right.
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
  /**
   * The third dentist (Christine, 11 Nov 2026). Registration from the AHPRA
   * public register (Christine, 16 Nov 2026): Dental Practitioner, Dentist,
   * General registration.
   *
   * The cards and the homepage slider say "Dr Rav". To show the full name
   * instead, change showFullName to true (the photo descriptions follow).
   *
   * Ready for her photo and bio (v2.9.1, Nish asked for her before launch,
   * 20 Nov 2026). Nothing shows until it is filled in, and nothing is invented:
   *   - photo: the practice (or GYA) clicks her photo on the Our Team page and
   *     on the homepage team slider in the dashboard, as for the others
   *   - short bio: the empty "Add words" line under her name on the Our Team
   *     card and on her homepage slide (dashboard)
   *   - profile page: content/pages/dr-rav.json, at /dr-rav (kept short, so
   *     the address never changes whichever name is shown). It is NOT on the
   *     website (no page, no link, not in the sitemap) until profilePage is
   *     true, and the build stops if it is switched on before the page has its
   *     bio (the first paragraph under "Dentist at Tooth n Care"). Her
   *     qualifications go in the list under it, one per line, as she supplies
   *     them. When it goes on, also set the "image" in its structured data to
   *     her photo.
   */
  rav: {
    name: 'Dr Ravneet Kaur Arora',
    shortName: 'Dr Rav',
    showFullName: false,
    roleTitle: null,
    ahpraNumber: 'DEN0002297808', // AHPRA public register, sent by Christine 16 Nov 2026
    ahpraDivision: 'Dentist',
    profilePath: '/dr-rav',
    profilePage: false,
  },
  /**
   * Dr Dimple (Christine, 13 and 19 Nov 2026). Shown on the website since
   * v2.8.1 as a dentist: see DR_DIMPLE below.
   */
  dimple: {
    name: 'Dr Dimple Sharma', // Nish's clinician bios, forwarded by Christine 21 Nov 2026
    shortName: 'Dr Dimple',
    showFullName: false,
    roleTitle: null,
    ahpraNumber: '', // TODO: awaiting from client (the AHPRA number, starting DEN)
    ahpraDivision: '', // TODO: awaiting from client
    profilePath: null,
  },
  zoe: {
    name: 'Zoe Xu',
    roleTitle: 'Oral Health Therapist', // confirmed by Nish, 11 Nov 2026 (must match her AHPRA division)
    ahpraNumber: '', // TODO: awaiting from client (the AHPRA number, starting DEN, not the Medicare provider number)
    ahpraDivision: '', // TODO: awaiting from client
    profilePath: '/zoe-xu',
  },
} satisfies Record<string, Practitioner>

// ---------------------------------------------------------------------------
// The support team section on Our Team (Nish's headings, 11 Nov 2026)
// ---------------------------------------------------------------------------
// The people themselves (names, which group, order, photo) are kept in the
// dashboard: Team. Only the headings and the layout are set here.

export const SUPPORT_TEAM = {
  /**
   * 'groups': two groups under their own headings; someone in both groups
   *   (Jorja, Ton) appears in both.
   * 'combined': one grid under the section heading, each person once, with
   *   their role line under the photo (Christine, 13 Nov 2026). The role line
   *   comes from the groups ticked on the Team screen, or the Role line typed
   *   there. Order is the Team screen order.
   */
  layout: 'combined' as 'groups' | 'combined',
  patientExperience: { heading: 'Patient Experience Coordinators', role: 'Patient Experience Coordinator' },
  clinicalCare: { heading: 'Clinical Care Coordinators', role: 'Clinical Care Coordinator' },
  /** The role line for someone in both groups, in the 'combined' layout. */
  both: 'Patient Experience and Clinical Care Coordinator',
}

// ---------------------------------------------------------------------------
// Dr Dimple: one switch to show her on the website
// ---------------------------------------------------------------------------

export const DR_DIMPLE = {
  /**
   * false: Dr Dimple is not on the website anywhere.
   * true: her card shows on Our Team (after Dr Rav), a slide is added to the
   *   homepage team slider (after Dr Rav), and the Our Team intro counts her.
   * On since v2.8.1 (Christine, 19 Nov 2026).
   */
  show: true,
  /**
   * true ONLY once the practice has confirmed in writing that Dr Dimple holds
   * specialist registration in Orthodontics on the AHPRA register (and her
   * AHPRA number is filled in above). Then her card says "Specialist
   * Orthodontist" and the intro says "a specialist orthodontist".
   * false: her card says "Dentist" and she is counted with the dentists.
   * "Orthodontist" is a protected specialist title: never set this on a guess.
   */
  specialistOrthodontics: false,
  /** Optional. Her photo, e.g. '/images/img-xxxxxxxxxx.webp' (800 x 600). Empty shows the letter D. */
  photo: '',
  /**
   * Optional. One or two sentences under her name on her card and her slide.
   * Empty shows nothing. From Nish's clinician bios (Christine, 21 Nov 2026),
   * as GYA shortened them for the cards. Her qualifications (Bachelor of Dental
   * Surgery; Master of Dental Surgery in Orthodontics) are not shown until the
   * practice confirms their exact names.
   */
  bio: 'Dr Dimple has a special interest in orthodontics, clear aligners and digital dentistry.',
}

// ===========================================================================
// Nothing below here needs editing.
// ===========================================================================

export type PractitionerKey = keyof typeof PRACTITIONERS

/** Dr Rav's profile page: content/pages/dr-rav.json, at /dr-rav. */
export const RAV_PROFILE = { slug: 'dr-rav', path: '/dr-rav', bioSection: 'dr-rav-03-about', bioField: 'paragraph-1' }

/** Pages that exist in content/ but are kept off the website until switched on above. */
export function hiddenPageSlugs(): string[] {
  return (PRACTITIONERS.rav as Practitioner).profilePage ? [] : [RAV_PROFILE.slug]
}
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
  'teamIntroLead',
  'ravName',
  'ravProfileLink',
  'ravSlideProfile',
  'dimpleCard',
  'dimpleSlide',
  'zoeSlideNum',
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

  // everyone with a role title managed here is on the oral health team
  const titles = KEYS.map((k) => (PRACTITIONERS[k] as Practitioner).roleTitle).filter((x): x is string => !!x)
  const given = checkText('ORAL_HEALTH_TEAM.inTeamSentence', ORAL_HEALTH_TEAM.inTeamSentence)
  const same = titles.length > 1 && titles.every((x) => lower(x) === lower(titles[0]))
  const NUMBER = ['', 'one', 'two', 'three', 'four', 'five']
  out.oralHealthTeamInSentence = given
    || (same ? `${NUMBER[titles.length] ?? titles.length} ${plural(lower(titles[0]))}` : titles.map(withArticle).join(', '))

  // the cards' names: "Dr Rav", or the full name once showFullName is true
  const rav = PRACTITIONERS.rav as Practitioner
  out.ravName = checkText('rav.name', rav.showFullName || !rav.shortName ? rav.name : rav.shortName)
  // the View profile links to her page, only once the page is switched on (v2.9.1)
  if (typeof (rav.profilePage ?? false) !== 'boolean') fail('rav.profilePage must be true or false')
  out.ravProfileLink = rav.profilePage ? `<em><a href="${RAV_PROFILE.path}">View profile <span class="btn-arrow">&rarr;</span></a></em>` : ''
  out.ravSlideProfile = rav.profilePage ? `<a class="btn btn-ghost" href="${RAV_PROFILE.path}">View profile <span class="btn-arrow">&rarr;</span></a>` : ''

  // Dr Dimple, and the Our Team intro that counts the team
  Object.assign(out, dimpleTokens(out))

  for (const [k, v] of Object.entries({
    'SUPPORT_TEAM.patientExperience.heading': SUPPORT_TEAM.patientExperience.heading,
    'SUPPORT_TEAM.patientExperience.role': SUPPORT_TEAM.patientExperience.role,
    'SUPPORT_TEAM.clinicalCare.heading': SUPPORT_TEAM.clinicalCare.heading,
    'SUPPORT_TEAM.clinicalCare.role': SUPPORT_TEAM.clinicalCare.role,
    'SUPPORT_TEAM.both': SUPPORT_TEAM.both,
  })) checkText(k, v)
  if (!['groups', 'combined'].includes(SUPPORT_TEAM.layout)) fail(`SUPPORT_TEAM.layout must be 'groups' or 'combined'`)
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** The transparent image the placeholder cards sit on (the letter shows through). */
const PLACEHOLDER = '/images/img-52e7b1f5ba.webp'

function dimpleTokens(t: Record<string, string>): Record<string, string> {
  if (typeof DR_DIMPLE.show !== 'boolean' || typeof DR_DIMPLE.specialistOrthodontics !== 'boolean') {
    fail('DR_DIMPLE.show and DR_DIMPLE.specialistOrthodontics must be true or false')
  }
  const photo = checkText('DR_DIMPLE.photo', DR_DIMPLE.photo)
  if (photo && !/^\/[\w./-]+\.(webp|jpe?g|png)$/i.test(photo)) fail(`DR_DIMPLE.photo "${photo}" must be an image address such as /images/img-xxxxxxxxxx.webp`)
  const show = DR_DIMPLE.show
  const specialist = show && DR_DIMPLE.specialistOrthodontics
  const NUMBER = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six']
  // Nish, Nav and Rav, and Dr Dimple when she shows as a dentist
  const dentists = 3 + (show && !specialist ? 1 : 0)
  const lead = [
    `${NUMBER[dentists]} dentists`,
    specialist ? 'a specialist orthodontist' : '',
    t.oralHealthTeamInSentence,
  ].filter(Boolean)
  const out: Record<string, string> = {
    teamIntroLead: lead.join(', '),
    dimpleCard: '',
    dimpleSlide: '',
    zoeSlideNum: show ? '05/' : '04/',
  }
  if (!show) return out
  const d: Practitioner = PRACTITIONERS.dimple
  const name = esc(checkText('dimple.name', d.showFullName || !d.shortName ? d.name : d.shortName))
  const bio = DR_DIMPLE.bio ? esc(checkText('DR_DIMPLE.bio', DR_DIMPLE.bio)) : ''
  const role = specialist ? 'Specialist Orthodontist' : 'Dentist'
  const alt = `${name}, ${role.toLowerCase()} at Tooth n Care`
  const ahpra = t.dimpleAhpra ?? ''
  const img = `<img src="${esc(photo || PLACEHOLDER)}" alt="${alt}" width="800" height="600" loading="lazy">`
  out.dimpleCard = '<div class="tcard rv"><div class="tcard-photo tcard-ph">'
    + (photo ? '' : '<span class="tcard-fallback" aria-hidden="true">D</span>')
    + `${img}</div><div class="tcard-body"><span class="tcard-role">${role}</span><h3>${name}</h3>${ahpra}${bio ? `<p>${bio}</p>` : ''}</div></div>`
  out.dimpleSlide = `<div class="tm-slide"><div class="tm-photo"><img src="${esc(photo || PLACEHOLDER)}" alt="${alt}" loading="lazy">`
    + (photo ? '' : '<span class="tm-fallback"><b>D</b></span>')
    + `</div><div class="tm-copy"><span class="tm-num">04/</span><span class="tm-role">Say hello to</span><h3 class="tm-name">${name}</h3>${ahpra}${bio ? `<p class="tm-bio">${bio}</p>` : ''}`
    + '<div class="tm-btns"><a class="btn btn-primary" href="/our-team">Meet the team <span class="btn-arrow">&rarr;</span></a></div></div></div>'
  return out
}
