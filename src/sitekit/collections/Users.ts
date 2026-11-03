import type { CollectionConfig } from 'payload'
import { adminOnly, adminFieldOnly } from '../access'
import { firstUserGate } from '../hooks/firstUserGate'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  hooks: { beforeOperation: [firstUserGate] },
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    description: 'Who can sign in to the dashboard.',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: ({ req }) => Boolean((req.user as { role?: string } | null)?.role),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Full name' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator (GYA)', value: 'admin' },
        { label: 'Editor (practice)', value: 'editor' },
      ],
      admin: {
        description:
          'Editors can change wording, photos, posts and SEO. Administrators also manage users, redirects and tracking IDs.',
      },
      access: { create: adminFieldOnly, update: adminFieldOnly },
    },
  ],
}
