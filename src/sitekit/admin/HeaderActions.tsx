'use client'

import { useAuth } from '@payloadcms/ui'

/** Sits in the bar across the top: who is logged in, and a way out to the site. */
export function HeaderActions() {
  const { user } = useAuth()
  const email = (user as { email?: string } | null)?.email
  return (
    <div className="tnc-header">
      {email ? <span className="tnc-header__user">Signed in as {email}</span> : null}
      <a className="tnc-header__view" href="/" target="_blank" rel="noopener noreferrer">
        View site
      </a>
    </div>
  )
}

export default HeaderActions
