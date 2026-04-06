import { neon } from '@neondatabase/serverless'

// Single connection per request cycle
let _sql: ReturnType<typeof neon> | null = null

function sql() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!, {
      fetchOptions: { cache: 'no-store' },
    })
  }
  return _sql
}

// Wrapper that always returns any[] to avoid Neon's strict union return type
async function query(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  const q = sql()
  return q(strings, ...values) as any
}

export async function getRecentStandups(limit = 14) {
  return query`
    SELECT sh.*, sr.token_count, sr.tool_calls, sr.status as run_status
    FROM standup.standup_history sh
    LEFT JOIN public.system_runs sr ON sh.run_id = sr.id
    WHERE sh.project_id = (SELECT id FROM public.projects WHERE active = true LIMIT 1)
    ORDER BY sh.date DESC
    LIMIT ${limit}
  `
}

export async function getStandupById(id: string) {
  const rows = await query`
    SELECT sh.*, sr.token_count, sr.tool_calls, sr.started_at, sr.completed_at, sr.status as run_status,
           p.name as project_name
    FROM standup.standup_history sh
    LEFT JOIN public.system_runs sr ON sh.run_id = sr.id
    LEFT JOIN public.projects p ON sh.project_id = p.id
    WHERE sh.id = ${id}
  `
  return rows[0] ?? null
}

export async function getActiveProject() {
  const rows = await query`SELECT * FROM public.projects WHERE active = true LIMIT 1`
  return rows[0] ?? null
}

export async function getTaskStats(projectId: string) {
  return query`
    SELECT
      status,
      count(*)::int as count,
      count(*) FILTER (WHERE priority = 'P0')::int as p0_count
    FROM standup.tasks
    WHERE project_id = ${projectId}
    GROUP BY status
  `
}

export async function getWorkstreamStats(projectId: string) {
  return query`
    SELECT
      workstream,
      count(*)::int as total,
      count(*) FILTER (WHERE status = 'done')::int as done,
      count(*) FILTER (WHERE status = 'blocked')::int as blocked
    FROM standup.tasks
    WHERE project_id = ${projectId}
    GROUP BY workstream
    ORDER BY workstream
  `
}

export async function getAllTasks(projectId: string) {
  return query`
    SELECT * FROM standup.tasks
    WHERE project_id = ${projectId}
    ORDER BY workstream, priority, due_date NULLS LAST
  `
}

export async function getSystemRunStats(module = 'standup') {
  const rows = await query`
    SELECT
      count(*)::int as total_runs,
      count(*) FILTER (WHERE status = 'success')::int as successful,
      avg(token_count)::int as avg_tokens,
      avg(tool_calls)::int as avg_tool_calls
    FROM public.system_runs
    WHERE module = ${module}
  `
  return rows[0]
}

// ── Market Intelligence Queries ──

export async function getMarketProject() {
  const rows = await query`SELECT * FROM public.projects WHERE module = 'market' AND active = true LIMIT 1`
  return rows[0] ?? null
}

export async function getRecentBriefings(limit = 14) {
  return query`
    SELECT mb.*, sr.token_count, sr.tool_calls, sr.status as run_status,
           sr.started_at, sr.completed_at
    FROM market.market_briefings mb
    LEFT JOIN public.system_runs sr ON mb.run_id = sr.id
    WHERE mb.profile_id = (SELECT id FROM market.sector_profiles WHERE active = true LIMIT 1)
    ORDER BY mb.date DESC
    LIMIT ${limit}
  `
}

export async function getBriefingById(id: string) {
  const rows = await query`
    SELECT mb.*, sr.token_count, sr.tool_calls, sr.started_at, sr.completed_at, sr.status as run_status,
           sp.name as profile_name, p.name as project_name
    FROM market.market_briefings mb
    LEFT JOIN public.system_runs sr ON mb.run_id = sr.id
    LEFT JOIN market.sector_profiles sp ON mb.profile_id = sp.id
    LEFT JOIN public.projects p ON p.module = 'market' AND p.active = true
    WHERE mb.id = ${id}
  `
  return rows[0] ?? null
}

export async function getBriefingItems(briefingId: string) {
  return query`
    SELECT * FROM market.ingested_items
    WHERE briefing_id = ${briefingId}
    ORDER BY relevance_score DESC
  `
}

export async function getIngestionStats() {
  const rows = await query`
    SELECT
      count(*)::int as total_items,
      count(*) FILTER (WHERE briefing_included = true)::int as included_items,
      avg(relevance_score)::int as avg_relevance,
      count(DISTINCT date_trunc('day', ingested_at))::int as days_covered
    FROM market.ingested_items
    WHERE profile_id = (SELECT id FROM market.sector_profiles WHERE active = true LIMIT 1)
  `
  return rows[0]
}

export async function getCategoryDistribution() {
  return query`
    SELECT category,
           count(*)::int as total,
           count(*) FILTER (WHERE briefing_included = true)::int as included
    FROM market.ingested_items
    WHERE profile_id = (SELECT id FROM market.sector_profiles WHERE active = true LIMIT 1)
    GROUP BY category
    ORDER BY included DESC
  `
}

export async function getSourceDistribution() {
  return query`
    SELECT source_type,
           count(*)::int as total,
           count(*) FILTER (WHERE briefing_included = true)::int as included
    FROM market.ingested_items
    WHERE profile_id = (SELECT id FROM market.sector_profiles WHERE active = true LIMIT 1)
    GROUP BY source_type
    ORDER BY total DESC
  `
}
