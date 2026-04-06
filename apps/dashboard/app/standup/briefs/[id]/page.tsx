import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStandupById } from '../../../lib/queries'

export const dynamic = 'force-dynamic'

export default async function BriefView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const standup = await getStandupById(id)
  if (!standup) notFound()

  const dateStr = new Date(standup.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const runDuration = standup.started_at && standup.completed_at
    ? Math.round((new Date(standup.completed_at).getTime() - new Date(standup.started_at).getTime()) / 1000)
    : null

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/standup" className="text-xs font-medium text-sand-400 hover:text-amber-accent transition-colors">
          &larr; Back to overview
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-accent">
              {standup.project_name}
            </p>
            <h1 className="font-display text-3xl text-sand-900 mt-1">
              Daily Standup
            </h1>
            <p className="text-sand-500 mt-1 text-sm">{dateStr}</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-sand-400">
            {standup.blockers_count > 0 && (
              <span className="text-brick font-semibold bg-brick-light px-3 py-1 rounded-full text-[11px]">
                {standup.blockers_count} blocker{standup.blockers_count !== 1 ? 's' : ''}
              </span>
            )}
            {standup.at_risk_count > 0 && (
              <span className="text-rust font-semibold bg-amber-light px-3 py-1 rounded-full text-[11px]">
                {standup.at_risk_count} at risk
              </span>
            )}
            {runDuration && (
              <span className="font-mono">{runDuration}s runtime</span>
            )}
            {standup.token_count && (
              <span className="font-mono">{(standup.token_count / 1000).toFixed(1)}k tokens</span>
            )}
            {standup.tool_calls && (
              <span className="font-mono">{standup.tool_calls} tool calls</span>
            )}
          </div>
        </div>
      </div>

      {/* Three-panel brief comparison — the portfolio hero */}
      <div className="grid grid-cols-3 gap-5 mt-8">
        <BriefPanel
          audience="Team Lead"
          subtitle="Tactical, task-level, every blocker"
          content={standup.team_brief}
          accentColor="sage"
          delay={0}
        />
        <BriefPanel
          audience="Executive"
          subtitle="3-5 bullets, risks, decisions"
          content={standup.exec_brief}
          accentColor="amber"
          delay={1}
        />
        <BriefPanel
          audience="Client"
          subtitle="Narrative, milestones, no internals"
          content={standup.client_brief}
          accentColor="rust"
          delay={2}
        />
      </div>

      {/* Same data, three outputs callout */}
      <div className="mt-8 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-sand-400 italic">
          Same data. Three audiences. Three different briefs. Generated in one agent loop.
        </p>
      </div>
    </div>
  )
}

function BriefPanel({
  audience,
  subtitle,
  content,
  accentColor,
  delay,
}: {
  audience: string
  subtitle: string
  content: string
  accentColor: string
  delay: number
}) {
  const accentMap: Record<string, { border: string; badge: string; badgeText: string; topBar: string }> = {
    sage: {
      border: 'border-sage/20',
      badge: 'bg-sage-light',
      badgeText: 'text-sage',
      topBar: 'bg-sage',
    },
    amber: {
      border: 'border-amber-accent/20',
      badge: 'bg-amber-light',
      badgeText: 'text-amber-accent',
      topBar: 'bg-amber-accent',
    },
    rust: {
      border: 'border-rust/20',
      badge: 'bg-amber-light',
      badgeText: 'text-rust',
      topBar: 'bg-rust',
    },
  }

  const a = accentMap[accentColor] ?? accentMap.sage

  // Convert markdown-ish content to basic HTML
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/^(#{1,3}) (.*)/gm, (_, hashes: string, text: string) => {
      const level = hashes.length
      return `<h${level + 1} class="font-display text-sand-800 mt-4 mb-2 ${level === 1 ? 'text-lg' : 'text-base'}">${text}</h${level + 1}>`
    })
    .replace(/(<li>.*<\/li>\n?)+/g, (match: string) => `<ul class="space-y-1 my-2">${match}</ul>`)
    .split('\n\n')
    .map((p: string) => (p.startsWith('<') ? p : `<p class="mb-3">${p}</p>`))
    .join('')

  return (
    <div
      className={`rounded-xl border ${a.border} bg-white overflow-hidden flex flex-col animate-fade-up`}
      style={{ animationDelay: `${0.1 + delay * 0.1}s` }}
    >
      {/* Color top bar */}
      <div className={`h-1 ${a.topBar}`} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-sand-100">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-sand-800">{audience}</h2>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${a.badgeText} ${a.badge} px-2.5 py-1 rounded-full`}>
            {audience.split(' ')[0]}
          </span>
        </div>
        <p className="text-[11px] text-sand-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Content */}
      <div
        className="px-5 py-4 text-[13px] leading-relaxed text-sand-700 brief-content flex-1 overflow-y-auto max-h-[600px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
