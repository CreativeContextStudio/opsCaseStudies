import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStandupById } from '../../../lib/queries'
import { formatLongDate } from '../../../lib/format'

export const dynamic = 'force-dynamic'

export default async function BriefView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const standup = await getStandupById(id)
  if (!standup) notFound()

  const runDuration = standup.started_at && standup.completed_at
    ? Math.round((new Date(standup.completed_at).getTime() - new Date(standup.started_at).getTime()) / 1000)
    : null

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/standup" className="label text-[9px] text-outline hover:text-ink transition-colors">
          &larr; Back to overview
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="label text-[9px] text-secondary italic">{standup.project_name}</p>
            <h1 className="font-headline text-3xl font-bold text-ink mt-1 tracking-tight">
              Daily Standup
            </h1>
            <p className="font-body text-on-surface-variant mt-1">{formatLongDate(standup.date)}</p>
          </div>
          <div className="flex items-center gap-3">
            {standup.blockers_count > 0 && <Pill variant="error">{standup.blockers_count} blocker{standup.blockers_count !== 1 ? 's' : ''}</Pill>}
            {standup.at_risk_count > 0 && <Pill variant="warn">{standup.at_risk_count} at risk</Pill>}
            {standup.blockers_count === 0 && standup.at_risk_count === 0 && <Pill variant="neutral">Clean</Pill>}
            {runDuration != null && <Pill variant="muted">{runDuration}s</Pill>}
            {standup.token_count && <Pill variant="muted">{(standup.token_count / 1000).toFixed(1)}k tokens</Pill>}
            {standup.tool_calls && <Pill variant="muted">{standup.tool_calls} tools</Pill>}
          </div>
        </div>
      </div>

      {/* Three-panel brief comparison — THE HERO */}
      <div className="grid grid-cols-3 gap-5 mt-8">
        <BriefPanel audience="Team Lead" subtitle="Tactical — every task, every blocker, names and dates" content={standup.team_brief} accent="ink" delay={0} />
        <BriefPanel audience="Executive" subtitle="Summary — 3-5 bullets, risks flagged, decisions needed" content={standup.exec_brief} accent="secondary" delay={1} />
        <BriefPanel audience="Client" subtitle="Narrative — milestone language, no internal names" content={standup.client_brief} accent="outline" delay={2} />
      </div>

      {/* How this was generated */}
      <div className="mt-12 bg-surface-low p-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <p className="label text-[9px] mb-6">How This Brief Was Generated</p>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="font-headline text-xl font-bold text-ink mb-3">The Agent Loop</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              A Claude agent called {standup.tool_calls ?? 8} MCP tools across 3 servers
              (Task DB, Google Workspace, Git), analyzed the combined data for blockers,
              capacity issues, and dependency chains, then generated three audience-specific
              briefs in {runDuration ?? 45} seconds with zero human input.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <SourceRow label="Task Database" detail={`Identified ${standup.blockers_count} blockers and ${standup.at_risk_count} at-risk items`} />
              <SourceRow label="Google Drive" detail="Scanned file edits, comments, and design review activity" />
              <SourceRow label="Google Calendar" detail="Checked today and tomorrow for scheduling context" />
              <SourceRow label="GitHub" detail="Pulled recent commits and open PRs to detect stalled work" />
            </div>
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-ink mb-3">Audience Decisions</h3>
            <div className="flex flex-col gap-4">
              <DecisionBlock audience="Team Lead" items={['Included all assignee names', 'Listed every task status change', '@-mentioned blocked assignees']} />
              <DecisionBlock audience="Executive" items={['Omitted task-level noise', 'Flagged capacity risk by name', 'Included decision with suggested owner']} />
              <DecisionBlock audience="Client" items={['Removed all internal names', 'Converted blockers to milestone language', 'Framed delays as "monitoring timeline"']} />
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-10 text-center animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <p className="font-headline italic text-xl text-outline-variant/50 tracking-tight">
          Same data &middot; Three audiences &middot; One agent loop
        </p>
      </div>
    </div>
  )
}

function Pill({ variant, children }: { variant: 'error' | 'warn' | 'neutral' | 'muted'; children: React.ReactNode }) {
  const styles = {
    error: 'text-error bg-error/8',
    warn: 'text-secondary bg-chip/30',
    neutral: 'text-ink/50 bg-surface-highest/50',
    muted: 'text-outline bg-surface-low',
  }
  return <span className={`label text-[9px] px-3 py-1 ${styles[variant]}`}>{children}</span>
}

