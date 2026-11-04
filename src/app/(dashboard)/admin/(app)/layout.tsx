import { payloadClient, requireUser } from '@/dashboard/lib/server'
import { Shell } from '@/dashboard/ui/Shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser()
  const payload = await payloadClient()
  const open = await payload.count({ collection: 'enquiries', where: { followedUp: { not_equals: true } }, overrideAccess: true })
  const team = await payload.find({ collection: 'pages', where: { pageSlug: { equals: 'our-team' } }, limit: 1, depth: 0, overrideAccess: true, select: { pageSlug: true } })
  const teamHref = team.docs[0] ? `/admin/pages/${team.docs[0].id}` : '/admin/pages'
  return <Shell user={{ name: u.name, email: u.email, role: u.role }} newEnquiries={open.totalDocs} teamHref={teamHref}>{children}</Shell>
}
