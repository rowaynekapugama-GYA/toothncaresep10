import type { ReactNode } from 'react'

type Node = {
  type?: string
  tag?: string | number
  text?: string
  format?: number | string
  listType?: string
  url?: string
  fields?: { url?: string; newTab?: boolean; doc?: unknown }
  children?: Node[]
  [key: string]: unknown
}

const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8
const CODE = 16

function inline(node: Node, key: string): ReactNode {
  let out: ReactNode = node.text ?? ''
  const format = typeof node.format === 'number' ? node.format : 0
  if (format & CODE) out = <code>{out}</code>
  if (format & BOLD) out = <strong>{out}</strong>
  if (format & ITALIC) out = <em>{out}</em>
  if (format & UNDERLINE) out = <u>{out}</u>
  if (format & STRIKE) out = <s>{out}</s>
  return <span key={key}>{out}</span>
}

function render(node: Node, key: string): ReactNode {
  if (node.type === 'text') return inline(node, key)
  const kids = (node.children ?? []).map((c, i) => render(c, `${key}-${i}`))

  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{kids}</p>
    case 'heading': {
      const Tag = (typeof node.tag === 'string' ? node.tag : 'h2') as 'h2'
      return <Tag key={key}>{kids}</Tag>
    }
    case 'list':
      return node.listType === 'number' ? <ol key={key}>{kids}</ol> : <ul key={key}>{kids}</ul>
    case 'listitem':
      return <li key={key}>{kids}</li>
    case 'quote':
      return <blockquote key={key}>{kids}</blockquote>
    case 'horizontalrule':
      return <hr key={key} />
    case 'link': {
      const href = node.fields?.url ?? node.url ?? '#'
      const newTab = node.fields?.newTab
      return (
        <a key={key} href={href} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {kids}
        </a>
      )
    }
    case 'linebreak':
      return <br key={key} />
    default:
      return <span key={key}>{kids}</span>
  }
}

/** Renders the Lexical document a blog post is written in. */
export default function RichText({ value }: { value: unknown }) {
  const root = (value as { root?: Node } | null)?.root
  if (!root?.children) return null
  return <>{root.children.map((child, i) => render(child, `n-${i}`))}</>
}
