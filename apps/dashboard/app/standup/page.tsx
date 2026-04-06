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

  const statusMap: Record<string, any> = {}
  for (const s of taskStats) statusMap[s.status] = s

  const totalTasks = taskStats.reduce((sum: number, s: any) => sum + s.count, 0)
  const doneTasks = statusMap['done']?.count ?? 0
  const blockedTasks = statusMap['blocked']?.count ?? 0
  const inProgress = statusMap['in_progress']?.count ?? 0
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="label text-[9px] text-secondary italic">Case Study 01</p>
        <h1 className="font-headline text-4xl font-bold text-ink mt-1 tracking-tight">
          {project.name}
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-2">
          Automated daily standup briefs for three audience levels
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mt-10">
        <StatCard label="Progress" value={`${progressPct}%`} detail={`${doneTasks} of ${totalTasks} tasks`} />
        <StatCard label="In Flight" value={String(inProgress)} detail={`${blockedTasks} blocked`} danger={blockedTasks > 0} />
        <StatCard label="Agent Runs" value={String(runStats?.total_runs ?? 0)} detail={`${runStats?.successful ?? 0} successful`} />
        <StatCard label="Avg Cost" value={runStats?.avg_tokens ? `${(runStats.avg_tokens / 1000).toFixed(1)}k` : '—'} detail={`~${runStats?.avg_tool_calls ?? 0} tool calls/run`} />
      </div>

      {/* Architecture */}
      <div className="mt-10 bg-surface-low p-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <p className="label text-[9px] mb-6">Architecture</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {['Task DB', 'GitHub', 'Google Drive', 'Calendar'].map((src) => (
              <div key={src} className="bg-surface-highest/40 px-4 py-1.5">
                <span className="font-body text-xs text-on-surface-variant">{src}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="w-16 h-[1px] bg-ink" />
            <span className="label text-[8px]">MCP</span>
          </div>
          <div className="bg-ink text-on-ink px-6 py-4 text-center">
            <span className="font-headline text-base font-bold block">Claude Agent</span>
            <span className="font-body text-[9px] uppercase tracking-widest text-on-ink/60 mt-0.5 block">Analyze &middot; Generate</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="w-16 h-[1px] bg-ink" />
            <span className="label text-[8px]">3 BRIEFS</span>
          </div>
          <div className="flex flex-col gap-2">
            {['Team Lead', 'Executive', 'Client'].map((out) => (
              <div key={out} className="bg-surface-highest/40 px-4 py-1.5">
                <span className="font-body text-xs text-on-surface-variant">{out}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="font-body text-xs text-outline text-center mt-4">
          4 data sources &middot; ~{runStats?.avg_tool_calls ?? 8} tool calls &middot; ~{runStats?.avg_tokens ? (runStats.avg_tokens / 1000).toFixed(1) : '8'}k tokens &middot; ~45s &middot; ~$0.08/run
        </p>
      </div>

      {/* Workstreams + Blocker trend */}
      <div className="grid grid-cols-5 gap-5 mt-10">
        <div className="col-span-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <p className="label text-[9px] mb-4 pb-2 border-b border-outline-variant/10">Workstreams</p>
          <div className="space-y-4">
            {workstreamStats.map((ws: any) => {
              const pct = ws.total > 0 ? Math.round((ws.done / ws.total) * 100) : 0
              return (
                <div key={ws.workstream} className="bg-surface-low p-4 flex items-center gap-5">
                  <div className="w-28 shrink-0">
                    <h3 className="font-body text-sm font-medium text-ink">{ws.workstream}</h3>
                    <p className="font-body text-xs text-outline mt-0.5">{ws.done}/{ws.total} done</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-[2px] bg-outline-variant/20">
                      <div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="font-headline text-lg text-ink w-12 text-right">{pct}%</span>
                  {ws.blocked > 0 && (
                    <span className="label text-[9px] text-error shrink-0">{ws.blocked} BLOCKED</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-span-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <p className="label text-[9px] mb-4 pb-2 border-b border-outline-variant/10">Blocker Trend</p>
          <div className="bg-surface-low p-5 h-[calc(100%-2rem)]">
            <div className="flex items-end gap-[2px] h-28">
              {[...standups].reverse().map((s: any, i: number) => {
                const total = s.blockers_count + s.at_risk_count
                const h = Math.max(4, (total / 6) * 90)
                const isLatest = i === standups.length - 1
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full transition-all ${
                        total === 0 ? 'bg-surface-highest' : total <= 2 ? 'bg-on-surface/15' : 'bg-error/20'
                      } ${isLatest ? 'ring-1 ring-ink/30 ring-offset-1' : ''}`}
                      style={{ height: `${h}px` }}
                      title={`${formatMonthDay(s.date)}: ${s.blockers_count} blockers, ${s.at_risk_count} at risk`}
                    />
                    <span className="text-[8px] text-outline tabular-nums">{formatDay(s.date)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-outline-variant/10">
              <span className="flex items-center gap-1 text-[9px] text-outline"><span className="w-2.5 h-2 bg-surface-highest" /> Clean</span>
              <span className="flex items-center gap-1 text-[9px] text-outline"><span className="w-2.5 h-2 bg-on-surface/15" /> Minor</span>
              <span className="flex items-center gap-1 text-[9px] text-outline"><span className="w-2.5 h-2 bg-error/20" /> Elevated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Briefs */}
      <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/10">
          <p className="label text-[9px]">Recent Briefs</p>
          <Link href="/standup/history" className="label text-[9px] text-on-surface-variant hover:text-ink transition-colors">
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-0">
          {standups.slice(0, 7).map((s: any) => (
            <Link
              key={s.id}
              href={`/standup/briefs/${s.id}`}
              className="flex items-center justify-between py-3.5 px-4 -mx-4 hover:bg-surface-low transition-colors group"
            >
              <div className="flex items-center gap-4">
                <time className="font-body text-sm text-secondary tabular-nums w-32">
                  {formatShortDate(s.date)}
                </time>
                {s.blockers_count > 0 && <span className="label text-[9px] text-error">{s.blockers_count} BLOCKER{s.blockers_count !== 1 ? 'S' : ''}</span>}
                {s.at_risk_count > 0 && <span className="label text-[9px] text-secondary">{s.at_risk_count} AT RISK</span>}
                {s.blockers_count === 0 && s.at_risk_count === 0 && <span className="label text-[9px] text-outline-variant">CLEAN</span>}
              </div>
              <span className="font-body text-xs text-outline group-hover:text-ink transition-colors">View &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, detail, danger }: { label: string; value: string; detail: string; danger?: boolean }) {
  return (
    <div className={`p-5 animate-fade-up ${danger ? 'bg-error/5' : 'bg-surface-low'}`}>
      <p className="label text-[9px]">{label}</p>
      <p className={`font-headline text-3xl font-bold mt-1 ${danger ? 'text-error' : 'text-ink'}`}>{value}</p>
      <p className="font-body text-xs text-outline mt-1">{detail}</p>
    </div>
  )
}
