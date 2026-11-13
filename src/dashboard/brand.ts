/**
 * Everything client specific about the dashboard lives here, so the rest of
 * src/dashboard is the GYA standard dashboard unchanged from site to site.
 */
export const BRAND = {
  name: 'Tooth n Care',
  domain: 'toothncare.com.au',
  /** shown on the dark sidebar and on the dark strip at the top of the sign in card */
  logoOnDark: '/images/img-09b604b050.webp',
  favicon: '/icon.svg',
  /** for "Good morning" and the dates in Enquiries */
  timeZone: 'Australia/Sydney',
  /** shown as the author of a new post until someone changes it */
  defaultAuthor: 'Tooth n Care',
  /** shown in the Google preview while a description is being typed */
  phone: '02 4933 4667',
  /** the default share picture when a page sets none */
  defaultOg: '/images/img-0451df991a.webp',
} as const
