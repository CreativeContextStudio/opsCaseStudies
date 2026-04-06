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
        <Link href="/standup" className="inline-flex items-center gap-1 text-xs font-medium text-sand-400 hover:text-amber-accent transition-colors">
          <span>&larr;</span> Back to overview
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-accent">
              {standup.project_name}
            </p>
            <h1 className="font-display text-3xl text-sand-900 mt-1">
              Daily Standup
            </h1>
            <p className="text-sand-500 mt-1">{formatLongDate(standup.date)}</p>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-3">
            {standup.blockers_count > 0 && (
              <Pill variant="danger">{standup.blockers_count} blocker{standup.blockers_count !== 1 ? 's' : ''}</Pill>
            )}
            {standup.at_risk_count > 0 && (
              <Pill variant="warning">{standup.at_risk_count} at risk</Pill>
            )}
            {standup.blockers_count === 0 && standup.at_risk_count === 0 && (
              <Pill variant="success">Clean</Pill>
            )}
            {runDuration != null && <Pill variant="muted">{runDuration}s</Pill>}
            {standup.token_count && <Pill variant="muted">{(standup.token_count / 1000).toFixed(1)}k tokens</Pill>}
            {standup.tool_calls && <Pill variant="muted">{standup.tool_calls} tools</Pill>}
          </div>
        </div>
      </div>

      {/* Three-panel brief comparison */}
      <div className="grid grid-cols-3 gap-5 mt-8">
        <BriefPanel
          audience="Team Lead"
          subtitle="Tactical detail — every task, every blocker, names and dates"
          content={standup.team_brief}
          accent="sage"
          delay={0}
        />
        <BriefPanel
          audience="Executive"
          subtitle="Summary — 3-5 bullets, risks flagged, decisions needed"
          content={standup.exec_brief}
          accent="amber"
          delay={1}
        />
        <BriefPanel
          audience="Client"
          subtitle="Narrative — milestone language, no internal names"
          content={standup.client_brief}
          accent="rust"
          delay={2}
        />
      </div>

      {/* Tagline */}
      <div className="mt-10 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <p className="inline-block text-sm text-sand-400 italic border-t border-b border-sand-200 py-3 px-8">
          Same data &middot; Three audiences &middot; One agent loop
        </p>
      </div>
    </div>
  )
}

function Pill({ variant, children }: { variant: 'danger' | 'warning' | 'success' | 'muted'; children: React.ReactNode }) {
  const styles = {
    danger: 'text-brick bg-brick-light',
    warning: 'text-rust bg-amber-light',
    success: 'text-sage bg-sage-light',
    muted: 'text-sand-500 bg-sand-100',
  }
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

function BriefPanel({ audience, subtitle, content, accent, delay }: {
  audience: string; subtitle: string; content: string; accent: string; delay: number
}) {
  const accents: Record<string, { bar: string; badge: string; badgeText: string; border: string }> = {
    sage: { bar: 'bg-sage', badge: 'bg-sage-light', badgeText: 'text-sage', border: 'border-sage/15' },
    amber: { bar: 'bg-amber-accent', badge: 'bg-amber-light', badgeText: 'text-amber-accent', border: 'border-amber-accent/15' },
    rust: { bar: 'bg-rust', badge: 'bg-amber-light', badgeText: 'text-rust', border: 'border-rust/15' },
  }
  const a = accents[accent] ?? accents.sage

  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/^(#{1,3}) (.*)/gm, (_: string, hashes: string, text: string) => {
      const lvl = hashes.length
      const size = lvl === 1 ? 'text-base' : 'text-sm'
      return `<h${lvl + 1} class="font-display text-sand-800 mt-4 mb-1.5 ${size}">${text}</h${lvl + 1}>`
    })
    .replace(/(<li>.*<\/li>\n?)+/g, (m: string) => `<ul class="space-y-0.5 my-2">${m}</ul>`)
    .split('\n\n')
    .map((p: string) => p.startsWith('<') ? p : `<p class="mb-2.5">${p}</p>`)
    .join('')

  return (
    <div
      className={`rounded-xl border ${a.border} bg-white overflow-hidden flex flex-col animate-fade-up`}
      style={{ animationDelay: `${0.1 + delay * 0.1}s` }}
    >
      <div className={`h-1 ${a.bar}`} />
      <div className="px-5 pt-4 pb-3 border-b border-sand-100 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-sand-800">{audience}</h2>
          <p className="text-[11px] text-sand-400 mt-0.5 max-w-[240px]">{subtitle}</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${a.badgeText} ${a.badge} px-2.5 py-1 rounded-full`}>
          {audience.split(' ')[0]}
        </span>
      </div>
      <div
        className="px-5 py-4 text-[13px] leading-relaxed text-sand-600 brief-content flex-1 overflow-y-auto max-h-[600px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
