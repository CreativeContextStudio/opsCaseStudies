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
    return <div className="p-12 text-sand-500">No active project found.</div>
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
  const inProgressTasks = statusMap['in_progress']?.count ?? 0
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-accent">
          Case Study 01
        </p>
        <h1 className="font-display text-4xl text-sand-900 mt-1">
          {project.name}
        </h1>
        <p className="text-sand-500 mt-2 text-[15px]">
          Automated daily standup briefs for three audience levels — team lead, executive, and client.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mt-10">
        <StatCard label="Progress" value={`${progressPct}%`} detail={`${doneTasks} of ${totalTasks} tasks`} variant="default" delay={0} />
        <StatCard label="In Flight" value={String(inProgressTasks)} detail={`${blockedTasks} blocked`} variant={blockedTasks > 0 ? 'danger' : 'default'} delay={1} />
        <StatCard label="Agent Runs" value={String(runStats?.total_runs ?? 0)} detail={`${runStats?.successful ?? 0} successful`} variant="default" delay={2} />
        <StatCard label="Avg Cost" value={runStats?.avg_tokens ? `${(runStats.avg_tokens / 1000).toFixed(1)}k` : '—'} detail={`~${runStats?.avg_tool_calls ?? 0} tool calls/run`} variant="default" delay={3} />
      </div>

      {/* Workstreams + Trend side by side */}
      <div className="grid grid-cols-5 gap-5 mt-10">
        {/* Workstreams — 3 cols */}
        <div className="col-span-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-xl text-sand-800 mb-4">Workstreams</h2>
          <div className="space-y-3">
            {workstreamStats.map((ws: any) => {
              const pct = ws.total > 0 ? Math.round((ws.done / ws.total) * 100) : 0
              return (
                <div key={ws.workstream} className="rounded-xl border border-sand-200 bg-white p-4 flex items-center gap-5">
                  <div className="w-28 shrink-0">
                    <h3 className="text-sm font-medium text-sand-700">{ws.workstream}</h3>
                    <p className="text-xs text-sand-400 mt-0.5">{ws.done}/{ws.total} done</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-sand-100 overflow-hidden">
                      <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="font-display text-lg text-sand-700 w-12 text-right">{pct}%</span>
                  {ws.blocked > 0 && (
                    <span className="text-[10px] font-semibold text-brick bg-brick-light px-2 py-0.5 rounded-full shrink-0">
                      {ws.blocked} blocked
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Blocker trend — 2 cols */}
        <div className="col-span-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-display text-xl text-sand-800 mb-4">Blocker Trend</h2>
          <div className="rounded-xl border border-sand-200 bg-white p-5 h-[calc(100%-2rem)]">
            <div className="flex items-end gap-[3px] h-28">
              {[...standups].reverse().map((s: any, i: number) => {
                const total = s.blockers_count + s.at_risk_count
                const h = Math.max(6, (total / 6) * 90)
                const isLatest = i === standups.length - 1
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        total === 0 ? 'bg-sage/20' : total <= 2 ? 'bg-amber-accent/25' : 'bg-brick/25'
                      } ${isLatest ? 'ring-1 ring-amber-accent/50 ring-offset-1' : ''}`}
                      style={{ height: `${h}px` }}
                      title={`${formatMonthDay(s.date)}: ${s.blockers_count} blockers, ${s.at_risk_count} at risk`}
                    />
                    <span className="text-[8px] text-sand-400 tabular-nums">{formatDay(s.date)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-sand-100">
              <Legend color="bg-sage/20" label="Clean" />
              <Legend color="bg-amber-accent/25" label="Minor" />
              <Legend color="bg-brick/25" label="Elevated" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent briefs */}
      <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-sand-800">Recent Briefs</h2>
          <Link href="/standup/history" className="text-xs font-medium text-amber-accent hover:underline">
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-2">
          {standups.slice(0, 7).map((s: any) => (
            <Link
              key={s.id}
              href={`/standup/briefs/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-sand-200 bg-white px-5 py-3.5 hover:border-sand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <time className="text-sm font-mono text-sand-500 w-32 tabular-nums">
                  {formatShortDate(s.date)}
                </time>
                <StatusBadges blockers={s.blockers_count} atRisk={s.at_risk_count} />
              </div>
              <span className="text-xs text-sand-400 group-hover:text-amber-accent transition-colors">
                View briefs &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, detail, variant, delay }: {
  label: string; value: string; detail: string; variant: string; delay: number
}) {
  const style = variant === 'danger' ? 'border-brick/20 bg-brick-light/30' : 'border-sand-200 bg-white'
  return (
    <div className={`rounded-xl border p-5 ${style} animate-fade-up`} style={{ animationDelay: `${delay * 0.05}s` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">{label}</p>
      <p className="font-display text-3xl text-sand-800 mt-1">{value}</p>
      <p className="text-xs text-sand-500 mt-1">{detail}</p>
    </div>
  )
}

function StatusBadges({ blockers, atRisk }: { blockers: number; atRisk: number }) {
  return (
    <div className="flex items-center gap-2">
      {blockers > 0 && (
        <span className="text-[10px] font-semibold text-brick bg-brick-light px-2 py-0.5 rounded-full">
          {blockers} blocker{blockers !== 1 ? 's' : ''}
        </span>
      )}
      {atRisk > 0 && (
        <span className="text-[10px] font-semibold text-rust bg-amber-light px-2 py-0.5 rounded-full">
          {atRisk} at risk
        </span>
      )}
      {blockers === 0 && atRisk === 0 && (
        <span className="text-[10px] font-semibold text-sage bg-sage-light px-2 py-0.5 rounded-full">
          Clean
        </span>
      )}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-sand-400">
      <span className={`w-2.5 h-2.5 rounded ${color}`} /> {label}
    </span>
  )
}
