import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStandupById } from '../../../lib/queries'
import { formatLongDate } from '../../../lib/format'
import BriefTabs from './brief-tabs'

export const dynamic = 'force-dynamic'

export default async function BriefView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const standup = await getStandupById(id)
  if (!standup) notFound()

  const runDuration = standup.started_at && standup.completed_at
    ? Math.round((new Date(standup.completed_at).getTime() - new Date(standup.started_at).getTime()) / 1000)
    : null

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
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

      {/* Tabbed brief view */}
      <div className="mt-8">
        <BriefTabs
          teamBrief={standup.team_brief}
          execBrief={standup.exec_brief}
          clientBrief={standup.client_brief}
        />
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
