import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`CREATE SCHEMA IF NOT EXISTS standup`
  console.log('✓ Created Postgres schema: standup')
}

main()
