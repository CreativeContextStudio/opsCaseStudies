import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  const [projects] = await sql`SELECT count(*) as n FROM public.projects`
  const [tasks] = await sql`SELECT count(*) as n FROM standup.tasks`
  const [history] = await sql`SELECT count(*) as n FROM standup.standup_history`
  const [runs] = await sql`SELECT count(*) as n FROM public.system_runs`
  const [outputs] = await sql`SELECT count(*) as n FROM public.output_log`

  console.log(`Projects:        ${projects.n}`)
  console.log(`Tasks:           ${tasks.n}`)
  console.log(`Standup history: ${history.n}`)
  console.log(`System runs:     ${runs.n}`)
  console.log(`Output logs:     ${outputs.n}`)

  // Show task breakdown
  const statuses = await sql`SELECT status, count(*) as n FROM standup.tasks GROUP BY status ORDER BY n DESC`
  console.log('\nTask breakdown:')
  for (const s of statuses) console.log(`  ${s.status}: ${s.n}`)

  // Show workstream breakdown
  const ws = await sql`SELECT workstream, count(*) as n FROM standup.tasks GROUP BY workstream ORDER BY n DESC`
  console.log('\nWorkstreams:')
  for (const w of ws) console.log(`  ${w.workstream}: ${w.n}`)

  // Show blocker trend
  const blockers = await sql`SELECT date, blockers_count, at_risk_count FROM standup.standup_history ORDER BY date`
  console.log('\nBlocker trend (14-day arc):')
  for (const b of blockers) console.log(`  ${b.date}: ${b.blockers_count} blockers, ${b.at_risk_count} at-risk`)
}

main()
