import type { Payload } from 'payload'

export type EnquiryRecord = {
  name: string
  email?: string
  phone?: string
  preferredContact?: string
  message?: string
  consent?: boolean
  sourcePage?: string
  emailStatus: 'sent' | 'failed'
  emailError?: string
}

/**
 * Store an enquiry through the local API. Failures are tolerated: the caller
 * swallows any error so the public form still works when the database is down.
 */
export async function logEnquiry(data: EnquiryRecord): Promise<void> {
  if (!process.env.DATABASE_URL) return
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload: Payload = await getPayload({ config })
  await payload.create({ collection: 'enquiries', data: data as never })
}
