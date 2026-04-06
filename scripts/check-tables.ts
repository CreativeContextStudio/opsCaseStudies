import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  const tables = await sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema IN ('public', 'standup')
    ORDER BY table_schema, table_name
  `
  console.log('Tables in database:')
  for (const t of tables) {
    console.log(`  ${t.table_schema}.${t.table_name}`)
  }
}

main()
