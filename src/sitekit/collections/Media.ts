import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { adminOrEditor, anyone } from '../access'
import { mediaUsage } from '../mediaUsage'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media Library' },
  admin: {
    group: 'Website',
    description:
      'Every photo used on the site. Replacing an image here updates it everywhere it is used.',
  },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  hooks: {
    // v2.9.0: the practice cannot delete a photo the website still shows; GYA can (the dashboard warns first)
    beforeDelete: [
      async ({ req, id }) => {
        if ((req.user as { role?: string } | null)?.role === 'admin') return
        const places = await mediaUsage(req.payload, id)
        if (places.length) {
          throw new APIError(`This photo is still used on ${places.join(', ')}. Replace it there first, or use Upload a replacement to change it everywhere.`, 409, null, true)
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/*'],
    // One resized master. Uploads are converted to WebP at 2400px and served
    // with next/image unoptimized, so they never hit the optimisation cap.
    formatOptions: { format: 'webp', options: { quality: 80 } },
    resizeOptions: { width: 2400, height: undefined, withoutEnlargement: true, fit: 'inside' },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
      admin: {
        description:
          'Describe what is in the photo, for screen readers and search. Example: reception at Tooth n Care on Lawes Street.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Credit or source',
      admin: { description: 'Optional. Where the photo came from.' },
    },
  ],
}
