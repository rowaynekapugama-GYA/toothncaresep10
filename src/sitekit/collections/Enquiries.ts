import type { CollectionConfig } from 'payload'
import { adminOnly, adminOrEditor } from '../access'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    group: 'Website',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'sourcePage', 'emailStatus', 'createdAt'],
    description:
      'Every enquiry sent through the website. Stored here as well as emailed, so nothing is lost if an inbox filters a message.',
    components: { beforeListTable: ['@/sitekit/admin/ExportEnquiries#ExportEnquiries'] },
  },
  access: {
    // Written by the enquiry API using the local API, which bypasses access.
    create: adminOnly,
    read: adminOrEditor,
    update: adminOrEditor,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      name: 'preferredContact',
      type: 'select',
      options: [
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'email' },
        { label: 'Either', value: 'either' },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'consent', type: 'checkbox', label: 'Consented to being contacted' },
    { name: 'sourcePage', type: 'text', label: 'Sent from', admin: { readOnly: true } },
    {
      name: 'emailStatus',
      type: 'select',
      defaultValue: 'sent',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed to send', value: 'failed' },
      ],
      admin: { readOnly: true },
    },
    { name: 'emailError', type: 'text', admin: { readOnly: true, condition: (d) => d?.emailStatus === 'failed' } },
    { name: 'followedUp', type: 'checkbox', label: 'Followed up' },
    { name: 'notes', type: 'textarea', label: 'Notes for the team' },
  ],
}