function BriefPanel({ audience, subtitle, content, accent, delay }: {
  audience: string; subtitle: string; content: string; accent: string; delay: number
}) {
  const barColor = accent === 'ink' ? 'bg-ink' : accent === 'secondary' ? 'bg-secondary' : 'bg-outline'

  const html = renderBriefContent(content)

  return (
    <div className="bg-surface-lowest flex flex-col animate-fade-up shadow-ambient" style={{ animationDelay: `${0.1 + delay * 0.08}s` }}>
      <div className={`h-[3px] ${barColor}`} />
      <div className="px-5 pt-4 pb-3 border-b border-outline-variant/10 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-ink">{audience}</h2>
          <p className="font-body text-[11px] text-outline mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div
        className="px-5 py-4 text-[13px] leading-relaxed text-on-surface-variant brief-render flex-1 overflow-y-auto max-h-[600px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

/**
 * Renders brief markdown into styled HTML.
 * Handles: section headers, status emoji → styled indicators, lists, bold, paragraphs.
 */
function renderBriefContent(raw: string): string {
  // Split into lines for precise control
  const lines = raw.split('\n')
  const out: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) { out.push('</div>'); inList = false }
      continue
    }

    // Title line (first bold line like **Meridian Platform Redesign — Daily Standup (Day 12)**)
    if (trimmed.match(/^\*\*.*—.*\*\*$/)) {
      // Skip — the page header already shows this info
      continue
    }

    // Section headers: **Completed:**, **In Progress:**, **Blockers:**, **At Risk:**, **Summary:**
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

      out.push(`<div class="mt-5 mb-2"><span class="inline-block label text-[9px] px-2 py-0.5 ${color}">${label.toUpperCase()}</span></div>`)

      // If rest has content on same line (e.g. "**Blockers:** None")
      if (rest && rest !== 'None') {
        out.push(`<p class="font-body text-[13px] text-on-surface-variant mb-1">${processBold(rest)}</p>`)
      } else if (rest === 'None') {
        out.push(`<p class="font-body text-[13px] text-outline-variant italic mb-1">None</p>`)
      }
      continue
    }

    // List items: - ✅/🔄/⚠️/🚨 task text
    if (trimmed.startsWith('- ')) {
      if (!inList) { out.push('<div class="flex flex-col gap-1.5 my-1">'); inList = true }

      let text = trimmed.slice(2).trim()
      let indicator = ''

      // Replace emoji with styled dots
      if (text.startsWith('✅')) {
        text = text.slice(1).trim()
        indicator = '<span class="w-1.5 h-1.5 bg-ink shrink-0 mt-[6px]"></span>'
      } else if (text.startsWith('🔄')) {
        text = text.slice(1).trim()
        indicator = '<span class="w-1.5 h-1.5 bg-secondary shrink-0 mt-[6px]"></span>'
      } else if (text.startsWith('⚠️')) {
        text = text.slice(1).trim()
        indicator = '<span class="w-1.5 h-1.5 bg-error/60 shrink-0 mt-[6px]"></span>'
      } else if (text.startsWith('🚨')) {
        text = text.slice(1).trim()
        indicator = '<span class="w-1.5 h-1.5 bg-error shrink-0 mt-[6px]"></span>'
      } else {
        indicator = '<span class="w-1.5 h-1.5 bg-outline-variant shrink-0 mt-[6px]"></span>'
      }

      out.push(`<div class="flex gap-2.5 items-start">${indicator}<span class="font-body text-[13px] text-on-surface-variant leading-snug">${processBold(text)}</span></div>`)
      continue
    }

    // Regular paragraph
    if (inList) { out.push('</div>'); inList = false }
    out.push(`<p class="font-body text-[13px] text-on-surface-variant leading-relaxed mb-2">${processBold(trimmed)}</p>`)
  }

  if (inList) out.push('</div>')
  return out.join('\n')
}

/** Process **bold** and *italic* markdown in inline text */
function processBold(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

function SourceRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="w-1.5 h-1.5 bg-ink mt-1.5 shrink-0" />
      <div>
        <span className="label text-[9px] text-ink block">{label}</span>
        <span className="font-body text-xs text-on-surface-variant">{detail}</span>
      </div>
    </div>
  )
}

function DecisionBlock({ audience, items }: { audience: string; items: string[] }) {
  return (
    <div className="bg-surface-highest/30 p-4">
      <span className="label text-[9px] text-ink block mb-2">{audience}</span>
      {items.map((d, i) => (
        <p key={i} className="font-body text-xs text-on-surface-variant">— {d}</p>
      ))}
    </div>
  )
}
