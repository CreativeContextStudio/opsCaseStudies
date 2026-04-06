'use client'

import { useState } from 'react'

const tabs = [
  { key: 'team', label: 'Team Lead', subtitle: 'Tactical — every task, every blocker, names and dates', bar: 'bg-ink' },
  { key: 'exec', label: 'Executive', subtitle: 'Summary — 3-5 bullets, risks flagged, decisions needed', bar: 'bg-secondary' },
  { key: 'client', label: 'Client', subtitle: 'Narrative — milestone language, no internal names', bar: 'bg-outline' },
] as const

type TabKey = typeof tabs[number]['key']

interface BriefTabsProps {
  teamBrief: string
  execBrief: string
  clientBrief: string
}

export default function BriefTabs({ teamBrief, execBrief, clientBrief }: BriefTabsProps) {
  const [active, setActive] = useState<TabKey>('team')

  const contentMap: Record<TabKey, string> = {
    team: teamBrief,
    exec: execBrief,
    client: clientBrief,
  }

  const activeTab = tabs.find(t => t.key === active)!
  const html = renderBriefContent(contentMap[active])

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Tab bar */}
      <div className="flex border-b border-outline-variant/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative flex-1 py-4 px-6 text-left transition-colors ${
              active === tab.key
                ? 'bg-surface-lowest'
                : 'bg-surface-low hover:bg-surface-mid'
            }`}
          >
            {/* Active bar */}
            {active === tab.key && (
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${tab.bar}`} />
            )}
            <span className={`font-headline text-lg font-bold block ${
              active === tab.key ? 'text-ink' : 'text-outline'
            }`}>
              {tab.label}
            </span>
            <span className={`font-body text-[11px] mt-0.5 block ${
              active === tab.key ? 'text-on-surface-variant' : 'text-outline-variant'
            }`}>
              {tab.subtitle}
            </span>
          </button>
        ))}
      </div>

      {/* Content area — full width, larger text */}
      <div className="bg-surface-lowest shadow-ambient">
        <div className="max-w-3xl px-10 py-8">
          {/* Audience label */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/8">
            <div className={`w-2 h-2 ${activeTab.bar}`} />
            <span className="label text-[9px] text-ink">{activeTab.label.toUpperCase()} BRIEF</span>
          </div>

          {/* Brief content — larger type for readability */}
          <div
            className="brief-render text-[15px] leading-relaxed text-on-surface-variant"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Content renderer (duplicated from server component since this is client) ──

function renderBriefContent(raw: string): string {
  const lines = raw.split('\n')
  const out: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) { out.push('</div>'); inList = false }
      continue
    }

    // Title line — skip
    if (trimmed.match(/^\*\*.*—.*\*\*$/)) continue

    // Section headers
    const sectionMatch = trimmed.match(/^\*\*(?:🚨\s*)?(?:⚠️\s*)?(Completed|In Progress|Blockers|At Risk|Decisions Needed|Summary|Key decisions needed):?\*\*:?\s*(.*)$/)
    if (sectionMatch) {
      if (inList) { out.push('</div>'); inList = false }
      const label = sectionMatch[1]
      const rest = sectionMatch[2]?.trim() ?? ''

      const colorMap: Record<string, string> = {
        'Completed': 'bg-ink/8 text-ink',
        'In Progress': 'bg-secondary/8 text-secondary',
        'Blockers': 'bg-error/8 text-error',
        'At Risk': 'bg-error/6 text-error/80',
        'Decisions Needed': 'bg-chip/30 text-secondary',
        'Summary': 'bg-surface-low text-on-surface',
        'Key decisions needed': 'bg-chip/30 text-secondary',
      }
      const color = colorMap[label] ?? 'bg-surface-low text-on-surface-variant'

      out.push(`<div class="mt-6 mb-3"><span class="inline-block label text-[10px] px-2.5 py-1 ${color}">${label.toUpperCase()}</span></div>`)

      if (rest && rest !== 'None') {
        out.push(`<p class="font-body text-[15px] text-on-surface-variant mb-1.5">${processBold(rest)}</p>`)
      } else if (rest === 'None') {
        out.push(`<p class="font-body text-[15px] text-outline-variant italic mb-1.5">None</p>`)
      }
      continue
    }

    // List items
    if (trimmed.startsWith('- ')) {
      if (!inList) { out.push('<div class="flex flex-col gap-2 my-2">'); inList = true }

      let text = trimmed.slice(2).trim()
      let indicator = ''

      const emojiMatch = text.match(/^(✅|🔄|⚠️|🚨)\s*/)
      if (emojiMatch) {
        const emoji = emojiMatch[1]
        text = text.slice(emojiMatch[0].length)
        if (emoji === '✅') indicator = '<span class="w-2 h-2 bg-ink shrink-0 mt-[7px]"></span>'
        else if (emoji === '🔄') indicator = '<span class="w-2 h-2 bg-secondary shrink-0 mt-[7px]"></span>'
        else if (emoji === '⚠️') indicator = '<span class="w-2 h-2 bg-error/60 shrink-0 mt-[7px]"></span>'
        else if (emoji === '🚨') indicator = '<span class="w-2 h-2 bg-error shrink-0 mt-[7px]"></span>'
      } else {
        indicator = '<span class="w-2 h-2 bg-outline-variant shrink-0 mt-[7px]"></span>'
      }

      out.push(`<div class="flex gap-3 items-start">${indicator}<span class="font-body text-[15px] text-on-surface-variant leading-snug">${processBold(text)}</span></div>`)
      continue
    }

    // Paragraph
    if (inList) { out.push('</div>'); inList = false }
    out.push(`<p class="font-body text-[15px] text-on-surface-variant leading-relaxed mb-3">${processBold(trimmed)}</p>`)
  }

  if (inList) out.push('</div>')
  return out.join('\n')
}

function processBold(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}
