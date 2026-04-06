import Link from 'next/link'
import { getRecentStandups } from '../../lib/queries'
import { formatShortDate } from '../../lib/format'

export const dynamic = 'force-dynamic'

export default async function StandupHistory() {
  const standups = await getRecentStandups(30)

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="animate-fade-up">
        <Link href="/standup" className="label text-[9px] text-outline hover:text-ink transition-colors">
          &larr; Back to overview
        </Link>
        <h1 className="font-headline text-3xl font-bold text-ink mt-4 tracking-tight">Run History</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Every automated standup run with performance metrics
        </p>
      </div>

      <div className="mt-8 bg-surface-lowest animate-fade-up shadow-ambient" style={{ animationDelay: '0.1s' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-low">
              <th className="text-left px-5 py-3 label text-[9px]">Date</th>
              <th className="text-left px-5 py-3 label text-[9px]">Status</th>
              <th className="text-center px-5 py-3 label text-[9px]">Blockers</th>
              <th className="text-center px-5 py-3 label text-[9px]">At Risk</th>
              <th className="text-right px-5 py-3 label text-[9px]">Tokens</th>
              <th className="text-right px-5 py-3 label text-[9px]">Tools</th>
              <th className="px-5 py-3 label text-[9px]">Arc</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {standups.map((s: any, i: number) => {
              const arc = getArc(i, standups.length)
              return (
                <tr key={s.id} className="border-b border-outline-variant/5 hover:bg-surface-low transition-colors">
                  <td className="px-5 py-3.5">
                    <time className="font-body text-sm text-secondary tabular-nums">{formatShortDate(s.date)}</time>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`flex items-center gap-1.5 font-body text-xs font-medium ${
                      s.run_status === 'success' ? 'text-ink/40' : 'text-error'
                    }`}>
                      <span className={`w-1.5 h-1.5 ${s.run_status === 'success' ? 'bg-ink/40' : 'bg-error'}`} />
                      {s.run_status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {s.blockers_count > 0
                      ? <span className="font-body text-sm font-bold text-error">{s.blockers_count}</span>
                      : <span className="text-outline-variant">&mdash;</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {s.at_risk_count > 0
                      ? <span className="font-body text-sm font-bold text-secondary">{s.at_risk_count}</span>
                      : <span className="text-outline-variant">&mdash;</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right font-body text-xs text-outline tabular-nums">
                    {s.token_count ? `${(s.token_count / 1000).toFixed(1)}k` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-body text-xs text-outline tabular-nums">
                    {s.tool_calls ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {arc && <span className={`font-headline italic text-xs ${arc.color}`}>{arc.label}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/standup/briefs/${s.id}`} className="label text-[9px] text-outline hover:text-ink transition-colors">
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getArc(index: number, total: number): { label: string; color: string } | null {
  const fromEnd = total - 1 - index
  if (fromEnd >= 9) return { label: 'Smooth Sailing', color: 'text-ink/30' }
  if (fromEnd >= 6) return { label: 'Cracks Appear', color: 'text-secondary' }
  if (fromEnd >= 3) return { label: 'Cascade', color: 'text-error/70' }
  return { label: 'Recovery', color: 'text-ink' }
}
