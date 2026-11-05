import type { CollectionConfig } from 'payload'
import { adminOnly, adminOrEditor } from '../access'
import { touchSite } from '../hooks/touchSite'

// TODO(v2.4.0, 5 Nov 2026): team names and photos are pending client confirmation.
// Nish is sending the full, correctly spelt names (and roles) of the staff he wants
// on the website, and Christine is gathering photos of staff who are happy to appear.
// Until both arrive, leave Dr Nish, Dr Nav and Zoe exactly as they are and add no one.
// The team list lives in content/team.json (rewritten from the dashboard at build, so it
// cannot hold a comment) and in the Our Team page and homepage team slider sections.

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
