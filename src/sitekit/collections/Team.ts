import type { CollectionConfig } from 'payload'
import { adminOrEditor } from '../access'
import { touchSite } from '../hooks/touchSite'

// The Team list. Dr Nish, Dr Nav, Dr Rav and Zoe are here for the record (their
// cards are part of the Our Team page and the homepage slider, edited there);
// the support team is shown on Our Team straight from this list: anyone ticked
// as a Patient Experience or Clinical Care Coordinator, in this order. The
// practice manages it from the dashboard's Team screen.
// Support team photos (v2.9.1): a photo shows on the website only once "Show
// photo on website (permission confirmed)" is ticked, so a photo can be loaded
// before the person has agreed. Names are first names only, as Christine sent them.

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  access: { read: () => true, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
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
    {
      name: 'photoPath',
      type: 'text',
      label: 'Photo from the website files',
      admin: { description: 'Set by GYA when a photo is supplied by email (for example /images/team-kathryn.webp). A photo chosen above takes its place.' },
      validate: (v: unknown) => !v || /^\/images\/[\w.-]+\.(webp|jpe?g|png)$/i.test(String(v)) || 'A photo address such as /images/team-kathryn.webp',
    },
    {
      name: 'photoApproved',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show photo on website (permission confirmed)',
      admin: { description: 'Only switch this on once the staff member has agreed to their photo appearing on the website.' },
    },
    { name: 'profileUrl', type: 'text', label: 'Profile page address' },
    // the support team section on Our Team (v2.7.0): tick a group to list someone there
    {
      name: 'patientExperience',
      type: 'checkbox',
      defaultValue: false,
      label: 'Patient Experience Coordinator (reception)',
    },
    {
      name: 'clinicalCare',
      type: 'checkbox',
      defaultValue: false,
      label: 'Clinical Care Coordinator (dental assistant or nurse)',
    },
    {
      name: 'roleLine',
      type: 'text',
      label: 'Role line (optional)',
      admin: { description: 'Shown under the name when the support team is one combined grid. Leave empty to use the group name.' },
    },
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
