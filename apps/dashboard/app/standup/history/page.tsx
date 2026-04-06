import Link from 'next/link'
import { getRecentStandups } from '../../lib/queries'
import { formatShortDate, parseDate } from '../../lib/format'

export const dynamic = 'force-dynamic'

// Narrative arc labels based on the 14-day seed data story
function getArcLabel(date: Date, index: number, total: number): string | null {
  const dayFromEnd = total - 1 - index
  if (dayFromEnd >= 9) return 'Smooth Sailing'
  if (dayFromEnd >= 6) return 'Cracks Appear'
  if (dayFromEnd >= 3) return 'Cascade'
  if (dayFromEnd >= 0) return 'Recovery'
  return null
}

function getArcLabelColor(label: string): string {
  switch (label) {
    case 'Smooth Sailing': return 'text-ink/40'
    case 'Cracks Appear': return 'text-secondary'
    case 'Cascade': return 'text-error'
    case 'Recovery': return 'text-ink'
    default: return 'text-outline'
  }
}

export default async function StandupHistory() {
  const standups = await getRecentStandups(30)

  let lastArc = ''

  return (
    <section className="max-w-5xl mx-auto px-12 pt-4 pb-24">
      <div className="animate-fade-up">
        <Link href="/standup" className="label text-outline hover:text-ink transition-colors inline-block mb-12">
          &larr; Back to Overview
        </Link>
        <h1 className="font-headline text-5xl font-bold text-ink tracking-tight">Archive</h1>
        <p className="font-body text-sm text-on-surface-variant mt-3 max-w-lg leading-relaxed">
          Every automated standup run. The narrative arc tells its own story —
          smooth sailing, then friction, then a cascade of dependencies, then recovery.
        </p>
      </div>

      {/* Timeline */}
      <div className="mt-16 relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Vertical timeline line */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-outline-variant/20" />

        <div className="flex flex-col">
          {standups.map((s: any, i: number) => {
            const arcLabel = getArcLabel(parseDate(s.date), i, standups.length)
            const showArcLabel = arcLabel && arcLabel !== lastArc
            if (arcLabel) lastArc = arcLabel

            return (
              <div key={s.id}>
                {/* Arc annotation */}
                {showArcLabel && (
                  <div className="pl-8 py-4">
                    <span className={`font-headline italic text-lg ${getArcLabelColor(arcLabel!)}`}>
                      {arcLabel}
                    </span>
                  </div>
                )}

                <Link
                  href={`/standup/briefs/${s.id}`}
                  className="group flex items-start gap-8 pl-8 py-5 hover:bg-surface-low transition-colors relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-[-3px] top-7 w-[7px] h-[7px] ${
                    s.blockers_count > 0 ? 'bg-error' : s.at_risk_count > 0 ? 'bg-secondary' : 'bg-ink'
                  }`} />

                  {/* Date */}
                  <time className="font-body text-sm text-secondary tabular-nums w-36 shrink-0 pt-0.5">
                    {formatShortDate(s.date)}
                  </time>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      {s.blockers_count > 0 && (
                        <span className="label text-[9px] text-error">{s.blockers_count} BLOCKER{s.blockers_count !== 1 ? 'S' : ''}</span>
                      )}
                      {s.at_risk_count > 0 && (
                        <span className="label text-[9px] text-secondary">{s.at_risk_count} AT RISK</span>
                      )}
                      {s.blockers_count === 0 && s.at_risk_count === 0 && (
                        <span className="label text-[9px] text-outline-variant">CLEAN</span>
                      )}
                      <span className={`inline-flex items-center gap-1 label text-[9px] ${
                        s.run_status === 'success' ? 'text-ink/40' : 'text-error'
                      }`}>
                        <span className={`w-1 h-1 ${s.run_status === 'success' ? 'bg-ink/40' : 'bg-error'}`} />
                        {s.run_status}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="font-body text-xs text-outline tabular-nums">
                      {s.token_count ? `${(s.token_count / 1000).toFixed(1)}k` : '—'}
                    </span>
                    <span className="font-body text-xs text-outline tabular-nums">
                      {s.tool_calls ?? '—'} tools
                    </span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-ink transition-colors text-[16px]">
                      chevron_right
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
