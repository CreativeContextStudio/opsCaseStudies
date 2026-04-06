import Link from 'next/link'
import {
  getRecentBriefings, getIngestionStats, getSystemRunStats,
  getCategoryDistribution, getMarketProject,
} from '../lib/queries'
import { formatShortDate, formatMonthDay } from '../lib/format'

export const dynamic = 'force-dynamic'

const categoryChips: Record<string, { bg: string; text: string; label: string }> = {
  regulatory: { bg: 'rgba(143,247,128,0.15)', text: '#00730d', label: 'Regulatory' },
  earnings: { bg: 'rgba(255,220,195,0.2)', text: '#d17200', label: 'Earnings' },
  market_shift: { bg: '#e4e8f0', text: '#191c1e', label: 'Market Shift' },
  funding: { bg: 'rgba(214,227,255,0.3)', text: '#2c4771', label: 'Funding' },
  competitive: { bg: '#eceef0', text: '#191c1e', label: 'Competitive' },
  research: { bg: '#f2f4f6', text: '#000e24', label: 'Research' },
  product_launch: { bg: 'rgba(214,227,255,0.2)', text: '#2c4771', label: 'Product Launch' },
  partnership: { bg: 'rgba(180,192,212,0.15)', text: '#3a4a64', label: 'Partnership' },
}

