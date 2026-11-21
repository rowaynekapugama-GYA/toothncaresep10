/**
 * The note the page editor shows when GYA's go-live switches (src/golive.config.ts)
 * leave something on the page off the website. Everything stays in the editor,
 * so editing never loses it.
 */
import { GO_LIVE } from '@/golive.config'
import { offerReport } from '@/lib/golive'

type Row = { template?: string | null; attrs?: string | null; content?: { text?: string | null }[] | null }

export function goLiveNoteFor(sections: Row[]): string | null {
  const text = sections.map((s) => `${s.template ?? ''} ${s.attrs ?? ''} ${(s.content ?? []).map((c) => c.text ?? '').join(' ')}`).join(' ')
  const off = offerReport().filter((o) => !o.state.active && (text.includes(`offer:${o.key}`) || text.includes(`offer-${o.key}`) || text.includes(`"data-offer":"${o.key}"`) || text.includes(`offer:${o.key}+`) || text.includes(`+${o.key}-->`)))
  const notes = GO_LIVE.goLive && text.includes('class="verify"')
  if (!off.length && !notes) return null
  const parts: string[] = []
  if (off.length) parts.push(`${off.map((o) => o.label).join(', ')}: not shown on the website until GYA confirms the offer period${off.some((o) => o.state.reason === 'price not confirmed') ? ' (and the whitening price)' : ''}. Those words, cards and answers are still here, outlined, so editing never loses them.`)
  if (notes) parts.push('The yellow [VERIFY] notes are reminders for GYA and never show on the website.')
  return parts.join(' ')
}
