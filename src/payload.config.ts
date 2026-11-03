import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './sitekit/collections/Users'
import { Media } from './sitekit/collections/Media'
import { Pages } from './sitekit/collections/Pages'
import { Posts, Categories } from './sitekit/collections/Posts'
import { Team } from './sitekit/collections/Team'
import { Enquiries } from './sitekit/collections/Enquiries'
import { Redirects } from './sitekit/collections/Redirects'
import { SiteSettings } from './sitekit/globals/SiteSettings'
import { Seo } from './sitekit/globals/Seo'
import { SiteStatus } from './sitekit/globals/SiteStatus'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const origins = [
  process.env.NEXT_PUBLIC_SERVER_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  'http://localhost:3000',
  'http://localhost:3100',
].filter(Boolean) as string[]

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, '..') },
    avatar: 'default',
    meta: {
      titleSuffix: ' - Tooth n Care',
      description: 'Website dashboard for Tooth n Care, East Maitland.',
    },
    components: {
      Nav: '@/sitekit/admin/Nav#Nav',
      graphics: {
        Logo: '@/sitekit/admin/Logo#Logo',
        Icon: '@/sitekit/admin/Logo#Icon',
      },
      beforeDashboard: ['@/sitekit/admin/BeforeDashboard#BeforeDashboard'],
      actions: ['@/sitekit/admin/HeaderActions#HeaderActions'],
    },
  },
  // the order here is the order of the menu down the left hand side
  collections: [Pages, Posts, Categories, Media, Team, Enquiries, Redirects, Users],
  globals: [Seo, SiteSettings, SiteStatus],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    push: false,
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  cors: origins,
  csrf: origins,
  secret: process.env.PAYLOAD_SECRET || 'set-PAYLOAD_SECRET-before-deploying',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp,
  telemetry: false,
})
