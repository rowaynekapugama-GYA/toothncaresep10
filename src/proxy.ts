import { NextResponse, type NextRequest } from 'next/server'
import known from '../content/known-paths.json'

const KNOWN = new Set(known as string[])

/** Prefixes the site serves that are not editable pages. */
const NOT_FOUND = '/page-not-found'
const NOT_FOUND_HEADER = 'x-tnc-not-found'

const RESERVED = ['/_next', '/api', '/admin', '/images', '/styles', '/fonts', '/media']

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

/**
 * Unknown addresses get the practice's own 404 page with a real 404 status.
 * Serving it from here rather than from a not-found boundary keeps the page
 * out of the streaming payload of every other page on the site.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // The create first user screen only exists during the one-off setup. The
  // API behind it is guarded separately in sitekit/hooks/firstUserGate.ts.
  if (pathname.startsWith('/admin/create-first-user') && process.env.ALLOW_FIRST_USER !== 'true') {
    return new NextResponse('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } })
  }
  if (KNOWN.has(pathname)) return NextResponse.next()
  if (RESERVED.some((p) => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next()
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next()

  // Fail open. The 404 page itself, our own fetch of it, and a missing or
  // empty list of known pages all go straight through. Next then renders the
  // page or its own 404, which is always better than blocking the whole site.
  if (pathname === NOT_FOUND) return NextResponse.next()
  if (req.headers.get(NOT_FOUND_HEADER)) return NextResponse.next()
  if (KNOWN.size === 0) return NextResponse.next()

  const res = await fetch(new URL(NOT_FOUND, req.nextUrl.origin), {
    headers: { [NOT_FOUND_HEADER]: '1' },
  })
  if (!res.ok) return NextResponse.next()
  return new NextResponse(await res.text(), {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
  })
}
