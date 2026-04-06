import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, and, gt, ne } from 'drizzle-orm'
import { z } from 'zod'
import {
  pgTable, pgSchema, uuid, text, timestamp, jsonb, integer, boolean, date,
} from 'drizzle-orm/pg-core'

// ── Schema (inline to avoid workspace import issues with stdio MCP servers) ──

const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

const systemRuns = pgTable('system_runs', {
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

const outputLog = pgTable('output_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').references(() => systemRuns.id),
  outputType: text('output_type').notNull(),
  content: text('content').notNull(),
  deliveredAt: timestamp('delivered_at'),
  deliveryStatus: text('delivery_status'),
})

const standupSchema = pgSchema('standup')

const tasks = standupSchema.table('tasks', {
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

const standupHistory = standupSchema.table('standup_history', {
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

const clientUpdates = standupSchema.table('client_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  standupId: uuid('standup_id'),
  date: date('date').notNull(),
  narrative: text('narrative').notNull(),
  status: text('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

const schema = { projects, systemRuns, outputLog, tasks, standupHistory, clientUpdates }

// ── DB Client ────────────────────────────────────────────────────

function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, { schema })
}

// ── Helpers ──────────────────────────────────────────────────────

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true }
}

// ── Server ───────────────────────────────────────────────────────

const server = new McpServer({
  name: 'project-db',
  version: '1.0.0',
})

// ── Tool 1: get_active_projects ──────────────────────────────────

server.tool(
  'get_active_projects',
  'Returns all active projects. Use this as the first call to discover which projects need standups.',
  {},
  async () => {
    const db = getDb()
    const results = await db.select().from(projects).where(eq(projects.active, true))
    return jsonResult(results)
  },
)

// ── Tool 2: get_project_config ───────────────────────────────────

server.tool(
  'get_project_config',
  'Returns configuration for a specific project (Slack channel, git repo, email list, etc.).',
  { project_id: z.string().uuid().describe('The project UUID') },
  async ({ project_id }) => {
    const db = getDb()
    const [result] = await db.select().from(projects).where(eq(projects.id, project_id))
    if (!result) return errorResult(`Project ${project_id} not found`)
    return jsonResult(result)
  },
)

// ── Tool 3: get_tasks_since ──────────────────────────────────────

server.tool(
  'get_tasks_since',
  'Returns all tasks modified since a given timestamp. Use for incremental updates since the last standup run.',
  {
    project_id: z.string().uuid().describe('The project UUID'),
    since: z.string().describe('ISO 8601 timestamp — returns tasks modified after this time'),
  },
  async ({ project_id, since }) => {
    const db = getDb()
    const sinceDate = new Date(since)
    if (isNaN(sinceDate.getTime())) return errorResult(`Invalid timestamp: ${since}`)
    const results = await db.select().from(tasks)
      .where(and(eq(tasks.projectId, project_id), gt(tasks.lastModified, sinceDate)))
    return jsonResult(results)
  },
)

// ── Tool 4: get_all_active_tasks ─────────────────────────────────

server.tool(
  'get_all_active_tasks',
  'Returns all non-done tasks for a project. Use on first run or when no previous timestamp is available.',
  { project_id: z.string().uuid().describe('The project UUID') },
  async ({ project_id }) => {
    const db = getDb()
    const results = await db.select().from(tasks)
      .where(and(eq(tasks.projectId, project_id), ne(tasks.status, 'done')))
    return jsonResult(results)
  },
)

// ── Tool 5: get_standup_history ──────────────────────────────────

server.tool(
  'get_standup_history',
  'Returns recent standup history for a project. Useful for detecting trends and patterns across days.',
  {
    project_id: z.string().uuid().describe('The project UUID'),
    limit: z.number().int().min(1).max(30).default(7).describe('Number of recent standups to return (default 7)'),
  },
  async ({ project_id, limit }) => {
    const db = getDb()
    const results = await db.select().from(standupHistory)
      .where(eq(standupHistory.projectId, project_id))
      .orderBy(standupHistory.date)
      .limit(limit)
    return jsonResult(results)
  },
)

// ── Tool 6: log_standup ──────────────────────────────────────────

server.tool(
  'log_standup',
  'Logs a completed standup to the database. Call this after generating all three briefs.',
  {
    project_id: z.string().uuid().describe('The project UUID'),
    run_id: z.string().uuid().optional().describe('The system run ID (if tracking runs)'),
    team_brief: z.string().describe('The full team lead brief (tactical, detailed)'),
    exec_brief: z.string().describe('The executive summary brief'),
    client_brief: z.string().describe('The client-facing narrative brief'),
    blockers_count: z.number().int().min(0).describe('Number of blockers identified'),
    at_risk_count: z.number().int().min(0).describe('Number of at-risk items identified'),
  },
  async ({ project_id, run_id, team_brief, exec_brief, client_brief, blockers_count, at_risk_count }) => {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const [record] = await db.insert(standupHistory).values({
      projectId: project_id,
      runId: run_id,
      date: today,
      teamBrief: team_brief,
      execBrief: exec_brief,
      clientBrief: client_brief,
      blockersCount: blockers_count,
      atRiskCount: at_risk_count,
    }).returning()
    return jsonResult({ id: record.id, date: today, message: 'Standup logged successfully' })
  },
)

// ── Tool 7: log_system_run ───────────────────────────────────────

server.tool(
  'log_system_run',
  'Logs a system run to the shared system_runs table. Call at the start and end of each agent run.',
  {
    project_id: z.string().uuid().describe('The project UUID'),
    module: z.string().describe('Module name (e.g., "standup")'),
    status: z.enum(['success', 'partial', 'failed']).describe('Run outcome'),
    started_at: z.string().describe('ISO 8601 timestamp when the run started'),
    completed_at: z.string().optional().describe('ISO 8601 timestamp when the run completed'),
    token_count: z.number().int().optional().describe('Total tokens used in the run'),
    tool_calls: z.number().int().optional().describe('Number of MCP tool calls made'),
    error_log: z.string().optional().describe('Error details if status is partial or failed'),
  },
  async ({ project_id, module, status, started_at, completed_at, token_count, tool_calls, error_log }) => {
    const db = getDb()
    const [record] = await db.insert(systemRuns).values({
      projectId: project_id,
      module,
      status,
      startedAt: new Date(started_at),
      completedAt: completed_at ? new Date(completed_at) : null,
      tokenCount: token_count ?? null,
      toolCalls: tool_calls ?? null,
      errorLog: error_log ?? null,
    }).returning()
    return jsonResult({ id: record.id, message: 'System run logged' })
  },
)

// ── Tool 8: post_to_slack ────────────────────────────────────────

server.tool(
  'post_to_slack',
  'Posts a message to a Slack channel via incoming webhook. Use Block Kit JSON for rich formatting.',
  {
    webhook_url: z.string().url().describe('Slack incoming webhook URL'),
    text: z.string().describe('Plain text fallback for the message'),
    blocks: z.string().optional().describe('Slack Block Kit JSON string for rich formatting'),
  },
  async ({ webhook_url, text: messageText, blocks }) => {
    const payload: Record<string, unknown> = { text: messageText }
    if (blocks) {
      try {
        payload.blocks = JSON.parse(blocks)
      } catch {
        return errorResult('Invalid Block Kit JSON')
      }
    }

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text()
      return errorResult(`Slack API error (${response.status}): ${body}`)
    }

    return jsonResult({ delivered: true, message: 'Posted to Slack' })
  },
)

// ── Tool 9: send_email ───────────────────────────────────────────

server.tool(
  'send_email',
  'Sends an email via SMTP (Gmail). Use for executive brief delivery.',
  {
    to: z.string().describe('Recipient email address(es), comma-separated'),
    subject: z.string().describe('Email subject line'),
    html: z.string().describe('HTML body of the email'),
  },
  async ({ to, subject, html }) => {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD

    if (!user || !pass) {
      return errorResult('GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required. Email not sent — content returned for manual delivery.')
    }

    // Dynamic import to avoid requiring nodemailer when not configured
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      })

      await transporter.sendMail({
        from: user,
        to,
        subject,
        html,
      })

      return jsonResult({ delivered: true, to, subject })
    } catch (err) {
      return errorResult(`Email send failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  },
)

// ── Tool 10: write_client_update ─────────────────────────────────

server.tool(
  'write_client_update',
  'Writes a client-facing brief to the client_updates table for review before sending.',
  {
    project_id: z.string().uuid().describe('The project UUID'),
    standup_id: z.string().uuid().optional().describe('Link to the standup_history record'),
    narrative: z.string().describe('The client-facing narrative text'),
  },
  async ({ project_id, standup_id, narrative }) => {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const [record] = await db.insert(clientUpdates).values({
      projectId: project_id,
      standupId: standup_id,
      date: today,
      narrative,
      status: 'draft',
    }).returning()
    return jsonResult({ id: record.id, status: 'draft', message: 'Client update saved as draft' })
  },
)

// ── Start ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('MCP server failed to start:', err)
  process.exit(1)
})
