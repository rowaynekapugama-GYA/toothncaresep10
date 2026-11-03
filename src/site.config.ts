/**
 * Client specific defaults for Tooth n Care.
 * At build time these are merged with content/site-settings.json, which the
 * dashboard writes. One level object merge, arrays replaced wholesale.
 */
export const DEFAULTS = {
  practiceName: 'Tooth n Care',
  tagline: 'Smile With Confidence',
  /** Overridden by NEXT_PUBLIC_SERVER_URL. Change at go live. */
  siteUrl: 'https://toothncare.com.au',
  logo: '/images/img-09b604b050.webp',
  /** Shown when a page has no image of its own. Absolute at render time. */
  ogImage: '/images/img-880c59f894.webp',
  colours: {
    background: '#0B1112',
    aqua: '#4FD8D2',
    neon: '#7FF6F0',
    gold: '#E8C98A',
    text: '#B8C4C6',
  },
  phone: '02 4933 4667',
  phoneHref: 'tel:0249334667',
  email: 'reception@toothncare.com.au',
  address: {
    street: '135 Lawes Street',
    suburb: 'East Maitland',
    state: 'NSW',
    postcode: '2323',
    country: 'AU',
  },
  geo: { latitude: -32.7520106, longitude: 151.5904216 },
  hours: [
    { days: 'Monday to Friday', opens: '09:00', closes: '18:00' },
    { days: 'Saturday', opens: '09:00', closes: '16:00' },
  ],
  bookingUrl: 'https://apac.dentalhub.online/soe/new/?pid=AUXOD01',
  mapEmbed:
    'https://www.google.com/maps?q=135+Lawes+Street,+East+Maitland+NSW+2323&output=embed',
  mapUrl: 'https://www.google.com/maps?q=135+Lawes+Street,+East+Maitland+NSW+2323',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=135+Lawes+Street+East+Maitland+NSW+2323',
  socials: {
    facebook: 'https://facebook.com/dentisteastmaitland',
    instagram: 'https://instagram.com/toothncare',
    twitter: 'https://twitter.com/toothncareau',
  },
  /** Fallback recipients, used when Site Settings has none. */
  enquiryRecipients: [
    'reception@toothncare.com.au',
    'smileox-intake-PLACEHOLDER@toothncare.com.au',
    'rowayne@gyaclients.com',
  ],
  tracking: { ga4: '', metaPixel: '' },
  features: {
    emergency: true,
    cdbs: true,
    zipAfterpay: true,
    preOpening: false,
    countdown: false,
  },
} as const

export type SiteDefaults = typeof DEFAULTS
