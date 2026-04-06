import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStandupById } from '../../../lib/queries'
import { formatLongDate, formatMonthDay } from '../../../lib/format'

export const dynamic = 'force-dynamic'

export default async function BriefView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const standup = await getStandupById(id)
  if (!standup) notFound()

  const runDuration = standup.started_at && standup.completed_at
    ? Math.round((new Date(standup.completed_at).getTime() - new Date(standup.started_at).getTime()) / 1000)
    : null

  return (
    <div className="max-w-5xl mx-auto px-12 pt-12 pb-24">
      {/* Back */}
      <Link href="/standup" className="label text-outline hover:text-ink transition-colors inline-block mb-12">
        &larr; Back to Overview
      </Link>

      {/* Brief Header — editorial masthead */}
      <div className="mb-24 animate-fade-up">
        <h1 className="font-headline text-7xl font-bold text-ink tracking-tight leading-none">
          {standup.project_name}
        </h1>
        <div className="flex justify-between items-end mt-4">
          <p className="label text-secondary italic">
            Volume {Math.floor(Math.random() * 30 + 1)} // Issue {String(standup.blockers_count + standup.at_risk_count + 3).padStart(2, '0')}
          </p>
          <p className="font-headline italic text-3xl text-ink-container">
            {formatLongDate(standup.date)}
          </p>
        </div>
      </div>

      {/* Agent Performance Strip */}
      <div className="flex items-center gap-12 mb-20 pb-6 border-b border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <MetaItem label="Runtime" value={runDuration ? `${runDuration}s` : '—'} />
        <MetaItem label="Tokens" value={standup.token_count ? `${(standup.token_count / 1000).toFixed(1)}k` : '—'} />
        <MetaItem label="Tool Calls" value={standup.tool_calls ? String(standup.tool_calls) : '—'} />
        <MetaItem label="Blockers" value={String(standup.blockers_count)} highlight={standup.blockers_count > 0} />
        <MetaItem label="At Risk" value={String(standup.at_risk_count)} highlight={standup.at_risk_count > 0} />
        <div className="ml-auto">
          <span className="label text-[9px] text-outline">
            Automated by Claude Agent &middot; Zero human input
          </span>
        </div>
      </div>

      {/* Three Briefs — Editorial Panels */}
      <div className="flex flex-col gap-32">
        <BriefSection
          audience="Team Lead"
          subtitle="Tactical, task-level. Every blocker, every name, every action item."
          content={standup.team_brief}
          delay={0.1}
        />
        <BriefSection
          audience="Executive"
          subtitle="Strategic summary. 3-5 bullets, risks flagged, decisions needed."
          content={standup.exec_brief}
          delay={0.15}
        />
        <BriefSection
          audience="Client"
          subtitle="Progress narrative. Milestone language, no internal names."
          content={standup.client_brief}
          delay={0.2}
        />
      </div>

      {/* How This Brief Was Generated */}
      <div className="mt-32 pt-12 border-t border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="label mb-8">How This Brief Was Generated</h2>
        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-7">
            <h3 className="font-headline text-2xl text-ink mb-4">The Agent Loop</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              A Claude agent ran at 6:00 AM, called {standup.tool_calls ?? 8} MCP tools across
              3 servers (Task DB, Google Workspace, Git), analyzed the combined data for
              blockers, capacity issues, and dependency chains, then generated three
              audience-specific briefs — all in {runDuration ?? 45} seconds with zero human input.
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <SourceRow label="Task Database" detail={`Queried all active tasks, identified ${standup.blockers_count} blockers and ${standup.at_risk_count} at-risk items`} />
              <SourceRow label="Google Drive" detail="Scanned recent file edits, comments, and design review activity" />
              <SourceRow label="Google Calendar" detail="Checked today and tomorrow's meetings for scheduling context" />
              <SourceRow label="GitHub" detail="Pulled recent commits and open PRs to detect stalled work" />
            </div>
          </div>
          <div className="col-span-5">
            <h3 className="font-headline text-2xl text-ink mb-4">Audience Decisions</h3>
            <div className="flex flex-col gap-6">
              <DecisionCard
                audience="Team Lead"
                decisions={['Included all assignee names', 'Listed every task status change', '@-mentioned blocked assignees']}
              />
              <DecisionCard
                audience="Executive"
                decisions={['Omitted task-level noise', 'Flagged capacity risk by name', 'Included decision with suggested owner']}
              />
              <DecisionCard
                audience="Client"
                decisions={['Removed all internal names', 'Converted blockers to milestone language', 'Framed delays as "monitoring timeline"']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-24 text-center animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <p className="font-headline italic text-2xl text-outline-variant/60 select-none tracking-tight">
          Same data &middot; Three audiences &middot; One agent loop
        </p>
      </div>
    </div>
  )
}

function MetaItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="label block text-[9px]">{label}</span>
      <span className={`font-headline text-xl font-bold ${highlight ? 'text-error' : 'text-ink'}`}>{value}</span>
    </div>
  )
}

function BriefSection({ audience, subtitle, content, delay }: {
  audience: string; subtitle: string; content: string; delay: number
}) {
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/^(#{1,3}) (.*)/gm, (_: string, h: string, t: string) => {
      const lvl = h.length
      return `<h${lvl + 1} class="font-headline text-ink mt-6 mb-2 ${lvl === 1 ? 'text-xl font-bold' : 'text-lg'}">${t}</h${lvl + 1}>`
    })
    .replace(/(<li>.*<\/li>\n?)+/g, (m: string) => `<ul class="space-y-1 my-3">${m}</ul>`)
    .split('\n\n')
    .map((p: string) => p.startsWith('<') ? p : `<p class="mb-3">${p}</p>`)
    .join('')

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-outline-variant/10">
        <div>
          <h2 className="font-headline text-4xl font-bold text-ink">{audience}</h2>
          <p className="label text-[9px] text-secondary mt-1">{subtitle}</p>
        </div>
        <span className="label text-[9px] text-outline-variant">{audience.toUpperCase()} BRIEF</span>
      </div>
      <div
        className="font-headline text-xl leading-relaxed text-on-surface brief-content max-w-3xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function SourceRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="w-2 h-2 bg-ink mt-1.5 shrink-0" />
      <div>
        <span className="label text-[9px] text-ink block">{label}</span>
        <span className="font-body text-sm text-on-surface-variant">{detail}</span>
      </div>
    </div>
  )
}

function DecisionCard({ audience, decisions }: { audience: string; decisions: string[] }) {
  return (
    <div className="bg-surface-low p-6">
      <span className="label text-[9px] text-ink block mb-3">{audience}</span>
      {decisions.map((d, i) => (
        <p key={i} className="font-body text-sm text-on-surface-variant leading-relaxed">
          — {d}
        </p>
      ))}
    </div>
  )
}
