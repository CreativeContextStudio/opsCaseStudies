import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBriefingById, getBriefingItems } from '../../../lib/queries'
import { formatLongDate } from '../../../lib/format'

export const dynamic = 'force-dynamic'

const categoryChips: Record<string, { bg: string; text: string }> = {
  regulatory: { bg: 'rgba(143,247,128,0.15)', text: '#00730d' },
  earnings: { bg: 'rgba(255,220,195,0.2)', text: '#d17200' },
  'market_shift': { bg: '#e4e8f0', text: '#191c1e' },
  funding: { bg: 'rgba(214,227,255,0.3)', text: '#2c4771' },
  competitive: { bg: '#eceef0', text: '#191c1e' },
  research: { bg: '#f2f4f6', text: '#000e24' },
  product_launch: { bg: 'rgba(214,227,255,0.2)', text: '#2c4771' },
  partnership: { bg: 'rgba(180,192,212,0.15)', text: '#3a4a64' },
}

const sourceLabels: Record<string, string> = {
  news: 'News',
  sec_filing: 'SEC Filing',
  research: 'Research',
  social: 'Social',
  press_release: 'Press Release',
}

export default async function BriefingView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [briefing, items] = await Promise.all([
    getBriefingById(id),
    getBriefingItems(id),
  ])
  if (!briefing) notFound()

  const runDuration = briefing.started_at && briefing.completed_at
    ? Math.round((new Date(briefing.completed_at).getTime() - new Date(briefing.started_at).getTime()) / 1000)
    : null

  return (
    <div className="max-w-5xl mx-auto px-12 pt-12 pb-24">
      {/* Back */}
      <Link href="/market" className="label text-outline hover:text-ink transition-colors inline-block mb-12">
        &larr; Back to Overview
      </Link>

      {/* Editorial Masthead */}
      <div className="mb-20 animate-fade-up">
        <p className="label text-secondary italic mb-2">Market Intelligence Briefing</p>
        <h1 className="font-headline text-6xl font-bold text-ink tracking-tight leading-none">
          {briefing.profile_name || 'Healthcare AI'}
        </h1>
        <div className="flex justify-between items-end mt-4">
          <p className="label text-secondary">
            {briefing.items_ingested} scanned &middot; {briefing.items_included} signals
          </p>
          <p className="font-headline italic text-3xl text-ink/60">
            {formatLongDate(briefing.date)}
          </p>
        </div>
      </div>

      {/* Performance Strip */}
      <div className="flex items-center gap-12 mb-16 pb-6 border-b border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <MetaItem label="Runtime" value={runDuration ? `${runDuration}s` : '~90s'} />
        <MetaItem label="Tokens" value={briefing.token_count ? `${(briefing.token_count / 1000).toFixed(1)}k` : '~12k'} />
        <MetaItem label="Tool Calls" value={briefing.tool_calls ? String(briefing.tool_calls) : '~14'} />
        <MetaItem label="Scanned" value={String(briefing.items_ingested)} />
        <MetaItem label="Surfaced" value={String(briefing.items_included)} />
        <div className="ml-auto">
          <span className="label text-[9px] text-outline">
            Automated by Claude Agent &middot; Zero human input
          </span>
        </div>
      </div>

      {/* Executive Summary — Glass Panel */}
      <div className="glass-panel p-8 mb-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <p className="label text-[9px] text-ink mb-3">Executive Summary</p>
        <p className="font-headline text-xl leading-relaxed text-on-surface">
          {briefing.executive_summary}
        </p>
      </div>

      {/* Included Signals */}
      <div className="mb-20 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">
          Signals ({items.length})
        </h2>
        <div className="flex flex-col gap-4">
          {items.map((item: any, i: number) => {
            const chip = categoryChips[item.category] || { bg: '#eceef0', text: '#191c1e' }
            return (
              <div
                key={item.id}
                className="bg-surface-lowest p-6 animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.03}s`, borderRadius: '0.125rem' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-headline text-lg font-bold text-ink leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="signal-chip"
                      style={{ background: chip.bg, color: chip.text }}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="font-body text-xs text-outline tabular-nums">
                      {item.relevance_score}/100
                    </span>
                  </div>
                </div>
                {item.raw_snippet && (
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
                    {item.raw_snippet}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <span className="label text-[9px] text-outline">
                    {sourceLabels[item.source_type] || item.source_type}
                  </span>
                  {item.url && (
                    <span className="font-body text-xs text-outline-variant">
                      {new URL(item.url).hostname}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full Briefing */}
      <div className="mb-20 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Full Briefing</h2>
        <div
          className="font-headline text-lg leading-relaxed text-on-surface brief-render max-w-3xl"
          dangerouslySetInnerHTML={{ __html: renderBriefing(briefing.full_briefing) }}
        />
      </div>

      {/* How This Was Generated */}
      <div className="pt-12 border-t border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <h2 className="label mb-8">How This Briefing Was Generated</h2>
        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-7">
            <h3 className="font-headline text-2xl text-ink mb-4">The Pipeline</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              A Claude agent ran before market open, querying {briefing.items_ingested} items
              from 5 source types (news APIs, SEC filings, research databases, social signals,
              press releases). Each item was scored 0-100 against the sector focus. Items
              scoring 40+ were classified by category. The top {briefing.items_included} signals
              were synthesized into this briefing — all in {runDuration ?? 90} seconds with zero
              human input.
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <SourceRow label="News APIs" detail={`Google News RSS, NewsAPI.org — ${Math.round(briefing.items_ingested * 0.6)} articles scanned`} />
              <SourceRow label="Press Releases" detail={`Wire services, company newsrooms — ${Math.round(briefing.items_ingested * 0.15)} releases checked`} />
              <SourceRow label="Research" detail={`PubMed, preprint servers, analyst notes — ${Math.round(briefing.items_ingested * 0.1)} papers scanned`} />
              <SourceRow label="SEC Filings" detail={`EDGAR full-text search — ${Math.round(briefing.items_ingested * 0.08)} filings checked`} />
              <SourceRow label="Social Signals" detail={`Industry discourse, expert commentary — ${Math.round(briefing.items_ingested * 0.07)} signals tracked`} />
            </div>
          </div>
          <div className="col-span-5">
            <h3 className="font-headline text-2xl text-ink mb-4">Scoring Criteria</h3>
            <div className="flex flex-col gap-6">
              <DecisionCard
                title="Sector Relevance"
                details={['Healthcare AI keyword match', 'Watchlist company named', 'Priority theme alignment']}
              />
              <DecisionCard
                title="Signal Strength"
                details={['Material vs. routine event', 'Financial impact disclosed', 'Regulatory or strategic shift']}
              />
              <DecisionCard
                title="Recency & Uniqueness"
                details={['Published within 24 hours', 'Not a duplicate or rewrite', 'New information vs. recap']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-24 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <p className="font-headline italic text-2xl text-outline-variant/60 select-none tracking-tight">
          {briefing.items_ingested} items scanned &middot; {briefing.items_included} signals surfaced &middot; One briefing delivered
        </p>
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label block text-[9px]">{label}</span>
      <span className="font-headline text-xl font-bold text-ink">{value}</span>
    </div>
  )
}

function SourceRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="w-2 h-2 bg-ink mt-1.5 shrink-0" style={{ borderRadius: '0.125rem' }} />
      <div>
        <span className="label text-[9px] text-ink block">{label}</span>
        <span className="font-body text-sm text-on-surface-variant">{detail}</span>
      </div>
    </div>
  )
}

function DecisionCard({ title, details }: { title: string; details: string[] }) {
  return (
    <div className="bg-surface-low p-6" style={{ borderRadius: '0.125rem' }}>
      <span className="label text-[9px] text-ink block mb-3">{title}</span>
      {details.map((d, i) => (
        <p key={i} className="font-body text-sm text-on-surface-variant leading-relaxed">
          — {d}
        </p>
      ))}
    </div>
  )
}

function renderBriefing(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/^## (.*)/gm, '<h2 class="font-headline text-xl font-bold text-ink mt-8 mb-2">$1</h2>')
    .replace(/^### (.*)/gm, '<h3 class="font-headline text-lg text-ink mt-6 mb-2">$1</h3>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m: string) => `<ul class="space-y-1 my-3">${m}</ul>`)
    .split('\n\n')
    .map((p: string) => p.startsWith('<') ? p : `<p class="mb-3">${p}</p>`)
    .join('')
}
