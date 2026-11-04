import { getSettings } from '@/lib/site'
import { isPreview } from '@/lib/urls'

const ID = /^[A-Za-z0-9-]+$/

/**
 * GA4 and the Meta Pixel, switched on by putting their IDs in the dashboard's
 * Site Settings (GYA only). Nothing is written while the IDs are empty, and
 * nothing ever runs on a preview deployment.
 */
export default function Tracking() {
  if (isPreview()) return null
  const t = (getSettings().tracking ?? {}) as { ga4?: string; metaPixel?: string }
  const ga4 = ID.test(t.ga4 ?? '') ? t.ga4 : ''
  const pixel = ID.test(t.metaPixel ?? '') ? t.metaPixel : ''
  if (!ga4 && !pixel) return null
  return (
    <>
      {ga4 ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`,
            }}
          />
        </>
      ) : null}
      {pixel ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
          }}
        />
      ) : null}
    </>
  )
}
