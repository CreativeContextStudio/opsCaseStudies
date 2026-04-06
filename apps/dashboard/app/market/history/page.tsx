import Link from 'next/link'
import { getRecentBriefings } from '../../lib/queries'
import { formatShortDate, formatMonthDay } from '../../lib/format'

export const dynamic = 'force-dynamic'

export default async function MarketHistory() {
  const briefings = await getRecentBriefings(14)

  return (
    <section className="max-w-5xl mx-auto px-12 pt-4 pb-24">
      {/* Header */}
      <div className="mb-16 animate-fade-up">
        <Link href="/market" className="label text-outline hover:text-ink transition-colors inline-block mb-8">
          &larr; Back to Overview
        </Link>
        <p className="label text-secondary italic mb-2">Market Intelligence</p>
        <h1 className="font-headline text-5xl font-bold text-ink tracking-tight leading-tight">
          Briefing Archive
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-3 max-w-lg leading-relaxed">
          {briefings.length} consecutive trading days of automated intelligence delivery.
          Every briefing generated before market open with zero human input.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Vertical line */}
        <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-outline-variant/20" />

        <div className="flex flex-col gap-0">
          {briefings.map((b: any, i: number) => {
            const signalDensity = b.items_included >= 9
              ? 'high'
              : b.items_included >= 7
                ? 'moderate'
                : 'normal'

            return (
              <Link
                key={b.id}
                href={`/market/reports/${b.id}`}
                className="group flex items-start gap-8 py-5 pl-8 -ml-[1px] hover:bg-surface-low transition-colors relative animate-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.03}s` }}
              >
                {/* Timeline dot */}
                <span
                  className={`absolute left-0 top-[26px] w-[7px] h-[7px] ${
                    signalDensity === 'high'
                      ? 'bg-ink'
                      : signalDensity === 'moderate'
                        ? 'bg-secondary'
                        : 'bg-outline-variant'
                  }`}
                  style={{ borderRadius: '0.125rem' }}
                />

                {/* Date */}
                <time className="font-body text-sm text-secondary tabular-nums w-32 shrink-0">
                  {formatShortDate(b.date)}
                </time>

                {/* Stats */}
                <div className="flex items-center gap-6 flex-1">
                  <span className="font-body text-xs text-outline tabular-nums w-20">
                    {b.items_ingested} scanned
                  </span>
                  <span className="font-headline text-sm font-bold text-ink tabular-nums w-16">
                    {b.items_included} signals
                  </span>
                  <span className="font-body text-xs text-on-surface-variant truncate max-w-xs">
                    {b.executive_summary?.slice(0, 80)}...
                  </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 shrink-0">
                  {b.token_count && (
                    <span className="font-body text-[10px] text-outline tabular-nums">
                      {(b.token_count / 1000).toFixed(1)}k tok
                    </span>
                  )}
                  <span className={`inline-block w-1.5 h-1.5 ${
                    b.run_status === 'success' ? 'bg-ink' : 'bg-error'
                  }`} />
                  <span className="text-outline-variant group-hover:text-ink transition-colors text-sm">
                    &rarr;
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Summary strip */}
      {briefings.length > 0 && (
        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex items-end gap-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div>
            <span className="label block text-[9px] mb-1">Trading Days</span>
            <span className="font-headline text-2xl font-bold text-ink">{briefings.length}</span>
          </div>
          <div>
            <span className="label block text-[9px] mb-1">Total Scanned</span>
            <span className="font-headline text-2xl font-bold text-ink">
              {briefings.reduce((s: number, b: any) => s + b.items_ingested, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="label block text-[9px] mb-1">Total Signals</span>
            <span className="font-headline text-2xl font-bold text-ink">
              {briefings.reduce((s: number, b: any) => s + b.items_included, 0)}
            </span>
          </div>
          <div>
            <span className="label block text-[9px] mb-1">Avg/Day</span>
            <span className="font-headline text-2xl font-bold text-ink">
              {Math.round(briefings.reduce((s: number, b: any) => s + b.items_ingested, 0) / briefings.length)}
            </span>
          </div>
          <div>
            <span className="label block text-[9px] mb-1">Success Rate</span>
            <span className="font-headline text-2xl font-bold text-ink">
              {Math.round((briefings.filter((b: any) => b.run_status === 'success').length / briefings.length) * 100)}%
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
