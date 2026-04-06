import Link from 'next/link'
import { getSystemRunStats, getRecentStandups } from './lib/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [runStats, recentStandups] = await Promise.all([
    getSystemRunStats(),
    getRecentStandups(3),
  ])

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-accent">
          Agentic Operations Platform
        </p>
        <h1 className="font-display text-5xl text-sand-900 mt-2 leading-tight">
          Seven systems.<br />One architecture.
        </h1>
        <p className="text-sand-500 mt-4 text-base max-w-lg leading-relaxed">
          Each module follows the same pattern: ingest data from project tools,
          classify and analyze with Claude, deliver audience-specific outputs on schedule.
        </p>
      </div>

      {/* Module card */}
      <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <Link
          href="/standup"
          className="block rounded-2xl border border-sand-200 bg-white p-8 hover:border-sand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sage bg-sage-light px-2.5 py-1 rounded-full">
                Active
              </span>
              <h2 className="font-display text-2xl text-sand-800 mt-3">
                Project Standup
              </h2>
              <p className="text-sm text-sand-500 mt-1 max-w-md">
                Replaces daily standup meetings. Pulls from project tools, identifies blockers,
                delivers three audience-specific briefs.
              </p>
            </div>
            <span className="text-sand-300 group-hover:text-amber-accent transition-colors text-2xl">
              &rarr;
            </span>
          </div>

          <div className="flex items-center gap-8 mt-6 pt-5 border-t border-sand-100">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Runs</p>
              <p className="font-display text-xl text-sand-700 mt-0.5">{runStats?.total_runs ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Success Rate</p>
              <p className="font-display text-xl text-sand-700 mt-0.5">
                {runStats?.total_runs ? Math.round((runStats.successful / runStats.total_runs) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Latest</p>
              <p className="font-mono text-sm text-sand-500 mt-1">
                {recentStandups[0]
                  ? new Date(recentStandups[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Coming soon modules */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {['Market Intelligence', 'Campaign Ops', 'Client Intelligence', 'Regulatory Monitor', 'Incident Response', 'Content Localization'].map((name) => (
          <div key={name} className="rounded-xl border border-sand-100 border-dashed p-5 opacity-40">
            <h3 className="text-sm font-medium text-sand-500">{name}</h3>
            <p className="text-[10px] text-sand-400 mt-1">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
