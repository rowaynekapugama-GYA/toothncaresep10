import type { CSSProperties, ReactElement } from 'react'
import { createElement } from 'react'
import { renderPart, type Part } from '@/lib/parts'
import { applyTokens } from '@/lib/tokens'

const RENAME: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  maxlength: 'maxLength',
  minlength: 'minLength',
  readonly: 'readOnly',
  autocomplete: 'autoComplete',
  novalidate: 'noValidate',
  contenteditable: 'contentEditable',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  allowfullscreen: 'allowFullScreen',
  fetchpriority: 'fetchPriority',
  enterkeyhint: 'enterKeyHint',
  inputmode: 'inputMode',
  spellcheck: 'spellCheck',
  usemap: 'useMap',
  datetime: 'dateTime',
  accesskey: 'accessKey',
}

const BOOLEAN = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'defer', 'disabled', 'hidden', 'loop', 'multiple', 'muted', 'novalidate',
  'open', 'readonly', 'required', 'reversed', 'selected',
])

function camel(prop: string): string {
  if (prop.startsWith('--')) return prop
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/** Turn an inline style string into the object React wants. */
export function parseStyle(text: string): CSSProperties {
  const out: Record<string, string> = {}
  let depth = 0
  let buf = ''
  const parts: string[] = []
  for (const ch of text) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ';' && depth === 0) {
      parts.push(buf)
      buf = ''
    } else {
      buf += ch
    }
  }
  parts.push(buf)
  for (const decl of parts) {
    const at = decl.indexOf(':')
    if (at < 0) continue
    const name = decl.slice(0, at).trim()
    const value = decl.slice(at + 1).trim()
    if (!name || !value) continue
    out[camel(name)] = value
  }
  return out as CSSProperties
}

export function toProps(attrs: Record<string, string | null>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  for (const [rawName, rawValue] of Object.entries(attrs)) {
    const name = rawName.toLowerCase()
    if (name === 'style') {
      props.style = parseStyle(rawValue ?? '')
      continue
    }
    if (name.startsWith('data-') || name.startsWith('aria-')) {
      props[name] = rawValue ?? ''
      continue
    }
    if (BOOLEAN.has(name)) {
      props[RENAME[name] ?? name] = true
      continue
    }
    props[RENAME[name] ?? name] = rawValue ?? ''
  }
  return props
}

const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'track', 'wbr'])

/**
 * Renders one stored part as its own host element with the markup inside
 * handed over untouched, so the browser sees exactly the approved HTML and
 * React never re-renders what the page scripts are working on.
 */
export default function RawPart({
  part,
  overrides,
  tokens,
}: {
  part: Part
  overrides?: Record<string, string>
  tokens: Record<string, string>
}): ReactElement {
  const attrs: Record<string, string | null> = {}
  for (const [k, v] of Object.entries(part.attrs)) {
    attrs[k] = typeof v === 'string' ? applyTokens(v, tokens) : v
  }
  const props = toProps(attrs)
  if (VOID.has(part.tag)) return createElement(part.tag, props)
  return createElement(part.tag, {
    ...props,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: applyTokens(renderPart(part, overrides), tokens) },
  })
}
