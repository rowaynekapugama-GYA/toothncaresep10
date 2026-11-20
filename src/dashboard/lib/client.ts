'use client'
/** Browser-side helpers: the dashboard writes through Payload's REST API with the session cookie. */

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function messageFrom(data: unknown, status: number): string {
  const d = data as { errors?: { message?: string; data?: { errors?: { message?: string; label?: string }[] } }[]; message?: string; error?: string }
  const first = d?.errors?.[0]
  const fieldErr = first?.data?.errors?.[0]
  if (fieldErr?.message) return `${fieldErr.label ? fieldErr.label + ': ' : ''}${fieldErr.message}`
  if (first?.message) return first.message
  if (d?.error) return d.error
  if (d?.message) return d.message
  if (status === 413) return 'That photo is too large for the website to accept. Please use a smaller photo (under 4 MB), or ask GYA.'
  if (status === 401 || status === 403) return 'Your session has ended or you do not have access. Please sign in again.'
  return `Something went wrong (${status}). Please try again.`
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method || (opts.body || opts.form ? 'POST' : 'GET'),
    credentials: 'include',
    headers: opts.form ? undefined : { 'Content-Type': 'application/json' },
    body: opts.form ? opts.form : opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) throw new ApiError(messageFrom(data, res.status), res.status)
  return data as T
}

/**
 * Vercel refuses any request over 4.5 MB, and phone photos are often 5 to 12 MB.
 * Photos over this size (and iPhone HEIC photos) are made smaller in the browser
 * before they are sent. The website keeps photos at up to 2400 pixels wide anyway.
 */
const SEND_LIMIT = 4 * 1024 * 1024
const SIDES = [2400, 2000, 1600]

const isHeic = (f: File) => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name)

/** The photo as it will be sent: unchanged if small enough, otherwise resized (or a plain error). */
export async function prepareImage(file: File): Promise<File> {
  const heic = isHeic(file)
  if (!heic && file.size <= SEND_LIMIT) return file
  if (!heic && !/^image\//i.test(file.type)) throw new Error(`${file.name} is not a photo. Please choose a JPG, PNG or WebP file.`)
  let bmp: ImageBitmap
  try {
    bmp = await createImageBitmap(file)
  } catch {
    if (heic) {
      throw new Error(`${file.name} is an iPhone photo in HEIC format, which this browser cannot open. Please upload it as a JPG: on the iPhone, open Settings, Camera, Formats and choose Most Compatible, or AirDrop or email the photo to a computer first, which saves it as a JPG.`)
    }
    throw new Error(`${file.name} could not be opened. Please save it as a JPG or PNG and try again.`)
  }
  const keepAlpha = /png|webp|gif/i.test(file.type)
  const type = keepAlpha ? 'image/webp' : 'image/jpeg'
  const ext = keepAlpha ? '.webp' : '.jpg'
  const name = `${file.name.replace(/\.[a-z0-9]+$/i, '') || 'photo'}${ext}`
  for (const side of SIDES) {
    const scale = Math.min(1, side / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) break
    ctx.drawImage(bmp, 0, 0, w, h)
    for (const q of [0.86, 0.78]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, q))
      if (blob && blob.size <= SEND_LIMIT) return new File([blob], name, { type })
    }
  }
  throw new Error(`${file.name} is too large to upload (${(file.size / 1048576).toFixed(1)} MB), even after making it smaller. Please use a smaller photo, under 4 MB.`)
}

/** Upload one photo to the Media Library. */
export async function uploadMedia(original: File, alt = ''): Promise<any> {
  const file = await prepareImage(original)
  const form = new FormData()
  form.append('file', file)
  // every photo needs a description; start from the file name until someone writes a better one
  const fallback = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim() || 'Photo'
  form.append('_payload', JSON.stringify({ alt: alt || fallback }))
  const res = await api<{ doc: any }>('/api/media', { form })
  return res.doc
}

/** Replace the file behind a Media Library item, keeping the item (and every place it is used). */
export async function replaceMedia(id: string | number, original: File): Promise<any> {
  const file = await prepareImage(original)
  const form = new FormData()
  form.append('file', file)
  form.append('_payload', JSON.stringify({}))
  const res = await api<{ doc: any }>(`/api/media/${id}`, { method: 'PATCH', form })
  return res.doc
}

export function mediaSrc(doc: any, size?: 'thumb' | 'og'): string {
  if (!doc) return ''
  const raw: string = (size && doc.sizes?.[size]?.url) || doc.url || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) && !raw.includes('/api/media/')) return raw
  try {
    const u = new URL(raw, window.location.origin)
    return u.pathname.replace(/\/+$/, '') + u.search
  } catch {
    return raw
  }
}

/** The largest photo the dashboard will try; anything over 4 MB is made smaller before sending. */
export const MAX_UPLOAD_MB = 40
