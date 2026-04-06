import Link from 'next/link'
import { getRecentStandups } from '../../lib/queries'
import { formatShortDate } from '../../lib/format'

export const dynamic = 'force-dynamic'

export default async function StandupHistory() {
  const standups = await getRecentStandups(30)

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="animate-fade-up">
        <Link href="/standup" className="inline-flex items-center gap-1 text-xs font-medium text-sand-400 hover:text-amber-accent transition-colors">
          <span>&larr;</span> Back to overview
        </Link>
        <h1 className="font-display text-3xl text-sand-900 mt-4">Run History</h1>
        <p className="text-sand-500 mt-1 text-[15px]">
          Every automated standup run with performance metrics and blocker counts.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-sand-200 bg-white overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Date</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Status</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Blockers</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">At Risk</th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Tokens</th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">Tools</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {standups.map((s: any, i: number) => (
              <tr
                key={s.id}
                className="border-b border-sand-50 hover:bg-sand-50/80 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <time className="font-mono text-sand-600 tabular-nums text-[13px]">
                    {formatShortDate(s.date)}
                  </time>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    s.run_status === 'success' ? 'text-sage' : s.run_status === 'partial' ? 'text-rust' : 'text-brick'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      s.run_status === 'success' ? 'bg-sage' : s.run_status === 'partial' ? 'bg-rust' : 'bg-brick'
                    }`} />
                    {s.run_status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {s.blockers_count > 0 ? (
                    <span className="text-brick font-semibold">{s.blockers_count}</span>
                  ) : (
                    <span className="text-sand-300">&mdash;</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {s.at_risk_count > 0 ? (
                    <span className="text-rust font-semibold">{s.at_risk_count}</span>
                  ) : (
                    <span className="text-sand-300">&mdash;</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sand-500 tabular-nums text-[13px]">
                  {s.token_count ? `${(s.token_count / 1000).toFixed(1)}k` : '—'}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sand-500 tabular-nums text-[13px]">
                  {s.tool_calls ?? '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/standup/briefs/${s.id}`}
                    className="text-xs font-medium text-sand-400 hover:text-amber-accent transition-colors"
                  >
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
