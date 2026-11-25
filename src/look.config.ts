/**
 * Tooth n Care: optional looks GYA can switch on or off (v2.10.0). GYA edits
 * this file; the practice cannot. Change a value, commit, push: Vercel rebuilds.
 *
 * LOOK.toothGlow
 *   A faint glow of the practice's tooth outline behind the text of a few dark
 *   sections (Christine, 21 Nov 2026: "a subtle highlight glow of the tooth
 *   sign"). Off until Nish has seen it. true: it shows on the sections listed in
 *   TOOTH_GLOW_PAGES, each styled in public/styles/glow/<page>.css.
 *   It is never placed behind a photo or a form, and the text over it keeps a
 *   contrast ratio of 4.5:1 or better (checked in v2.10.0).
 */
export const LOOK = {
  toothGlow: false,
}

/** The pages that have a glow stylesheet, and the section it sits behind on each. */
export const TOOTH_GLOW_PAGES: Record<string, string> = {
  faq: 'Your Visits & Our Practice (the first group of questions)',
  'laser-dentistry': 'What we use the laser for',
  'our-team': 'Related pages',
}
