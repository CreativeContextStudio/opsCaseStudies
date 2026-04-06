import Link from 'next/link'
import { getRecentStandups, getActiveProject, getTaskStats, getWorkstreamStats, getSystemRunStats } from '../lib/queries'
import { formatShortDate, formatDay, formatMonthDay } from '../lib/format'

export const dynamic = 'force-dynamic'

export default async function StandupOverview() {
  const [project, standups, runStats] = await Promise.all([
    getActiveProject(),
    getRecentStandups(14),
    getSystemRunStats(),
  ])

  if (!project) {
    return <div className="p-12 text-outline">No active project found.</div>
  }

  const [taskStats, workstreamStats] = await Promise.all([
    getTaskStats(project.id),
    getWorkstreamStats(project.id),
  ])

  const latestStandup = standups[0]
  const statusMap: Record<string, any> = {}
  for (const s of taskStats) statusMap[s.status] = s

  const totalTasks = taskStats.reduce((sum: number, s: any) => sum + s.count, 0)
  const doneTasks = statusMap['done']?.count ?? 0
  const blockedTasks = statusMap['blocked']?.count ?? 0
  const inProgress = statusMap['in_progress']?.count ?? 0
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <section className="max-w-5xl mx-auto px-12 pt-4 pb-24">
      {/* Header */}
      <div className="mb-20 animate-fade-up">
        <p className="label text-secondary italic mb-2">Case Study 01</p>
        <h1 className="font-headline text-6xl font-bold text-ink tracking-tight leading-none">
          {project.name}
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-4 max-w-xl leading-relaxed">
          Automated standup briefs generated daily by a Claude agent. Three audiences,
          three tones, zero meetings. Every brief below was written by an agent loop
          pulling from 6 data sources.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="flex items-end gap-16 mb-20 pb-8 border-b border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div>
          <span className="label block text-[9px] mb-1">Progress</span>
          <span className="font-headline text-6xl font-bold text-ink tracking-tighter">{progressPct}%</span>
          <span className="font-body text-xs text-secondary ml-2 uppercase tracking-widest">complete</span>
        </div>
        <StatItem label="Tasks" value={String(totalTasks)} />
        <StatItem label="In Flight" value={String(inProgress)} />
        <StatItem label="Blocked" value={String(blockedTasks)} highlight={blockedTasks > 0} />
        <StatItem label="Agent Runs" value={String(runStats?.total_runs ?? 0)} />
        <StatItem label="Avg Tokens" value={runStats?.avg_tokens ? `${(runStats.avg_tokens / 1000).toFixed(1)}k` : '—'} />
      </div>

      {/* Architecture — the storytelling section */}
      <div className="mb-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Architecture</h2>
        <div className="flex items-center justify-between gap-4 py-8">
          {/* Data Sources */}
          <div className="flex flex-col gap-3">
            {['Task DB', 'GitHub', 'Google Drive', 'Calendar'].map((src) => (
              <div key={src} className="bg-surface-highest/40 px-4 py-2">
                <span className="font-body text-xs text-on-surface-variant">{src}</span>
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 px-6">
            <div className="w-24 h-[1px] bg-ink" />
            <span className="label text-[8px] text-outline">MCP TOOLS</span>
          </div>
          {/* Agent */}
          <div className="bg-ink text-on-ink px-8 py-6 text-center">
            <span className="font-headline text-lg font-bold block">Claude Agent</span>
            <span className="font-body text-[10px] uppercase tracking-widest text-on-ink/60 block mt-1">
              Analyze &middot; Classify &middot; Generate
            </span>
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 px-6">
            <div className="w-24 h-[1px] bg-ink" />
            <span className="label text-[8px] text-outline">3 BRIEFS</span>
          </div>
          {/* Outputs */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Team Lead</span>
            </div>
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Executive</span>
            </div>
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Client</span>
            </div>
          </div>
        </div>
        <p className="font-body text-xs text-outline text-center mt-2">
          4 data sources &middot; {runStats?.avg_tool_calls ?? 8} tool calls &middot; ~{runStats?.avg_tokens ? (runStats.avg_tokens / 1000).toFixed(1) : '8'}k tokens &middot; ~45 seconds &middot; ~$0.08/run
        </p>
      </div>

      {/* Workstreams + Blocker Trend */}
      <div className="grid grid-cols-12 gap-16 mb-20">
        {/* Workstreams — 7 cols */}
        <div className="col-span-7 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Workstreams</h2>
          <div className="flex flex-col gap-8">
            {workstreamStats.map((ws: any) => {
              const pct = ws.total > 0 ? Math.round((ws.done / ws.total) * 100) : 0
              return (
                <div key={ws.workstream}>
                  <div className="flex justify-between font-body text-[10px] uppercase tracking-wider text-on-surface mb-2">
                    <span>{ws.workstream} {ws.blocked > 0 && <span className="text-error font-bold ml-2">{ws.blocked} BLOCKED</span>}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-[2px] bg-outline-variant/20">
                    <div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="font-body text-[10px] text-outline mt-1">{ws.done} of {ws.total} tasks complete</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Blocker Trend — 5 cols */}
        <div className="col-span-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Blocker Trend</h2>
          <div className="flex items-end gap-[2px] h-32">
            {[...standups].reverse().map((s: any, i: number) => {
              const total = s.blockers_count + s.at_risk_count
              const h = Math.max(4, (total / 6) * 100)
              const isLatest = i === standups.length - 1
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full transition-all ${
                      total === 0 ? 'bg-surface-highest/60' : total <= 2 ? 'bg-on-surface/15' : 'bg-error/20'
                    } ${isLatest ? 'ring-1 ring-ink/30 ring-offset-1' : ''}`}
                    style={{ height: `${h}px` }}
                    title={`${formatMonthDay(s.date)}: ${s.blockers_count} blockers, ${s.at_risk_count} at risk`}
                  />
                  <span className="text-[8px] text-outline tabular-nums">{formatDay(s.date)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-[9px] text-outline"><span className="w-3 h-2 bg-surface-highest/60" /> Clean</span>
            <span className="flex items-center gap-1.5 text-[9px] text-outline"><span className="w-3 h-2 bg-on-surface/15" /> Minor</span>
            <span className="flex items-center gap-1.5 text-[9px] text-outline"><span className="w-3 h-2 bg-error/20" /> Elevated</span>
          </div>
        </div>
      </div>

      {/* Recent Briefs */}
      <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-end justify-between mb-6 border-b border-outline-variant/10 pb-2">
          <h2 className="label">Recent Briefs</h2>
          <Link href="/standup/history" className="label text-[9px] text-on-surface-variant hover:text-ink transition-colors">
            Full Archive &rarr;
          </Link>
        </div>
        <div className="flex flex-col">
          {standups.slice(0, 7).map((s: any) => (
            <Link
              key={s.id}
              href={`/standup/briefs/${s.id}`}
              className="group flex items-center justify-between py-4 hover:bg-surface-low transition-colors px-4 -mx-4"
            >
              <div className="flex items-center gap-6">
                <time className="font-body text-sm text-secondary tabular-nums w-32">
                  {formatShortDate(s.date)}
                </time>
                {s.blockers_count > 0 && (
                  <span className="label text-[9px] text-error">{s.blockers_count} BLOCKER{s.blockers_count !== 1 ? 'S' : ''}</span>
                )}
                {s.at_risk_count > 0 && (
                  <span className="label text-[9px] text-secondary">{s.at_risk_count} AT RISK</span>
                )}
                {s.blockers_count === 0 && s.at_risk_count === 0 && (
                  <span className="label text-[9px] text-outline-variant">CLEAN</span>
                )}
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-ink transition-colors text-[18px]">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="label block text-[9px] mb-1">{label}</span>
      <span className={`font-headline text-2xl font-bold ${highlight ? 'text-error' : 'text-ink'}`}>{value}</span>
    </div>
  )
}
