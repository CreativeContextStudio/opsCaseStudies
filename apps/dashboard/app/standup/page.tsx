import Link from 'next/link'
import { getRecentStandups, getActiveProject, getTaskStats, getWorkstreamStats, getSystemRunStats } from '../lib/queries'

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
        <p className="text-sand-500 mt-2 text-sm">
          Automated daily standup briefs for three audience levels
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mt-10">
        <StatCard
          label="Progress"
          value={`${progressPct}%`}
          detail={`${doneTasks} of ${totalTasks} tasks complete`}
          style={0}
        />
        <StatCard
          label="Blockers"
          value={String(blockedTasks)}
          detail={latestStandup ? `${latestStandup.at_risk_count} at risk` : 'No data'}
          style={blockedTasks > 0 ? 2 : 1}
        />
        <StatCard
          label="System Runs"
          value={String(runStats?.total_runs ?? 0)}
          detail={`${runStats?.successful ?? 0} successful`}
          style={1}
        />
        <StatCard
          label="Avg Tokens/Run"
          value={runStats?.avg_tokens ? `${(runStats.avg_tokens / 1000).toFixed(1)}k` : '—'}
          detail={`~${runStats?.avg_tool_calls ?? 0} tool calls`}
          style={1}
        />
      </div>

      {/* Workstreams */}
      <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="font-display text-xl text-sand-800">Workstreams</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {workstreamStats.map((ws: any) => {
            const pct = ws.total > 0 ? Math.round((ws.done / ws.total) * 100) : 0
            return (
              <div key={ws.workstream} className="rounded-xl border border-sand-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-sand-700">{ws.workstream}</h3>
                  {ws.blocked > 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brick bg-brick-light px-2 py-0.5 rounded-full">
                      {ws.blocked} blocked
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="font-display text-2xl text-sand-800">{pct}%</span>
                  <span className="text-xs text-sand-400 mb-1">{ws.done}/{ws.total} tasks</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-sand-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Blocker trend */}
      <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="font-display text-xl text-sand-800">Blocker Trend</h2>
        <div className="mt-4 rounded-xl border border-sand-200 bg-white p-5">
          <div className="flex items-end gap-1 h-24">
            {[...standups].reverse().map((s: any, i: number) => {
              const total = s.blockers_count + s.at_risk_count
              const maxH = 80
              const h = Math.max(4, (total / 6) * maxH)
              const isToday = i === standups.length - 1
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full max-w-[28px] rounded-t transition-all ${
                      total === 0
                        ? 'bg-sage/30'
                        : total <= 2
                          ? 'bg-amber-light'
                          : 'bg-brick-light'
                    } ${isToday ? 'ring-2 ring-amber-accent/40' : ''}`}
                    style={{ height: `${h}px` }}
                    title={`${new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${s.blockers_count} blockers, ${s.at_risk_count} at risk`}
                  />
                  <span className="text-[9px] text-sand-400">
                    {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-sand-100">
            <span className="flex items-center gap-1.5 text-[10px] text-sand-400">
              <span className="w-2.5 h-2.5 rounded bg-sage/30" /> Clean
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-sand-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-light" /> Minor
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-sand-400">
              <span className="w-2.5 h-2.5 rounded bg-brick-light" /> Elevated
            </span>
          </div>
        </div>
      </div>

      {/* Recent briefs */}
      <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-sand-800">Recent Briefs</h2>
          <Link href="/standup/history" className="text-xs font-medium text-amber-accent hover:underline">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {standups.slice(0, 7).map((s: any) => (
            <Link
              key={s.id}
              href={`/standup/briefs/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-sand-200 bg-white px-5 py-3.5 hover:border-sand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <time className="text-sm font-mono text-sand-500 w-28">
                  {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </time>
                <div className="flex items-center gap-2">
                  {s.blockers_count > 0 && (
                    <span className="text-[10px] font-semibold text-brick bg-brick-light px-2 py-0.5 rounded-full">
                      {s.blockers_count} blocker{s.blockers_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {s.at_risk_count > 0 && (
                    <span className="text-[10px] font-semibold text-rust bg-amber-light px-2 py-0.5 rounded-full">
                      {s.at_risk_count} at risk
                    </span>
                  )}
                  {s.blockers_count === 0 && s.at_risk_count === 0 && (
                    <span className="text-[10px] font-semibold text-sage bg-sage-light px-2 py-0.5 rounded-full">
                      Clean
                    </span>
                  )}
                </div>
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

function StatCard({ label, value, detail, style }: { label: string; value: string; detail: string; style: number }) {
  const border = style === 2 ? 'border-brick/20 bg-brick-light/30' : 'border-sand-200 bg-white'
  return (
    <div className={`rounded-xl border p-5 ${border} animate-fade-up`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">{label}</p>
      <p className="font-display text-3xl text-sand-800 mt-1">{value}</p>
      <p className="text-xs text-sand-500 mt-1">{detail}</p>
    </div>
  )
}
