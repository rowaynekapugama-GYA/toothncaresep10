import { DEFAULTS } from '@/site.config'

/** The canonical origin for this deployment, without a trailing slash. */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    DEFAULTS.siteUrl
  return raw.replace(/\/+$/, '')
}

export function absolute(pathname: string): string {
  if (!pathname) return siteUrl()
  if (/^https?:\/\//i.test(pathname)) return pathname
  return `${siteUrl()}${pathname.startsWith('/') ? '' : '/'}${pathname}`
}

/** True on a preview deployment, which must never be indexed. */
export function isPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview'
}
