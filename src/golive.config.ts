/**
 * Tooth n Care: the go-live switches (v2.9.0). GYA edits this file; the
 * practice cannot. Change a value, commit, push: Vercel rebuilds.
 *
 * GO_LIVE.goLive
 *   true: no "[VERIFY]" note reaches a public page, and every offer below that
 *   is not confirmed is left out of the public pages (its sections, cards,
 *   FAQ answers and sentences, and the matching structured data).
 *   The dashboard still shows everything, with a dashed outline and a note,
 *   so nothing is lost when the practice edits a page.
 *
 * GO_LIVE.legalApproved
 *   Who at the practice approved the Privacy Policy and Terms, and when. Until
 *   it is filled in, the build and the update script warn that the domain
 *   should not be switched. It changes nothing on the pages.
 *
 * OFFERS
 *   AHPRA: an advertised offer must show its price, what it includes and the
 *   offer period. An offer shows only when its period is known: ongoing: true
 *   (the practice confirms it has no end date), or a start and end date
 *   ('YYYY-MM-DD'). With dates it shows from the start date to the end date
 *   inclusive and then drops off by itself: at the next build, and in the
 *   visitor's browser on the day it ends. The whitening offer also needs
 *   priceConfirmed: true, after its price has been typed into the Offers page.
 */

export type Offer = {
  /** How GYA and the dashboard name it. */
  label: string
  /** The practice has said in writing that the offer has no end date. */
  ongoing: boolean
  /** First day, 'YYYY-MM-DD', or ''. */
  start: string
  /** Last day, 'YYYY-MM-DD', or ''. */
  end: string
  /** Only for offers whose price is not yet on the page. */
  priceConfirmed?: boolean
}

export const GO_LIVE = {
  goLive: true,
  /** e.g. { by: 'Dr Nisheeth Agrawal', date: '2026-11-23' } */
  legalApproved: { by: '', date: '' },
}

export const OFFERS = {
  /** $199 or no-gap new patient first visit (homepage, Offers, New Patients, suburb pages, costs, FAQ). */
  newPatient: { label: 'New patient first visit ($199 or no-gap)', ongoing: false, start: '', end: '' },
  /** 5% off treatment for patients 60 and over (Offers, Payment Options). */
  seniors: { label: 'Seniors discount (5%, 60 and over)', ongoing: false, start: '', end: '' },
  /** Philips ZOOM in-chair whitening at a discounted rate (Offers, Teeth Whitening). */
  whitening: { label: 'Philips ZOOM in-chair whitening', ongoing: false, start: '', end: '', priceConfirmed: false },
} satisfies Record<string, Offer>

export type OfferKey = keyof typeof OFFERS
