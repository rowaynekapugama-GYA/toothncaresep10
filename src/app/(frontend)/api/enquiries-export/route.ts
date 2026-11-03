import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLUMNS = [
  ['createdAt', 'Received'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['preferredContact', 'Preferred contact'],
  ['sourcePage', 'Sent from'],
  ['message', 'Message'],
  ['emailStatus', 'Email status'],
  ['followedUp', 'Followed up'],
] as const

const cell = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

/** Every enquiry as a spreadsheet, for the practice's own records. */
export async function GET() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return new Response('Please log in first.', { status: 401 })

  const found = await payload.find({
    collection: 'enquiries',
    limit: 5000,
    depth: 0,
    pagination: false,
    sort: '-createdAt',
  })

  const rows = [COLUMNS.map(([, label]) => cell(label)).join(',')]
  for (const doc of found.docs as unknown as Record<string, unknown>[]) {
    rows.push(COLUMNS.map(([key]) => cell(doc[key])).join(','))
  }

  const today = new Date().toISOString().slice(0, 10)
  return new Response(`﻿${rows.join('\r\n')}\r\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="tooth-n-care-enquiries-${today}.csv"`,
    },
  })
}
