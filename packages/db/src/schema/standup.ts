import { pgSchema, uuid, text, timestamp, integer, boolean, date } from 'drizzle-orm/pg-core'

export const standupSchema = pgSchema('standup')

export const tasks = standupSchema.table('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  name: text('name').notNull(),
  assignee: text('assignee').notNull(),
  status: text('status').notNull(),
  dueDate: date('due_date'),
  priority: text('priority').notNull(),
  workstream: text('workstream'),
  blockers: text('blockers'),
  notes: text('notes'),
  lastModified: timestamp('last_modified').defaultNow().notNull(),
})

export const standupHistory = standupSchema.table('standup_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  runId: uuid('run_id'),
  date: date('date').notNull(),
  teamBrief: text('team_brief').notNull(),
  execBrief: text('exec_brief').notNull(),
  clientBrief: text('client_brief').notNull(),
  blockersCount: integer('blockers_count').default(0).notNull(),
  atRiskCount: integer('at_risk_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const clientUpdates = standupSchema.table('client_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  standupId: uuid('standup_id'),
  date: date('date').notNull(),
  narrative: text('narrative').notNull(),
  status: text('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
