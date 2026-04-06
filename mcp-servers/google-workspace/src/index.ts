import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Mock Mode ────────────────────────────────────────────────────
// When GOOGLE_MOCK_MODE=true or Google credentials are missing,
// the server returns realistic fixture data instead of calling Google APIs.
// This lets the agent loop work end-to-end without Google OAuth setup.

const useMock = process.env.GOOGLE_MOCK_MODE === 'true' || !process.env.GOOGLE_CLIENT_EMAIL

function loadMock(filename: string): unknown[] {
  const data = readFileSync(join(__dirname, 'mock-data', filename), 'utf-8')
  return JSON.parse(data)
}

function filterBySince(items: Array<Record<string, unknown>>, since: string, dateField: string): unknown[] {
  const sinceDate = new Date(since)
  return items.filter((item) => new Date(item[dateField] as string) > sinceDate)
}

// ── Helpers ──────────────────────────────────────────────────────

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true }
}

// ── Google API Client (lazy) ─────────────────────────────────────

async function getGoogleAuth() {
  const { google } = await import('googleapis')
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
  })
}

// ── Server ───────────────────────────────────────────────────────

const server = new McpServer({
  name: 'google-workspace',
  version: '1.0.0',
})

// ── Tool 1: get_recent_drive_activity ────────────────────────────

server.tool(
  'get_recent_drive_activity',
  'Returns recently modified files in a Google Drive folder. Shows who edited what and when. In mock mode, returns realistic fixture data.',
  {
    folder_id: z.string().describe('Google Drive folder ID'),
    since: z.string().describe('ISO 8601 timestamp — returns files modified after this time'),
  },
  async ({ folder_id, since }) => {
    if (useMock) {
      const all = loadMock('drive-activity.json') as Array<Record<string, unknown>>
      const filtered = filterBySince(all, since, 'last_modified')
      return jsonResult({
        source: 'mock',
        folder_id,
        since,
        count: filtered.length,
        files: filtered,
      })
    }

    try {
      const auth = await getGoogleAuth()
      const { google } = await import('googleapis')
      const drive = google.drive({ version: 'v3', auth })

      const res = await drive.files.list({
        q: `'${folder_id}' in parents and modifiedTime > '${since}'`,
        fields: 'files(id,name,mimeType,modifiedTime,lastModifyingUser)',
        orderBy: 'modifiedTime desc',
        pageSize: 50,
      })

      const files = (res.data.files ?? []).map((f) => ({
        file_name: f.name,
        file_type: f.mimeType,
        editors: [f.lastModifyingUser?.displayName ?? 'unknown'],
        last_modified: f.modifiedTime,
      }))

      return jsonResult({ source: 'live', folder_id, since, count: files.length, files })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool 2: get_calendar_events ──────────────────────────────────

server.tool(
  'get_calendar_events',
  'Returns calendar events for a date range. Shows meetings scheduled for today and tomorrow. In mock mode, returns realistic fixture data.',
  {
    calendar_id: z.string().default('primary').describe('Google Calendar ID (default: primary)'),
    start_date: z.string().describe('Start date (ISO 8601 date or datetime)'),
    end_date: z.string().describe('End date (ISO 8601 date or datetime)'),
  },
  async ({ calendar_id, start_date, end_date }) => {
    if (useMock) {
      const all = loadMock('calendar-events.json') as Array<Record<string, unknown>>
      return jsonResult({
        source: 'mock',
        calendar_id,
        range: { start: start_date, end: end_date },
        count: all.length,
        events: all,
      })
    }

    try {
      const auth = await getGoogleAuth()
      const { google } = await import('googleapis')
      const calendar = google.calendar({ version: 'v3', auth })

      const res = await calendar.events.list({
        calendarId: calendar_id,
        timeMin: new Date(start_date).toISOString(),
        timeMax: new Date(end_date).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 20,
      })

      const events = (res.data.items ?? []).map((e) => ({
        title: e.summary,
        start: e.start?.dateTime ?? e.start?.date,
        end: e.end?.dateTime ?? e.end?.date,
        attendees: e.attendees?.map((a) => a.displayName ?? a.email) ?? [],
        location: e.location ?? null,
      }))

      return jsonResult({ source: 'live', calendar_id, count: events.length, events })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool 3: get_recent_comments ──────────────────────────────────

server.tool(
  'get_recent_comments',
  'Returns recent comments on files in a Google Drive folder. Useful for identifying discussions and blockers. In mock mode, returns realistic fixture data.',
  {
    folder_id: z.string().describe('Google Drive folder ID'),
    since: z.string().describe('ISO 8601 timestamp — returns comments after this time'),
  },
  async ({ folder_id, since }) => {
    if (useMock) {
      const all = loadMock('comments.json') as Array<Record<string, unknown>>
      const filtered = filterBySince(all, since, 'timestamp')
      return jsonResult({
        source: 'mock',
        folder_id,
        since,
        count: filtered.length,
        comments: filtered,
      })
    }

    try {
      const auth = await getGoogleAuth()
      const { google } = await import('googleapis')
      const drive = google.drive({ version: 'v3', auth })

      // First get recently modified files
      const filesRes = await drive.files.list({
        q: `'${folder_id}' in parents and modifiedTime > '${since}'`,
        fields: 'files(id,name)',
        pageSize: 20,
      })

      const comments: Array<Record<string, unknown>> = []
      for (const file of filesRes.data.files ?? []) {
        try {
          const commentsRes = await drive.comments.list({
            fileId: file.id!,
            fields: 'comments(author,content,createdTime)',
            pageSize: 10,
          })

          for (const c of commentsRes.data.comments ?? []) {
            if (new Date(c.createdTime!) > new Date(since)) {
              comments.push({
                file_name: file.name,
                commenter: c.author?.displayName ?? 'unknown',
                comment_text: c.content,
                timestamp: c.createdTime,
              })
            }
          }
        } catch {
          // Skip files where comments API fails (e.g., non-Google Docs files)
        }
      }

      return jsonResult({ source: 'live', folder_id, since, count: comments.length, comments })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Start ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  if (useMock) {
    console.error('[google-workspace] Running in mock mode — returning fixture data')
  }
  await server.connect(transport)
}

main().catch((err) => {
  console.error('google-workspace MCP server failed to start:', err)
  process.exit(1)
})
