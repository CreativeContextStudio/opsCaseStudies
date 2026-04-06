import Link from 'next/link'
import { getSystemRunStats, getRecentStandups } from './lib/queries'
import { formatMonthDay } from './lib/format'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [runStats, recentStandups] = await Promise.all([
    getSystemRunStats(),
    getRecentStandups(3),
  ])

  return (
    <section className="max-w-5xl mx-auto px-12 pt-4 pb-24">
      {/* Masthead */}
      <div className="mb-32 animate-fade-up">
        <h1 className="font-headline text-8xl font-bold text-ink tracking-tight leading-[0.9]">
          Seven systems.<br />One architecture.
        </h1>
        <p className="font-body text-base text-on-surface-variant mt-8 max-w-lg leading-relaxed">
          Each module follows the same pattern: ingest data from project tools,
          classify and analyze with a Claude agent, deliver audience-specific
          outputs on schedule. No meetings. No manual reporting. No human in the loop.
        </p>
        <p className="label text-[9px] text-outline mt-4">
          A portfolio of agentic operations case studies by James Russell
        </p>
      </div>

      {/* Active Module */}
      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Active Modules</h2>
        <Link
          href="/standup"
          className="group block bg-surface-low p-12 hover:bg-surface-mid transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="label text-[9px] text-ink block mb-3">CASE STUDY 01</span>
              <h3 className="font-headline text-4xl font-bold text-ink tracking-tight">
                Project Standup
              </h3>
              <p className="font-body text-sm text-on-surface-variant mt-3 max-w-md leading-relaxed">
                Replaces daily standup meetings with an agentic pipeline. Pulls from
                task database, Git, Google Drive, and Calendar. Generates three
                audience-specific briefs — team lead, executive, client — in under a minute.
              </p>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-ink transition-colors text-3xl mt-2">
              chevron_right
            </span>
          </div>

          <div className="flex items-center gap-12 mt-10 pt-6 border-t border-outline-variant/10">
            <div>
              <span className="label block text-[9px] mb-1">Runs</span>
              <span className="font-headline text-3xl font-bold text-ink">{runStats?.total_runs ?? 0}</span>
            </div>
            <div>
              <span className="label block text-[9px] mb-1">Success</span>
              <span className="font-headline text-3xl font-bold text-ink">
                {runStats?.total_runs ? Math.round((runStats.successful / runStats.total_runs) * 100) : 0}%
              </span>
            </div>
            <div>
              <span className="label block text-[9px] mb-1">Latest</span>
              <span className="font-body text-sm text-secondary mt-1 block">
                {recentStandups[0] ? formatMonthDay(recentStandups[0].date) : '—'}
              </span>
            </div>
            <div>
              <span className="label block text-[9px] mb-1">Cost/Run</span>
              <span className="font-body text-sm text-secondary mt-1 block">~$0.08</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Coming Soon */}
      <div className="mt-6 grid grid-cols-3 gap-[1px] bg-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {['Market Intelligence', 'Campaign Ops', 'Client Intelligence', 'Regulatory Monitor', 'Incident Response', 'Content Localization'].map((name) => (
          <div key={name} className="bg-surface p-8">
            <span className="label text-[9px] text-outline-variant block mb-2">Coming Soon</span>
            <h4 className="font-headline text-lg text-outline-variant/60 italic">{name}</h4>
          </div>
        ))}
      </div>

      {/* Manual vs Automated */}
      <div className="mt-20 grid grid-cols-2 gap-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div>
          <h2 className="label mb-4 border-b border-outline-variant/10 pb-2">Manual Process</h2>
          <p className="font-headline text-5xl font-bold text-outline-variant/40 tracking-tighter">~2 hrs</p>
          <p className="font-body text-xs text-outline mt-2">
            Per standup. Meeting + notes + 3 separate write-ups for
            team, leadership, and client. Every day. Per project.
          </p>
        </div>
        <div>
          <h2 className="label mb-4 border-b border-outline-variant/10 pb-2">Agentic Process</h2>
          <p className="font-headline text-5xl font-bold text-ink tracking-tighter">45 sec</p>
          <p className="font-body text-xs text-outline mt-2">
            4 data sources queried, patterns analyzed, 3 briefs generated
            and delivered. {runStats?.avg_tokens ? (runStats.avg_tokens / 1000).toFixed(1) : '8'}k tokens. Zero human input.
          </p>
        </div>
      </div>
    </section>
  )
}
