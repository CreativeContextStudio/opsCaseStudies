import Link from 'next/link'
import { getSystemRunStats, getRecentStandups, getIngestionStats, getRecentBriefings } from './lib/queries'
import { formatMonthDay } from './lib/format'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [runStats, recentStandups, marketRunStats, marketStats, marketBriefings] = await Promise.all([
    getSystemRunStats(),
    getRecentStandups(3),
    getSystemRunStats('market'),
    getIngestionStats(),
    getRecentBriefings(1),
  ])

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="animate-fade-up">
        <p className="label text-[9px] text-outline mb-2">Agentic Operations Platform</p>
        <h1 className="font-headline text-5xl font-bold text-ink leading-tight tracking-tight">
          Seven systems.<br />One architecture.
        </h1>
        <p className="font-body text-on-surface-variant mt-4 text-base max-w-lg leading-relaxed">
          Each module follows the same pattern: ingest data from project tools,
          classify and analyze with Claude, deliver audience-specific outputs on schedule.
        </p>
        <p className="label text-[9px] text-outline mt-3">
          A portfolio of agentic operations case studies by James Russell
        </p>
      </div>

      {/* Active module card */}
      <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <Link
          href="/standup"
          className="block bg-surface-low p-8 hover:bg-surface-mid transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="label text-[9px] text-ink">Active</span>
              <h2 className="font-headline text-2xl font-bold text-ink mt-2">
                Project Standup
              </h2>
              <p className="font-body text-sm text-on-surface-variant mt-1 max-w-md">
                Replaces daily standup meetings. Pulls from project tools, identifies blockers,
                delivers three audience-specific briefs.
              </p>
            </div>
            <span className="text-outline group-hover:text-ink transition-colors text-2xl">&rarr;</span>
          </div>

          <div className="flex items-center gap-8 mt-6 pt-5 border-t border-outline-variant/10">
            <MiniStat label="Runs" value={String(runStats?.total_runs ?? 0)} />
            <MiniStat label="Success" value={`${runStats?.total_runs ? Math.round((runStats.successful / runStats.total_runs) * 100) : 0}%`} />
            <MiniStat label="Latest" value={recentStandups[0] ? formatMonthDay(recentStandups[0].date) : '—'} />
            <MiniStat label="Cost/Run" value="~$0.08" />
          </div>
        </Link>
      </div>

      {/* Market Intelligence — Active */}
      {marketRunStats?.total_runs > 0 && (
        <div className="mt-4 animate-fade-up" style={{ animationDelay: '0.12s' }}>
          <Link
            href="/market"
            className="block bg-surface-low p-8 hover:bg-surface-mid transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="label text-[9px] text-ink">Active</span>
                <h2 className="font-headline text-2xl font-bold text-ink mt-2">
                  Market Intelligence
                </h2>
                <p className="font-body text-sm text-on-surface-variant mt-1 max-w-md">
                  Monitors 200+ financial sources overnight, scores for relevance, and delivers
                  a sector-specific briefing before market open.
                </p>
              </div>
              <span className="text-outline group-hover:text-ink transition-colors text-2xl">&rarr;</span>
            </div>

            <div className="flex items-center gap-8 mt-6 pt-5 border-t border-outline-variant/10">
              <MiniStat label="Runs" value={String(marketRunStats?.total_runs ?? 0)} />
              <MiniStat label="Items Scanned" value={marketStats?.total_items ? marketStats.total_items.toLocaleString() : '—'} />
              <MiniStat label="Signals" value={String(marketStats?.included_items ?? 0)} />
              <MiniStat label="Latest" value={marketBriefings[0] ? formatMonthDay(marketBriefings[0].date) : '—'} />
            </div>
          </Link>
        </div>
      )}

      {/* Coming soon */}
      <div className="grid grid-cols-3 gap-[1px] bg-outline-variant/10 mt-4">
        {[
          ...(marketRunStats?.total_runs > 0 ? [] : ['Market Intelligence']),
          'Campaign Ops', 'Client Intelligence', 'Regulatory Monitor', 'Incident Response', 'Content Localization',
        ].map((name) => (
          <div key={name} className="bg-surface p-5">
            <h3 className="font-body text-sm text-outline-variant/50">{name}</h3>
            <p className="label text-[8px] text-outline-variant/40 mt-1">Coming soon</p>
          </div>
        ))}
      </div>

      {/* Manual vs Automated */}
      <div className="mt-16 grid grid-cols-2 gap-16 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div>
          <p className="label text-[9px] mb-3 pb-2 border-b border-outline-variant/10">Manual Process</p>
          <p className="font-headline text-4xl font-bold text-outline-variant/30 tracking-tighter">~2 hrs</p>
          <p className="font-body text-xs text-outline mt-2">Meeting + notes + 3 separate write-ups. Every day. Per project.</p>
        </div>
        <div>
          <p className="label text-[9px] mb-3 pb-2 border-b border-outline-variant/10">Agentic Process</p>
          <p className="font-headline text-4xl font-bold text-ink tracking-tighter">45 sec</p>
          <p className="font-body text-xs text-outline mt-2">4 data sources, patterns analyzed, 3 briefs delivered. Zero human input.</p>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label text-[9px]">{label}</p>
      <p className="font-headline text-xl font-bold text-ink mt-0.5">{value}</p>
    </div>
  )
}
