import { siteUrl } from '@/lib/urls'

/** Keys whose values are URLs and therefore have to be absolute. */
const URL_KEYS = new Set([
  '@id', 'url', 'image', 'logo', 'sameAs', 'contentUrl', 'thumbnailUrl',
  'item', 'mainEntityOfPage', 'urlTemplate', 'target', 'significantLink',
  'relatedLink', 'primaryImageOfPage',
])

const STAGING = /https?:\/\/toothncare\.vercel\.app/g

function walk(node: unknown, key?: string): unknown {
  if (typeof node === 'string') {
    let out = node.replace(STAGING, siteUrl())
    if (key && URL_KEYS.has(key) && out.startsWith('/')) out = siteUrl() + out
    return out
  }
  if (Array.isArray(node)) return node.map((v) => walk(v, key))
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = walk(v, k)
    return out
  }
  return node
}

/**
 * Point every URL in a structured data block at the live site and make the
 * relative ones absolute. Unparseable blocks are passed through untouched so a
 * hand edit can never take a page down.
 */
export function rewriteJsonLd(block: string): string {
  try {
    return JSON.stringify(walk(JSON.parse(block)))
  } catch {
    return block.replace(STAGING, siteUrl())
  }
}
