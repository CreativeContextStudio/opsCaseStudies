import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const systemRuns = pgTable('system_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  module: text('module').notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  tokenCount: integer('token_count'),
  toolCalls: integer('tool_calls'),
  errorLog: text('error_log'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
})

export const outputLog = pgTable('output_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').references(() => systemRuns.id),
  outputType: text('output_type').notNull(),
  content: text('content').notNull(),
  deliveredAt: timestamp('delivered_at'),
  deliveryStatus: text('delivery_status'),
})
