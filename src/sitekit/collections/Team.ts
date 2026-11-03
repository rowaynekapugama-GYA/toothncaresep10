import type { CollectionConfig } from 'payload'
import { adminOnly, adminOrEditor } from '../access'
import { touchSite } from '../hooks/touchSite'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  access: { read: () => true, create: adminOrEditor, update: adminOrEditor, delete: adminOnly },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'sortOrder', 'hidden'],
    group: 'Website',
    description:
      'Names, roles and qualifications must come from the practice. '
      + 'Never add a qualification or registration number that has not been supplied.',
    components: { beforeList: ['@/sitekit/admin/AhpraNotice#AhpraNotice'] },
  },
  hooks: { afterChange: [touchSite], afterDelete: [touchSite] },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Full name' },
    { name: 'role', type: 'text', label: 'Role', admin: { description: 'For example: Principal Dentist.' } },
    {
      name: 'credentials',
      type: 'text',
      label: 'Qualifications',
      admin: { description: 'Exactly as the practice supplied them.' },
    },
    {
      name: 'registration',
      type: 'text',
      label: 'AHPRA registration number',
      admin: { description: 'Optional. Only if the practice has given it to you.' },
    },
    { name: 'bio', type: 'textarea', label: 'About this person' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photograph' },
    { name: 'profileUrl', type: 'text', label: 'Profile page address' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Order', admin: { position: 'sidebar' } },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hide from the website',
      admin: { position: 'sidebar' },
    },
  ],
}
