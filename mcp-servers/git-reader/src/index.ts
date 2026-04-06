import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { Octokit } from '@octokit/rest'
import { z } from 'zod'

// ── Helpers ──────────────────────────────────────────────────────

function getOctokit() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN environment variable is required')
  return new Octokit({ auth: token })
}

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true }
}

// ── Server ───────────────────────────────────────────────────────

const server = new McpServer({
  name: 'git-reader',
  version: '1.0.0',
})

// ── Tool 1: get_recent_commits ───────────────────────────────────

server.tool(
  'get_recent_commits',
  'Returns recent commits from a GitHub repository since a given timestamp. Useful for detecting code activity and identifying stalled tasks.',
  {
    owner: z.string().describe('GitHub repo owner (user or org)'),
    repo: z.string().describe('GitHub repo name'),
    since: z.string().describe('ISO 8601 timestamp — returns commits after this time'),
    max_results: z.number().int().min(1).max(100).default(50).describe('Maximum commits to return (default 50)'),
  },
  async ({ owner, repo, since, max_results }) => {
    try {
      const octokit = getOctokit()
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        since,
        per_page: max_results,
      })

      const commits = data.map((c) => ({
        sha: c.sha.substring(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author?.name ?? c.author?.login ?? 'unknown',
        date: c.commit.author?.date,
        url: c.html_url,
      }))

      return jsonResult({
        repo: `${owner}/${repo}`,
        since,
        count: commits.length,
        commits,
      })
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
        return errorResult(`Repository ${owner}/${repo} not found or not accessible`)
      }
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool 2: get_open_prs ────────────────────────────────────────

server.tool(
  'get_open_prs',
  'Returns open pull requests for a GitHub repository. Useful for understanding code review status and pending work.',
  {
    owner: z.string().describe('GitHub repo owner (user or org)'),
    repo: z.string().describe('GitHub repo name'),
  },
  async ({ owner, repo }) => {
    try {
      const octokit = getOctokit()
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 30,
      })

      const prs = data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        author: pr.user?.login ?? 'unknown',
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        draft: pr.draft,
        reviewers: pr.requested_reviewers?.map((r) => ('login' in r ? r.login : r.name)) ?? [],
        labels: pr.labels.map((l) => (typeof l === 'string' ? l : l.name)),
        url: pr.html_url,
      }))

      return jsonResult({
        repo: `${owner}/${repo}`,
        open_count: prs.length,
        pull_requests: prs,
      })
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
        return errorResult(`Repository ${owner}/${repo} not found or not accessible`)
      }
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Start ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('git-reader MCP server failed to start:', err)
  process.exit(1)
})
