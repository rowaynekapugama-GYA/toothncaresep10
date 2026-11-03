import type { GlobalConfig } from 'payload'
import { adminFieldOnly, adminOrEditor } from '../access'
import { touchSiteGlobal } from '../hooks/touchSite'

/**
 * Everything that appears in more than one place on the website. Changing a
 * value here changes it everywhere the page content writes it as a
 * {{site:...}} token.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: adminOrEditor, update: adminOrEditor },
  admin: {
    group: 'Settings',
    description:
      'The practice details used across the whole website. Change them once here and '
      + 'press Publish website on the Dashboard.',
  },
  hooks: { afterChange: [touchSiteGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Practice',
          fields: [
            { name: 'practiceName', type: 'text', label: 'Practice name' },
            { name: 'tagline', type: 'text', label: 'Tagline' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
            {
              name: 'colours',
              type: 'group',
              label: 'Brand colours',
              fields: [
                { name: 'background', type: 'text', label: 'Background' },
                { name: 'aqua', type: 'text', label: 'Main accent' },
                { name: 'neon', type: 'text', label: 'Bright accent' },
                { name: 'gold', type: 'text', label: 'Gold' },
                { name: 'text', type: 'text', label: 'Body text' },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text', label: 'Phone number', admin: { description: 'For example 02 4933 4667.' } },
            { name: 'email', type: 'text', label: 'Email address' },
            {
              name: 'address',
              type: 'group',
              label: 'Address',
              fields: [
                { name: 'street', type: 'text', label: 'Street' },
                { name: 'suburb', type: 'text', label: 'Suburb' },
                { name: 'state', type: 'text', label: 'State' },
                { name: 'postcode', type: 'text', label: 'Postcode' },
              ],
            },
            {
              name: 'hours',
              type: 'array',
              label: 'Opening hours',
              labels: { singular: 'Line', plural: 'Lines' },
              fields: [
                { name: 'days', type: 'text', label: 'Days', admin: { description: 'For example Monday to Friday.' } },
                { name: 'opens', type: 'text', label: 'Opens' },
                { name: 'closes', type: 'text', label: 'Closes' },
              ],
            },
            { name: 'bookingUrl', type: 'text', label: 'Online booking link' },
            { name: 'mapEmbed', type: 'text', label: 'Map embed address' },
            { name: 'mapUrl', type: 'text', label: 'Map link' },
            { name: 'directionsUrl', type: 'text', label: 'Directions link' },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socials',
              type: 'group',
              label: 'Social pages',
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook' },
                { name: 'instagram', type: 'text', label: 'Instagram' },
                { name: 'twitter', type: 'text', label: 'X (Twitter)' },
              ],
            },
          ],
        },
        {
          label: 'Health funds',
          fields: [
            {
              name: 'healthFunds',
              type: 'array',
              label: 'Health funds',
              labels: { singular: 'Fund', plural: 'Funds' },
              fields: [
                { name: 'name', type: 'text', label: 'Fund name' },
                { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
              ],
            },
          ],
        },
        {
          label: 'Enquiries',
          fields: [
            {
              name: 'enquiryRecipients',
              type: 'array',
              label: 'Who receives enquiries',
              labels: { singular: 'Address', plural: 'Addresses' },
              admin: {
                description:
                  'Every enquiry from the website is sent to all of these. '
                  + 'If this list is empty the built in addresses are used instead.',
              },
              fields: [{ name: 'address', type: 'email', label: 'Email address', required: true }],
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'tracking',
              type: 'group',
              label: 'Tracking',
              access: { create: adminFieldOnly, update: adminFieldOnly, read: adminFieldOnly },
              admin: { description: 'Managed by GYA.' },
              fields: [
                { name: 'ga4', type: 'text', label: 'Google Analytics 4 measurement ID' },
                { name: 'metaPixel', type: 'text', label: 'Meta Pixel ID' },
              ],
            },
          ],
        },
        {
          label: 'Features',
          fields: [
            {
              name: 'features',
              type: 'group',
              label: 'What the site shows',
              fields: [
                { name: 'emergency', type: 'checkbox', label: 'Emergency dentistry' },
                { name: 'cdbs', type: 'checkbox', label: 'Child Dental Benefits Schedule' },
                { name: 'zipAfterpay', type: 'checkbox', label: 'Zip and Afterpay' },
                { name: 'preOpening', type: 'checkbox', label: 'Pre-opening mode' },
                { name: 'countdown', type: 'checkbox', label: 'Opening countdown' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
