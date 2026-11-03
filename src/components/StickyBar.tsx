/**
 * The phone-only bar across the bottom: call, or book online. Hidden above
 * 760px, so the desktop layout is exactly as approved.
 */
export default function StickyBar({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div className="sticky-bar" aria-label="Quick actions">
      <a className="sb-call" href={tokens.phoneHref} aria-label={`Call ${tokens.practiceName} on ${tokens.phone}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
        </svg>
        Call
      </a>
      <a className="sb-book" href={tokens.bookingUrl} target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
          <path d="M8 2.5v4M16 2.5v4M3.5 9.5h17" />
          <path d="m9.5 14.5 2 2 3.5-3.8" />
        </svg>
        Book Online
      </a>
    </div>
  )
}
