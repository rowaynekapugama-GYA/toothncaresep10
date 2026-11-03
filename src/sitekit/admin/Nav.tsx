'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useNav } from '@payloadcms/ui'
import type { ReactNode } from 'react'

type Item = { href: string; label: string; icon: ReactNode; adminOnly?: boolean }

const Ic = ({ d, extra }: { d: string; extra?: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
    {extra}
  </svg>
)

const ITEMS: Item[] = [
  { href: '', label: 'Dashboard', icon: <Ic d="M4 13h7V4H4zM13 8h7V4h-7zM13 20h7v-9h-7zM4 20h7v-4H4z" /> },
  { href: '/collections/pages', label: 'Pages', icon: <Ic d="M6 3h8l4 4v14H6zM14 3v4h4" /> },
  { href: '/collections/posts', label: 'Blog Posts', icon: <Ic d="M4 5h16M4 10h16M4 15h10M4 20h7" /> },
  {
    href: '/collections/media',
    label: 'Media Library',
    icon: <Ic d="M3.5 5.5h17v13h-17zM3.5 15l4.5-4.5 4 4 3-3 5.5 5" extra={<circle cx="8.5" cy="9" r="1.4" />} />,
  },
  {
    href: '/collections/team',
    label: 'Team',
    icon: <Ic d="M16 20v-1.5c0-2-1.8-3.5-4-3.5s-4 1.5-4 3.5V20M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />,
  },
  { href: '/collections/enquiries', label: 'Enquiries', icon: <Ic d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6" /> },
  {
    href: '/globals/seo',
    label: 'SEO',
    icon: <Ic d="M20.5 20.5 16 16" extra={<circle cx="11" cy="11" r="7" />} />,
  },
  {
    href: '/globals/site-settings',
    label: 'Site Settings',
    icon: (
      <Ic
        d="M19.5 12a7.5 7.5 0 0 1-.1 1.2l2 1.6-2 3.4-2.4-1a7.5 7.5 0 0 1-2 1.2l-.4 2.6h-4l-.4-2.6a7.5 7.5 0 0 1-2-1.2l-2.4 1-2-3.4 2-1.6a7.5 7.5 0 0 1 0-2.4l-2-1.6 2-3.4 2.4 1a7.5 7.5 0 0 1 2-1.2L10.6 3h4l.4 2.6a7.5 7.5 0 0 1 2 1.2l2.4-1 2 3.4-2 1.6c.07.4.1.79.1 1.2Z"
        extra={<circle cx="12" cy="12" r="2.8" />}
      />
    ),
  },
  { href: '/collections/redirects', label: 'Redirects', icon: <Ic d="M4 7h11l-3-3M20 17H9l3 3" />, adminOnly: true },
  {
    href: '/collections/users',
    label: 'Users',
    icon: <Ic d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M21 20v-2a4 4 0 0 0-3-3.87M10 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5" />,
    adminOnly: true,
  },
]

/**
 * The menu down the left hand side. Fixed order, plain language, an icon on
 * every row, and the two technical sections hidden from practice logins.
 */
export function Nav() {
  const pathname = usePathname() || ''
  const { user } = useAuth()
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const isAdmin = (user as { role?: string } | null)?.role === 'admin'
  const base = '/admin'

  const classes = [
    'nav',
    navOpen && 'nav--nav-open',
    shouldAnimate && 'nav--nav-animate',
    hydrated && 'nav--nav-hydrated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classes} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll" ref={navRef}>
        <nav className="nav__wrap tnc-nav">
          <Link className="tnc-nav__brand" href={base}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/img-09b604b050.webp" alt="Tooth n Care" />
          </Link>
          <ul className="tnc-nav__list">
            {ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
              const href = base + item.href
              const active = item.href === '' ? pathname === base : pathname.startsWith(href)
              return (
                <li key={item.label}>
                  <Link
                    className={`tnc-nav__link${active ? ' is-active' : ''}`}
                    href={href}
                    onClick={() => setNavOpen(false)}
                  >
                    <span className="tnc-nav__icon">{item.icon}</span>
                    <span className="tnc-nav__label">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="tnc-nav__foot">
            <a className="tnc-nav__logout" href={`${base}/logout`}>
              Log out
            </a>
          </div>
        </nav>
        <div className="nav__header">
          <div className="nav__header-content">
            <button
              type="button"
              className="nav__hamburger"
              aria-label={navOpen ? 'Close the menu' : 'Open the menu'}
              onClick={() => setNavOpen(!navOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Nav
