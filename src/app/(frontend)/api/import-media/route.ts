import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Manifest = Record<string, { file: string; w: number; h: number }>

/**
 * Copies the photographs already on the website into the Media Library so the
 * practice can reuse them. Safe to run more than once.
 */
export async function POST() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 })
  if ((user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Only a GYA administrator can do this.' }, { status: 403 })
  }

  const manifestPath = path.join(process.cwd(), 'docs', 'build-notes', 'image-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    return NextResponse.json({ error: 'No picture list found in the repository.' }, { status: 404 })
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest

  let added = 0
  let skipped = 0
  const failed: string[] = []

  for (const entry of Object.values(manifest)) {
    const filename = path.basename(entry.file)
    const filePath = path.join(process.cwd(), 'public', 'images', filename)
    if (!fs.existsSync(filePath)) {
      failed.push(filename)
      continue
    }
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      skipped++
      continue
    }
    try {
      await payload.create({
        collection: 'media',
        depth: 0,
        data: { alt: 'Tooth n Care, East Maitland' } as never,
        file: {
          data: fs.readFileSync(filePath),
          mimetype: 'image/webp',
          name: filename,
          size: fs.statSync(filePath).size,
        },
      })
      added++
    } catch {
      failed.push(filename)
    }
  }

  return NextResponse.json({
    message:
      `Media Library updated. ${added} pictures added`
      + `${skipped ? `, ${skipped} already there` : ''}`
      + `${failed.length ? `, ${failed.length} could not be read` : ''}.`
      + (added ? ' Please give each one a short description on its page.' : ''),
  })
}
