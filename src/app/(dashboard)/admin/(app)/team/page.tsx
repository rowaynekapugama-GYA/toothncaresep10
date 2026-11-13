import { payloadClient, requireUser } from '@/dashboard/lib/server'
import { TeamEditor, type Member } from '@/dashboard/editors/TeamEditor'
import { SUPPORT_TEAM } from '@/team.config'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Team' }

export default async function TeamScreen() {
  await requireUser()
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'team', limit: 500, sort: 'sortOrder', depth: 1, overrideAccess: true, pagination: false })
  const page = await payload.find({ collection: 'pages', where: { pageSlug: { equals: 'our-team' } }, limit: 1, depth: 0, overrideAccess: true, select: { pageSlug: true } })
  const ourTeamHref = page.docs[0] ? `/admin/pages/${page.docs[0].id}` : '/admin/pages'
  // the clinicians (they have a role, such as Dentist) are on the page itself
  const members: Member[] = (res.docs as unknown as Record<string, unknown>[])
    .filter((d) => !String(d.role ?? '').trim())
    .map((d) => ({
      id: d.id as number,
      name: String(d.name ?? ''),
      patientExperience: !!d.patientExperience,
      clinicalCare: !!d.clinicalCare,
      roleLine: String(d.roleLine ?? ''),
      photo: d.photo && typeof d.photo === 'object' ? (d.photo as Member['photo']) : null,
      sortOrder: Number(d.sortOrder ?? 0),
      hidden: !!d.hidden,
    }))
  return (
    <>
      <div className="pd-head"><div className="grow"><h1>Team</h1><p className="pd-sub">The support team shown on the Our Team page, under {SUPPORT_TEAM.patientExperience.heading} and {SUPPORT_TEAM.clinicalCare.heading}.</p></div></div>
      <TeamEditor
        initial={members}
        ourTeamHref={ourTeamHref}
        labels={{ patientExperience: SUPPORT_TEAM.patientExperience.heading, clinicalCare: SUPPORT_TEAM.clinicalCare.heading, layout: SUPPORT_TEAM.layout }}
      />
    </>
  )
}