export default async function MarketOverview() {
  const [project, briefings, runStats, ingestionStats, categories] = await Promise.all([
    getMarketProject(),
    getRecentBriefings(14),
    getSystemRunStats('market'),
    getIngestionStats(),
    getCategoryDistribution(),
  ])

  if (!project && !briefings.length) {
    return (
      <div className="p-12 text-outline">
        Market Intelligence module not yet seeded. Run <code className="font-body text-xs bg-surface-low px-2 py-1">npm run db:seed-market</code>
      </div>
    )
  }

  const totalScanned = ingestionStats?.total_items ?? 0
  const totalSurfaced = ingestionStats?.included_items ?? 0
  const latestBriefing = briefings[0]
  const avgPerDay = briefings.length > 0
    ? Math.round(briefings.reduce((s: number, b: any) => s + b.items_ingested, 0) / briefings.length)
    : 0

  // Build sample noise items for the hero
  const noiseHeadlines = [
    'Tech earnings beat estimates across FAANG group',
    'Oil prices steady as OPEC maintains output',
    'Consumer spending index rises 0.3% in March',
    'Real estate investment trusts post quarterly gains',
    'Auto industry supply chain disruptions continue',
    'Semiconductor shortage impacts production timelines',
    'Retail earnings mixed as holiday spending slows',
    'Cryptocurrency market cap reaches new quarterly high',
    'Airlines report increased passenger volumes Q1',
    'Agricultural commodity prices shift on weather',
    'Banking sector Q1 results exceed analyst targets',
    'Luxury goods demand resilient in Asian markets',
    'Defense spending bill passes committee review',
    'Telecom infrastructure investment accelerates',
    'Insurance sector loss ratios improve year-over-year',
    'Mining companies report record ore extraction',
    'Logistics firms expand drone delivery testing',
    'Fast food chains battle margin compression',
    'EV battery material costs remain volatile',
    'Sports betting revenue up 40% year over year',
    'Cloud computing growth rate stabilizes at 22%',
    'Commercial real estate vacancy rates plateau',
    'Shipping container rates normalize post-COVID',
    'Student loan payment restart impacts spending',
    'Bond yields curve inversion debate continues',
    'Venture capital deal volume down 18% in Q1',
    'Retail pharmacy chains restructure operations',
    'Water utility companies face infrastructure costs',
    'Media streaming subscriber growth decelerates',
    'Renewable energy tax credit extensions debated',
    'Private equity dry powder reaches $2.1 trillion',
    'Hotel industry RevPAR exceeds 2019 benchmarks',
    'Freight rail volumes show modest improvement',
    'Payment processing transaction volumes surge',
    'Cybersecurity spending growth outpaces IT budgets',
    'Food delivery platforms pursue profitability pivot',
    'Industrial automation investment hits record high',
    'Mortgage rates tick higher, applications fall 4%',
    'Social media ad revenue rebounds from Q4 dip',
    'Chemical industry feedstock costs stabilize',
  ]

  return (
    <section className="max-w-5xl mx-auto px-12 pt-4 pb-24">
      {/* ── Section A: Hero Split-Screen ── */}
      <div className="mb-24 animate-fade-up">
        <p className="label text-secondary italic mb-2">Case Study 02</p>
        <h1 className="font-headline text-5xl font-bold text-ink tracking-tight leading-tight mb-4">
          200 Sources Before<br />Market Open
        </h1>
        <p className="font-body text-sm text-on-surface-variant max-w-xl leading-relaxed mb-12">
          A contextual intelligence system that reads the financial noise so a decision-maker
          doesn&apos;t have to, delivering the signals that actually matter every morning.
        </p>

        <div className="grid grid-cols-12 gap-0">
          {/* Noise side */}
          <div className="col-span-7 bg-surface-low p-6 relative overflow-hidden" style={{ maxHeight: '400px' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="label text-[9px] text-outline">Raw Intake</span>
              <span className="font-headline text-4xl font-bold text-ink/10">{avgPerDay || 214}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              {noiseHeadlines.map((h, i) => (
                <p
                  key={i}
                  className="font-body text-[11px] text-outline-variant/60 leading-tight truncate animate-fade-up"
                  style={{ animationDelay: `${0.3 + i * 0.04}s` }}
                >
                  {h}
                </p>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-low to-transparent" />
          </div>

          {/* Signal side */}
          <div className="col-span-5 bg-surface-lowest p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="label text-[9px] text-ink">Signals</span>
              <span className="font-headline text-4xl font-bold text-ink">{latestBriefing?.items_included ?? 8}</span>
            </div>
            {latestBriefing && briefings.slice(0, 1).map((b: any) => (
              <div key={b.id} className="animate-fade-up" style={{ animationDelay: '0.8s' }}>
                <p className="font-headline text-base leading-relaxed text-on-surface mb-4">
                  {b.executive_summary?.slice(0, 200)}...
                </p>
                <Link
                  href={`/market/reports/${b.id}`}
                  className="label text-[9px] text-ink hover:text-ink/60 transition-colors"
                >
                  Read Full Briefing &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section B: Problem Statement ── */}
      <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <blockquote className="font-headline italic text-2xl text-ink leading-relaxed max-w-3xl mb-8">
          &ldquo;Every morning, a sector analyst wakes up to hundreds of items across news feeds,
          filings, and industry reports. Three hours of reading to find ten things that matter.
          The information exists. The problem is volume, not access.&rdquo;
        </blockquote>
        <div className="flex items-end gap-16">
          <HeroStat value={`${avgPerDay || 200}+`} label="sources scanned daily" />
          <HeroStat value="~3 hrs" label="manual scan time replaced" />
          <HeroStat value={`${latestBriefing?.items_included ?? '5-10'}`} label="signals that matter" />
        </div>
      </div>

      {/* ── Section C: Sector Configuration ── */}
      <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Sector Configuration</h2>
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-5">
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              The system is parameterized, not hardcoded. Every aspect of the intelligence
              focus is configurable: which sector, which companies to watch, which themes
              to prioritize, and how aggressively to filter. Change the configuration
              and the same pipeline serves healthcare, fintech, energy, or any domain.
            </p>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-4">
              This is the differentiator. Not &ldquo;AI reads the news.&rdquo; It&apos;s
              &ldquo;AI reads the news through the lens of your specific business context.&rdquo;
            </p>
          </div>
          <div className="col-span-7 glass-panel p-6" style={{ borderRadius: '0.375rem' }}>
            <ConfigRow label="Sector Focus" value="Healthcare AI — artificial intelligence, machine learning, and digital health applications" />
            <ConfigRow label="Watchlist" value="Tempus AI, Recursion Pharma, Flatiron Health, PathAI, Viz.ai, Butterfly Network, Aidoc" />
            <ConfigRow label="Priority Themes" value="FDA regulation, clinical trial automation, diagnostic AI, drug discovery ML" />
            <ConfigRow label="Relevance Threshold" value="40 / 100 — items scoring below are discarded" />
            <ConfigRow label="Delivery" value="6:30 AM ET weekdays — before market open" last />
          </div>
        </div>
      </div>

      {/* ── Section D: Pipeline Cascade ── */}
      <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">The Pipeline</h2>

        {/* Funnel steps */}
        <div className="flex flex-col gap-8 mb-12">
          <PipelineStep
            step="01"
            label="Ingestion"
            count={avgPerDay || 214}
            description="Items pulled from news APIs, SEC filings, research databases, social signals, and press releases overnight."
          />
          <PipelineStep
            step="02"
            label="Deduplication"
            count={Math.round((avgPerDay || 214) * 0.87)}
            description="Duplicates, rewrites, and syndicated copies removed by URL and content similarity."
          />
          <PipelineStep
            step="03"
            label="Relevance Scoring"
            count={Math.round((avgPerDay || 214) * 0.15)}
            description="Each item scored 0-100 against sector focus, watchlist, and priority themes. Items below 40 discarded."
            highlight
          />
          <PipelineStep
            step="04"
            label="Classification"
            count={Math.round((avgPerDay || 214) * 0.15)}
            description="Remaining items categorized: regulatory, funding, M&A, earnings, research, market shift."
          />
          <PipelineStep
            step="05"
            label="Briefing Selection"
            count={latestBriefing?.items_included ?? 8}
            description="Top signals selected by relevance and category diversity. Executive summary generated."
            highlight
          />
        </div>

        {/* The 92 vs 12 comparison */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="bg-surface-lowest p-6" style={{ borderRadius: '0.125rem' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="label text-[9px] text-ink">Signal</span>
              <span className="font-headline text-3xl font-bold text-ink">92<span className="text-lg text-outline">/100</span></span>
            </div>
            <h3 className="font-headline text-base font-bold text-ink mb-2">
              FDA Announces Draft Guidance on AI/ML-Based SaMD
            </h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
              Watchlist sector (Healthcare AI) + regulatory category + named companies on watchlist.
              Material impact on operating environment for monitored entities.
            </p>
            <div className="flex gap-2">
              <span className="signal-chip signal-chip-regulatory">Regulatory</span>
            </div>
          </div>
          <div className="bg-surface-low p-6" style={{ borderRadius: '0.125rem' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="label text-[9px] text-outline">Noise</span>
              <span className="font-headline text-3xl font-bold text-outline-variant/40">12<span className="text-lg text-outline-variant/30">/100</span></span>
            </div>
            <h3 className="font-headline text-base text-outline-variant/50 mb-2">
              Tech Earnings Beat Estimates Across FAANG Group
            </h3>
            <p className="font-body text-sm text-outline-variant/40 leading-relaxed mb-3">
              Outside sector focus. No watchlist companies. No healthcare or AI keywords in substance.
              Mentioned &ldquo;AI&rdquo; in passing only.
            </p>
            <div className="flex gap-2">
              <span className="signal-chip" style={{ background: '#eceef0', color: '#c6c6c6' }}>Earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section E: Architecture Strip ── */}
      <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="label mb-6 border-b border-outline-variant/10 pb-2">Architecture</h2>
        <div className="flex items-center justify-between gap-4 py-8">
          <div className="flex flex-col gap-3">
            {['News APIs', 'SEC Filings', 'Research', 'Social', 'Press Releases'].map((src) => (
              <div key={src} className="bg-surface-highest/40 px-4 py-2">
                <span className="font-body text-xs text-on-surface-variant">{src}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <div className="w-24 h-[1px] bg-ink" />
            <span className="label text-[8px] text-outline">SCORE &amp; FILTER</span>
          </div>
          <div className="ink-gradient text-on-ink px-8 py-6 text-center" style={{ borderRadius: '0.125rem' }}>
            <span className="font-headline text-lg font-bold block">Claude Agent</span>
            <span className="font-body text-[10px] uppercase tracking-widest opacity-60 block mt-1">
              Scan &middot; Score &middot; Synthesize
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <div className="w-24 h-[1px] bg-ink" />
            <span className="label text-[8px] text-outline">DAILY BRIEF</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Morning Briefing</span>
            </div>
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Signal Alerts</span>
            </div>
            <div className="bg-surface-highest/40 px-4 py-2">
              <span className="font-body text-xs text-on-surface-variant">Archive</span>
            </div>
          </div>
        </div>
        <p className="font-body text-xs text-outline text-center mt-2">
          5 source types &middot; ~{avgPerDay || 200} items/day &middot; {latestBriefing?.items_included ?? 8} signals &middot; ~{runStats?.avg_tokens ? (runStats.avg_tokens / 1000).toFixed(1) : '12'}k tokens &middot; ~90 seconds &middot; ~$0.12/run
        </p>
      </div>

      {/* ── Section F: Recent Briefings ── */}
      <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-end justify-between mb-6 border-b border-outline-variant/10 pb-2">
          <h2 className="label">Recent Briefings</h2>
          <Link href="/market/history" className="label text-[9px] text-on-surface-variant hover:text-ink transition-colors">
            Full Archive &rarr;
          </Link>
        </div>
        <div className="flex flex-col">
          {briefings.slice(0, 7).map((b: any) => (
            <Link
              key={b.id}
              href={`/market/reports/${b.id}`}
              className="group flex items-center justify-between py-4 hover:bg-surface-low transition-colors px-4 -mx-4"
            >
              <div className="flex items-center gap-6">
                <time className="font-body text-sm text-secondary tabular-nums w-32">
                  {formatShortDate(b.date)}
                </time>
                <span className="font-body text-xs text-on-surface-variant">
                  {b.items_ingested} scanned
                </span>
                <span className="font-headline text-sm font-bold text-ink">
                  {b.items_included} signals
                </span>
              </div>
              <span className="text-outline-variant group-hover:text-ink transition-colors text-sm">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Section G: Bridge ── */}
      <div className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <blockquote className="font-headline italic text-2xl text-ink/60 leading-relaxed max-w-3xl mb-8">
          &ldquo;Same problem I solved every morning on a production. Wake up, check overnight
          updates from crews in different time zones. Figure out what changed. Brief the right
          people before the 9am call. Different content. Same operational pattern.&rdquo;
        </blockquote>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-surface-low p-6" style={{ borderRadius: '0.125rem' }}>
            <p className="label text-[9px] text-outline mb-2">Case Study 01</p>
            <p className="font-headline text-lg text-ink">Project Standup</p>
            <p className="font-body text-xs text-on-surface-variant mt-1">
              Internal data &rarr; Ingest &rarr; Classify &rarr; 3 audience briefs
            </p>
          </div>
          <div className="bg-surface-lowest p-6" style={{ borderRadius: '0.125rem' }}>
            <p className="label text-[9px] text-ink mb-2">Case Study 02</p>
            <p className="font-headline text-lg text-ink">Market Intelligence</p>
            <p className="font-body text-xs text-on-surface-variant mt-1">
              External data &rarr; Ingest &rarr; Score &rarr; Daily briefing
            </p>
          </div>
        </div>
        <p className="font-body text-sm text-outline text-center mt-8">
          Same architecture. Different domain. That&apos;s the transferable part.
        </p>
      </div>
    </section>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="font-headline text-4xl font-bold text-ink tracking-tighter">{value}</span>
      <p className="font-body text-xs text-outline mt-1">{label}</p>
    </div>
  )
}

function ConfigRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`py-3 ${last ? '' : 'border-b border-outline-variant/10'}`}>
      <span className="label text-[9px] text-ink block mb-1">{label}</span>
      <span className="font-body text-sm text-on-surface-variant">{value}</span>
    </div>
  )
}

function PipelineStep({ step, label, count, description, highlight }: {
  step: string; label: string; count: number; description: string; highlight?: boolean
}) {
  return (
    <div className={`flex items-start gap-6 p-5 ${highlight ? 'bg-surface-lowest' : 'bg-surface-low'}`} style={{ borderRadius: '0.125rem' }}>
      <span className="font-body text-xs text-outline-variant tabular-nums mt-0.5">{step}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="label text-[9px] text-ink">{label}</span>
          <span className={`font-headline text-2xl font-bold ${highlight ? 'text-ink' : 'text-ink/30'}`}>
            {count}
          </span>
        </div>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
