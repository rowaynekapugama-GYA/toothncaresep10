import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { DEFAULTS } from '@/site.config'
import { siteUrl } from '@/lib/urls'
import Tracking from '@/components/Tracking'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${DEFAULTS.practiceName} | Dentist in ${DEFAULTS.address.suburb}`, template: '%s' },
  // the round tooth mark from the logo (v2.7.1): browser tab, bookmarks, Google results, phone home screens
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Figtree:wght@300;400;500;600;700&family=Great+Vibes&display=swap'

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS} precedence="fonts" />
        {children}
        <Tracking />
      </body>
    </html>
  )
}
