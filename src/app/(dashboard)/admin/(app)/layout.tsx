import { payloadClient, requireUser } from '@/dashboard/lib/server'
import { Shell } from '@/dashboard/ui/Shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser()
  const payload = await payloadClient()
  const open = await payload.count({ collection: 'enquiries', where: { followedUp: { not_equals: true } }, overrideAccess: true })
  // Team: the support team list (v2.7.0); it links on to the Our Team page for the dentists and Zoe
  return <Shell user={{ name: u.name, email: u.email, role: u.role }} newEnquiries={open.totalDocs} teamHref="/admin/team">{children}</Shell>
}
