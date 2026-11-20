/** Where a photo is used, for the Media Library's Delete button. */
import { json, routeUser } from '@/dashboard/lib/routeAuth'
import { mediaUsage } from '@/sitekit/mediaUsage'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, user } = await routeUser(req)
  if (!user) return json(401, { error: 'Your session has ended. Please sign in again.' })
  const { id } = await params
  return json(200, { places: await mediaUsage(payload, id), canDeleteInUse: user.role === 'admin' })
}
