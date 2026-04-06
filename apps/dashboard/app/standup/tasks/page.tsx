import Link from 'next/link'
import { getActiveProject, getAllTasks } from '../../lib/queries'
import { formatMonthDay } from '../../lib/format'

export const dynamic = 'force-dynamic'

const STATUS_ORDER = ['blocked', 'in_progress', 'not_started', 'done'] as const
const STATUS_LABEL: Record<string, string> = {
  blocked: 'BLOCKED', in_progress: 'IN PROGRESS', not_started: 'NOT STARTED', done: 'DONE',
}
const STATUS_COLOR: Record<string, string> = {
  blocked: 'bg-error', in_progress: 'bg-secondary', not_started: 'bg-outline-variant', done: 'bg-ink',
}
const STATUS_TEXT: Record<string, string> = {
  blocked: 'text-error', in_progress: 'text-secondary', not_started: 'text-outline', done: 'text-ink/40',
}

export default async function TaskDatabase({
  searchParams,
}: {
  searchParams: Promise<{ workstream?: string; status?: string; assignee?: string }>
}) {
  const params = await searchParams
  const project = await getActiveProject()
  if (!project) return <div className="p-12 text-outline">No active project.</div>

  const allTasks = await getAllTasks(project.id)

  // Extract unique values for filters
  const workstreams = [...new Set(allTasks.map((t: any) => t.workstream).filter(Boolean))] as string[]
  const assignees = [...new Set(allTasks.map((t: any) => t.assignee))] as string[]
  const statuses = STATUS_ORDER.filter(s => allTasks.some((t: any) => t.status === s))

  // Apply filters
  let filtered = allTasks as any[]
  if (params.workstream) filtered = filtered.filter(t => t.workstream?.toLowerCase() === params.workstream!.toLowerCase())
  if (params.status) filtered = filtered.filter(t => t.status === params.status)
  if (params.assignee) filtered = filtered.filter(t => t.assignee === params.assignee)

  // Group by workstream
  const grouped: Record<string, any[]> = {}
  for (const t of filtered) {
    const ws = t.workstream ?? 'Other'
    if (!grouped[ws]) grouped[ws] = []
    grouped[ws].push(t)
  }

  // Sort tasks within groups by status priority then due date
  for (const ws of Object.keys(grouped)) {
    grouped[ws].sort((a: any, b: any) => {
      const si = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      if (si !== 0) return si
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
  }

  // Summary counts
  const total = filtered.length
  const done = filtered.filter((t: any) => t.status === 'done').length
  const inProgress = filtered.filter((t: any) => t.status === 'in_progress').length
  const blocked = filtered.filter((t: any) => t.status === 'blocked').length
  const notStarted = filtered.filter((t: any) => t.status === 'not_started').length

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <Link href="/standup" className="label text-[9px] text-outline hover:text-ink transition-colors">
          &larr; Back to overview
        </Link>
        <h1 className="font-headline text-3xl font-bold text-ink mt-4 tracking-tight">Task Database</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          {project.name} — {total} tasks across {Object.keys(grouped).length} workstream{Object.keys(grouped).length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary strip */}
      <div className="flex items-end gap-10 mt-8 pb-6 border-b border-outline-variant/10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <SummaryStat label="Total" value={total} />
        <SummaryStat label="Done" value={done} />
        <SummaryStat label="In Progress" value={inProgress} />
        <SummaryStat label="Blocked" value={blocked} highlight={blocked > 0} />
        <SummaryStat label="Not Started" value={notStarted} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mt-6 animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <span className="label text-[9px]">Filter:</span>
        <FilterChip label="All" href="/standup/tasks" active={!params.workstream && !params.status && !params.assignee} />
        {workstreams.map(ws => (
          <FilterChip
            key={ws}
            label={ws}
            href={`/standup/tasks?workstream=${ws.toLowerCase()}`}
            active={params.workstream?.toLowerCase() === ws.toLowerCase()}
          />
        ))}
        <span className="w-[1px] h-4 bg-outline-variant/20 mx-1" />
        {statuses.map(s => (
          <FilterChip
            key={s}
            label={STATUS_LABEL[s]}
            href={`/standup/tasks?status=${s}${params.workstream ? `&workstream=${params.workstream}` : ''}`}
            active={params.status === s}
          />
        ))}
      </div>

      {/* Task table grouped by workstream */}
      <div className="mt-8 space-y-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {Object.entries(grouped).map(([ws, tasks]) => {
          const wsDone = tasks.filter((t: any) => t.status === 'done').length
          return (
            <div key={ws}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <h2 className="label text-[9px] text-ink">{ws.toUpperCase()}</h2>
                  <span className="font-body text-xs text-outline">{wsDone}/{tasks.length} done</span>
                </div>
                <div className="h-[2px] flex-1 mx-4 bg-outline-variant/10 overflow-hidden">
                  <div className="h-full bg-ink transition-all" style={{ width: `${tasks.length > 0 ? (wsDone / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-surface-lowest shadow-ambient">
                {tasks.map((task: any, i: number) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 px-5 py-3 ${i < tasks.length - 1 ? 'border-b border-outline-variant/5' : ''} ${task.status === 'done' ? 'opacity-50' : ''}`}
                  >
                    {/* Status indicator */}
                    <span className={`w-2 h-2 mt-1.5 shrink-0 ${STATUS_COLOR[task.status] ?? 'bg-outline-variant'}`} />

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-body text-sm ${task.status === 'done' ? 'line-through text-outline' : 'text-ink'}`}>
                          {task.name}
                        </span>
                      </div>
                      {task.blockers && (
                        <p className="font-body text-xs text-error mt-0.5">{task.blockers}</p>
                      )}
                      {task.notes && task.status !== 'done' && (
                        <p className="font-body text-xs text-outline mt-0.5">{task.notes}</p>
                      )}
                    </div>

                    {/* Assignee */}
                    <span className="font-body text-xs text-secondary w-16 shrink-0 text-right">{task.assignee}</span>

                    {/* Status */}
                    <span className={`label text-[8px] w-24 shrink-0 text-right ${STATUS_TEXT[task.status]}`}>
                      {STATUS_LABEL[task.status]}
                    </span>

                    {/* Priority */}
                    <span className={`label text-[8px] w-8 shrink-0 text-right ${task.priority === 'P0' ? 'text-ink font-bold' : 'text-outline'}`}>
                      {task.priority}
                    </span>

                    {/* Due date */}
                    <span className="font-body text-xs text-outline tabular-nums w-16 shrink-0 text-right">
                      {task.due_date ? formatMonthDay(task.due_date) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <span className="label block text-[9px]">{label}</span>
      <span className={`font-headline text-2xl font-bold ${highlight ? 'text-error' : 'text-ink'}`}>{value}</span>
    </div>
  )
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`label text-[9px] px-3 py-1 transition-colors ${
        active ? 'bg-ink text-on-ink' : 'bg-surface-highest/40 text-on-surface-variant hover:bg-surface-highest'
      }`}
    >
      {label}
    </Link>
  )
}
