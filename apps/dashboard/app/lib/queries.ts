import { neon } from '@neondatabase/serverless'

// Single connection per request cycle — avoids creating a new WebSocket per query
let _sql: ReturnType<typeof neon> | null = null

function sql() {
  if (!_sql) {
    // fetchOptions with IPv4 preference to avoid Neon IPv6 timeout issues
    _sql = neon(process.env.DATABASE_URL!, {
      fetchOptions: { cache: 'no-store' },
    })
  }
  return _sql
}

export async function getRecentStandups(limit = 14) {
  const q = sql()
  return q`
    SELECT sh.*, sr.token_count, sr.tool_calls, sr.status as run_status
    FROM standup.standup_history sh
    LEFT JOIN public.system_runs sr ON sh.run_id = sr.id
    WHERE sh.project_id = (SELECT id FROM public.projects WHERE active = true LIMIT 1)
    ORDER BY sh.date DESC
    LIMIT ${limit}
  `
}

export async function getStandupById(id: string) {
  const q = sql()
  const [row] = await q`
    SELECT sh.*, sr.token_count, sr.tool_calls, sr.started_at, sr.completed_at, sr.status as run_status,
           p.name as project_name
    FROM standup.standup_history sh
    LEFT JOIN public.system_runs sr ON sh.run_id = sr.id
    LEFT JOIN public.projects p ON sh.project_id = p.id
    WHERE sh.id = ${id}
  `
  return row ?? null
}

export async function getActiveProject() {
  const q = sql()
  const [row] = await q`SELECT * FROM public.projects WHERE active = true LIMIT 1`
  return row ?? null
}

export async function getTaskStats(projectId: string) {
  const q = sql()
  return q`
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
  const q = sql()
  return q`
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

export async function getSystemRunStats() {
  const q = sql()
  const [row] = await q`
    SELECT
      count(*)::int as total_runs,
      count(*) FILTER (WHERE status = 'success')::int as successful,
      avg(token_count)::int as avg_tokens,
      avg(tool_calls)::int as avg_tool_calls
    FROM public.system_runs
    WHERE module = 'standup'
  `
  return row
}
