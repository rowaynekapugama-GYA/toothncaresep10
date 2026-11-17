/**
 * What makes a team photo look right on the website (v2.8.0). Shown next to
 * the photo on the Team screen and when a team photo is chosen on a page.
 * The website adds the colour treatment itself (public/styles/common.css,
 * "team photo colour treatment"), so photos are uploaded exactly as taken.
 */
import React from 'react'

/** Page sections whose photos are team photos. */
export const TEAM_PHOTO_SECTIONS = ['our-team-03-small-team-familiar-faces', 'index-06-team']

export function TeamPhotoHelp({ compact = false }: { compact?: boolean }) {
  return (
    <div className="help" style={{ marginTop: compact ? 6 : 10 }}>
      <b>Team photos:</b> landscape, 4:3 (for example 1600 x 1200 pixels), at least 800 x 600 pixels.
      Head and shoulders in the middle of the frame, against a plain background such as a wall in the practice.
      Upload the photo as it is: the colour treatment is added automatically, so every card matches.
    </div>
  )
}
