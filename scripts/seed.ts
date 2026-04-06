/**
 * Seed script for Agentic Project Standup — Case Study #1
 *
 * Creates the "Meridian Platform Redesign" demo project with:
 * - 42 tasks across 3 workstreams (Design, Engineering, Content)
 * - 6 team members with realistic work patterns
 * - 14 days of standup history with a deliberate narrative arc
 *
 * Narrative arc:
 *   Days 1-5:  Smooth sailing — normal velocity, no blockers
 *   Days 6-8:  Cracks appear — Sarah's design review overdue, API task stalls
 *   Days 9-11: Cascade — design delay blocks content, Alex overloaded, dependency chain at risk
 *   Days 12-14: Resolution — blockers resolved, velocity recovers
 *
 * Run: npm run db:seed (from root)
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../packages/db/src/schema/index.js'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ── Helpers ──────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(6, 0, 0, 0)
  return d
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return dateStr(d)
}

const today = dateStr(new Date())
const PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

// ── Seed: Project ────────────────────────────────────────────────

async function seedProject() {
  await db.insert(schema.projects).values({
    id: PROJECT_ID,
    name: 'Meridian Platform Redesign',
    module: 'standup',
    config: {
      slackChannel: '#meridian-standup',
      execEmailList: 'exec-team@meridian.io',
      gitRepo: 'meridian-labs/platform-redesign',
      gdriveFolderId: '1BxiMVs0XRAx4fMoLLJx_Z6nR',
      standupTime: '06:00',
      timezone: 'America/New_York',
    },
    active: true,
  })
  console.log('✓ Project created: Meridian Platform Redesign')
}

// ── Seed: Tasks (42 total) ───────────────────────────────────────

interface TaskSeed {
  name: string
  assignee: string
  status: string
  dueDate: string
  priority: string
  workstream: string
  blockers: string | null
  notes: string | null
  lastModified: Date
}

function buildTasks(): TaskSeed[] {
  const tasks: TaskSeed[] = []

  // ── Design workstream (14 tasks) — Sarah (lead), assisted by Jordan on UI
  tasks.push(
    { name: 'Design system audit & gap analysis', assignee: 'Sarah', status: 'done', dueDate: daysFromNow(-10), priority: 'P1', workstream: 'Design', blockers: null, notes: 'Completed — 23 inconsistencies documented', lastModified: daysAgo(12) },
    { name: 'Navigation redesign — wireframes', assignee: 'Sarah', status: 'done', dueDate: daysFromNow(-8), priority: 'P0', workstream: 'Design', blockers: null, notes: 'Approved by stakeholders', lastModified: daysAgo(9) },
    { name: 'Navigation redesign — high-fidelity mockups', assignee: 'Sarah', status: 'done', dueDate: daysFromNow(-5), priority: 'P0', workstream: 'Design', blockers: null, notes: null, lastModified: daysAgo(6) },
    { name: 'Dashboard layout — wireframes', assignee: 'Sarah', status: 'done', dueDate: daysFromNow(-4), priority: 'P1', workstream: 'Design', blockers: null, notes: null, lastModified: daysAgo(5) },
    { name: 'Dashboard layout — high-fidelity mockups', assignee: 'Sarah', status: 'done', dueDate: daysFromNow(-2), priority: 'P1', workstream: 'Design', blockers: null, notes: 'Minor revisions requested by PM', lastModified: daysAgo(3) },
    { name: 'Client review — design presentation', assignee: 'Sarah', status: 'blocked', dueDate: daysFromNow(-2), priority: 'P0', workstream: 'Design', blockers: 'Waiting on client availability — rescheduled twice', notes: 'Was due 2 days ago. Client team in offsite this week.', lastModified: daysAgo(3) },
    { name: 'Settings page — wireframes', assignee: 'Sarah', status: 'in_progress', dueDate: daysFromNow(1), priority: 'P1', workstream: 'Design', blockers: null, notes: '60% complete', lastModified: daysAgo(1) },
    { name: 'Settings page — high-fidelity mockups', assignee: 'Sarah', status: 'not_started', dueDate: daysFromNow(4), priority: 'P1', workstream: 'Design', blockers: null, notes: 'Depends on wireframe approval', lastModified: daysAgo(5) },
    { name: 'Mobile responsive audit', assignee: 'Sarah', status: 'not_started', dueDate: daysFromNow(7), priority: 'P2', workstream: 'Design', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Icon set refresh', assignee: 'Jordan', status: 'done', dueDate: daysFromNow(-3), priority: 'P2', workstream: 'Design', blockers: null, notes: '48 icons updated to new style', lastModified: daysAgo(4) },
    { name: 'Component library — button variants', assignee: 'Jordan', status: 'done', dueDate: daysFromNow(-1), priority: 'P1', workstream: 'Design', blockers: null, notes: null, lastModified: daysAgo(2) },
    { name: 'Component library — form elements', assignee: 'Jordan', status: 'in_progress', dueDate: daysFromNow(2), priority: 'P1', workstream: 'Design', blockers: null, notes: '40% complete — inputs and selects done, need checkboxes and radio', lastModified: daysAgo(0) },
    { name: 'Animation & micro-interaction spec', assignee: 'Sarah', status: 'not_started', dueDate: daysFromNow(10), priority: 'P2', workstream: 'Design', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Design handoff documentation', assignee: 'Sarah', status: 'not_started', dueDate: daysFromNow(12), priority: 'P1', workstream: 'Design', blockers: null, notes: 'Blocked until client review completes', lastModified: daysAgo(8) },
  )

  // ── Engineering workstream (18 tasks) — Marcus (backend), Jordan (frontend), Chen (QA)
  tasks.push(
    { name: 'API scaffolding — auth + middleware', assignee: 'Marcus', status: 'done', dueDate: daysFromNow(-9), priority: 'P0', workstream: 'Engineering', blockers: null, notes: 'JWT + refresh token flow implemented', lastModified: daysAgo(10) },
    { name: 'Database schema migration — v2', assignee: 'Marcus', status: 'done', dueDate: daysFromNow(-7), priority: 'P0', workstream: 'Engineering', blockers: null, notes: 'Migrated to new schema, backward compat maintained', lastModified: daysAgo(8) },
    { name: 'API — user management endpoints', assignee: 'Marcus', status: 'done', dueDate: daysFromNow(-5), priority: 'P0', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(6) },
    { name: 'API — dashboard data endpoints', assignee: 'Marcus', status: 'in_progress', dueDate: daysFromNow(-1), priority: 'P0', workstream: 'Engineering', blockers: null, notes: 'No commits since Monday. Waiting on design mockup finalization for data shape.', lastModified: daysAgo(4) },
    { name: 'API — settings CRUD', assignee: 'Marcus', status: 'not_started', dueDate: daysFromNow(3), priority: 'P1', workstream: 'Engineering', blockers: null, notes: 'Depends on settings page wireframes', lastModified: daysAgo(8) },
    { name: 'API — notification service', assignee: 'Marcus', status: 'not_started', dueDate: daysFromNow(6), priority: 'P1', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Frontend — navigation component', assignee: 'Jordan', status: 'done', dueDate: daysFromNow(-4), priority: 'P0', workstream: 'Engineering', blockers: null, notes: 'Matches approved mockups', lastModified: daysAgo(5) },
    { name: 'Frontend — dashboard layout', assignee: 'Jordan', status: 'in_progress', dueDate: daysFromNow(1), priority: 'P0', workstream: 'Engineering', blockers: null, notes: 'Skeleton done, needs API integration once endpoints ready', lastModified: daysAgo(1) },
    { name: 'Frontend — auth flow (login/signup)', assignee: 'Jordan', status: 'done', dueDate: daysFromNow(-3), priority: 'P0', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(4) },
    { name: 'Frontend — settings page', assignee: 'Jordan', status: 'not_started', dueDate: daysFromNow(5), priority: 'P1', workstream: 'Engineering', blockers: null, notes: 'Blocked on settings wireframes from Sarah', lastModified: daysAgo(8) },
    { name: 'CI/CD pipeline setup', assignee: 'Marcus', status: 'done', dueDate: daysFromNow(-8), priority: 'P1', workstream: 'Engineering', blockers: null, notes: 'GitHub Actions + Vercel preview deploys', lastModified: daysAgo(9) },
    { name: 'Performance baseline — Lighthouse audit', assignee: 'Chen', status: 'done', dueDate: daysFromNow(-6), priority: 'P2', workstream: 'Engineering', blockers: null, notes: 'Score: 72 performance, 95 accessibility', lastModified: daysAgo(7) },
    { name: 'QA — auth flow test suite', assignee: 'Chen', status: 'done', dueDate: daysFromNow(-2), priority: 'P1', workstream: 'Engineering', blockers: null, notes: '14 tests, all passing', lastModified: daysAgo(3) },
    { name: 'QA — navigation test suite', assignee: 'Chen', status: 'in_progress', dueDate: daysFromNow(1), priority: 'P1', workstream: 'Engineering', blockers: null, notes: '8 of 12 tests written', lastModified: daysAgo(1) },
    { name: 'QA — dashboard integration tests', assignee: 'Chen', status: 'not_started', dueDate: daysFromNow(4), priority: 'P1', workstream: 'Engineering', blockers: null, notes: 'Blocked on dashboard API endpoints', lastModified: daysAgo(6) },
    { name: 'API — search & filtering', assignee: 'Marcus', status: 'not_started', dueDate: daysFromNow(8), priority: 'P2', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Frontend — error boundary & fallbacks', assignee: 'Jordan', status: 'not_started', dueDate: daysFromNow(9), priority: 'P2', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Load testing — 1000 concurrent users', assignee: 'Chen', status: 'not_started', dueDate: daysFromNow(11), priority: 'P2', workstream: 'Engineering', blockers: null, notes: null, lastModified: daysAgo(10) },
  )

  // ── Content workstream (10 tasks) — Alex (content lead), Priya (PM oversight)
  tasks.push(
    { name: 'Content audit — existing platform copy', assignee: 'Alex', status: 'done', dueDate: daysFromNow(-8), priority: 'P1', workstream: 'Content', blockers: null, notes: '147 strings cataloged', lastModified: daysAgo(9) },
    { name: 'Tone & voice guidelines document', assignee: 'Alex', status: 'done', dueDate: daysFromNow(-6), priority: 'P1', workstream: 'Content', blockers: null, notes: 'Approved by marketing', lastModified: daysAgo(7) },
    { name: 'Navigation labels & microcopy', assignee: 'Alex', status: 'done', dueDate: daysFromNow(-4), priority: 'P0', workstream: 'Content', blockers: null, notes: null, lastModified: daysAgo(5) },
    { name: 'Dashboard copy — headings, descriptions, empty states', assignee: 'Alex', status: 'in_progress', dueDate: daysFromNow(0), priority: 'P0', workstream: 'Content', blockers: 'Waiting on finalized dashboard mockups from design', notes: 'Started writing against wireframes but need hi-fi for empty state illustrations', lastModified: daysAgo(1) },
    { name: 'Settings page copy', assignee: 'Alex', status: 'not_started', dueDate: daysFromNow(3), priority: 'P1', workstream: 'Content', blockers: null, notes: 'Depends on settings wireframes', lastModified: daysAgo(8) },
    { name: 'Error messages & validation copy', assignee: 'Alex', status: 'not_started', dueDate: daysFromNow(4), priority: 'P1', workstream: 'Content', blockers: null, notes: null, lastModified: daysAgo(8) },
    { name: 'Onboarding flow copy', assignee: 'Alex', status: 'not_started', dueDate: daysFromNow(6), priority: 'P1', workstream: 'Content', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Help documentation — 10 articles', assignee: 'Alex', status: 'not_started', dueDate: daysFromNow(10), priority: 'P2', workstream: 'Content', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Release notes template', assignee: 'Alex', status: 'not_started', dueDate: daysFromNow(8), priority: 'P2', workstream: 'Content', blockers: null, notes: null, lastModified: daysAgo(10) },
    { name: 'Project status report — client-facing', assignee: 'Priya', status: 'in_progress', dueDate: daysFromNow(0), priority: 'P1', workstream: 'Content', blockers: null, notes: 'Weekly report due today. Compiling updates from all workstreams.', lastModified: daysAgo(0) },
  )

  return tasks
}

async function seedTasks() {
  const tasks = buildTasks()
  for (const t of tasks) {
    await db.insert(schema.tasks).values({
      projectId: PROJECT_ID,
      name: t.name,
      assignee: t.assignee,
      status: t.status,
      dueDate: t.dueDate,
      priority: t.priority,
      workstream: t.workstream,
      blockers: t.blockers,
      notes: t.notes,
      lastModified: t.lastModified,
    })
  }
  console.log(`✓ ${tasks.length} tasks seeded across 3 workstreams`)
}

// ── Seed: 14-day standup history ─────────────────────────────────

interface DayBriefs {
  day: number
  blockersCount: number
  atRiskCount: number
  teamBrief: string
  execBrief: string
  clientBrief: string
}

function buildStandupHistory(): DayBriefs[] {
  return [
    // ── Days 1-5: Smooth sailing ──
    {
      day: 14, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 1)**

**Completed:**
- ✅ Design system audit & gap analysis (Sarah) — 23 inconsistencies documented
- ✅ API scaffolding — auth + middleware (Marcus) — JWT + refresh token flow implemented

**In Progress:**
- 🔄 Navigation redesign — wireframes (Sarah) — 70% complete, on track for Thursday
- 🔄 Database schema migration — v2 (Marcus) — started today
- 🔄 Content audit — existing platform copy (Alex) — cataloging strings

**Blockers:** None

**Decisions Needed:** None

**Summary:** Strong start. Design and engineering both kicked off cleanly. Sarah's wireframes are tracking ahead of schedule. Marcus has auth scaffolding done which unblocks frontend work next week.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 1)**

All workstreams launched on schedule. Design audit complete (23 gaps identified — none critical). Auth infrastructure in place. No blockers. First client-facing deliverable (navigation wireframes) expected Thursday.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 1)**

Work is underway across all three workstreams. The design team has completed an initial audit and is now developing navigation wireframes, which we expect to share for your review later this week. On the engineering side, the authentication foundation is in place. Content planning has begun with a comprehensive audit of the existing platform copy. Everything is on track for our agreed milestones.`,
    },
    {
      day: 13, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 2)**

**Completed:**
- ✅ CI/CD pipeline setup (Marcus) — GitHub Actions + Vercel preview deploys
- ✅ Content audit — existing platform copy (Alex) — 147 strings cataloged

**In Progress:**
- 🔄 Navigation redesign — wireframes (Sarah) — 90% complete
- 🔄 Database schema migration — v2 (Marcus) — 50% through migration
- 🔄 Tone & voice guidelines document (Alex) — first draft in review

**Blockers:** None
**Decisions Needed:** None

**Summary:** Steady progress. CI/CD is live so every PR gets a preview deploy. Sarah's wireframes nearly done. Alex finished the content audit fast — 147 strings to review.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 2)**

Day 2 continues clean. CI/CD pipeline operational — all code changes now get automated preview deployments. Navigation wireframes at 90%, ahead of Thursday target. Content audit surfaced 147 strings for review. No risks.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 2)**

Development infrastructure is fully operational with automated preview deployments for every change. Navigation wireframes are nearly complete and on track for your review this week. Our content team has completed a thorough audit of the existing platform, identifying 147 content items to update as part of the redesign. Momentum is strong across all teams.`,
    },
    {
      day: 12, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 3)**

**Completed:**
- ✅ Navigation redesign — wireframes (Sarah) — approved by stakeholders
- ✅ Database schema migration — v2 (Marcus) — migration complete, backward compat maintained
- ✅ Tone & voice guidelines document (Alex) — approved by marketing

**In Progress:**
- 🔄 Navigation redesign — high-fidelity mockups (Sarah) — starting today
- 🔄 API — user management endpoints (Marcus) — 30% complete
- 🔄 Navigation labels & microcopy (Alex) — drafting

**Blockers:** None
**Decisions Needed:** None

**Summary:** Big day. Three deliverables completed. Sarah's wireframes approved on first review — moving to hi-fi. Database migration landed without issues. Content guidelines locked.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 3)**

Three milestones completed today: navigation wireframes approved, database migration complete, and content voice guidelines finalized. All on or ahead of schedule. Sarah moving to high-fidelity mockups. No blockers or risks.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 3)**

Significant progress today. The navigation wireframes have been reviewed and approved, and we're now moving into high-fidelity visual design. Our database migration is complete, ensuring a smooth technical foundation. Content guidelines have been finalized, which will ensure consistency across the new platform. We're tracking ahead of schedule on several deliverables.`,
    },
    {
      day: 11, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 4)**

**Completed:**
- ✅ API — user management endpoints (Marcus)
- ✅ Navigation labels & microcopy (Alex)
- ✅ Performance baseline — Lighthouse audit (Chen) — Score: 72 perf, 95 a11y

**In Progress:**
- 🔄 Navigation redesign — high-fidelity mockups (Sarah) — 50% complete
- 🔄 Dashboard layout — wireframes (Sarah) — starting in parallel
- 🔄 Frontend — navigation component (Jordan) — building against approved wireframes
- 🔄 Frontend — auth flow (Jordan) — 60% complete

**Blockers:** None
**Decisions Needed:** None

**Summary:** Engineering velocity is strong. Marcus shipping endpoints fast. Jordan building frontend components against approved designs. Chen established our performance baseline. Sarah juggling nav mockups and dashboard wireframes in parallel.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 4)**

Engineering at full velocity — user management API complete, frontend auth flow 60% done. Performance baseline established (72 performance, 95 accessibility — solid starting point). Design running two tracks in parallel (nav mockups + dashboard wireframes). Content on track. Zero blockers.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 4)**

The engineering team is making excellent progress with core functionality taking shape. We've established a performance baseline to measure improvements against. Visual design for the navigation is progressing well, and we've begun wireframing the dashboard layout. Content for navigation elements is complete and ready for implementation.`,
    },
    {
      day: 10, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 5)**

**Completed:**
- ✅ Navigation redesign — high-fidelity mockups (Sarah)
- ✅ Frontend — navigation component (Jordan) — matches approved mockups
- ✅ Frontend — auth flow (Jordan)
- ✅ Dashboard layout — wireframes (Sarah)
- ✅ Icon set refresh (Jordan) — 48 icons updated

**In Progress:**
- 🔄 Dashboard layout — high-fidelity mockups (Sarah) — starting Monday
- 🔄 API — dashboard data endpoints (Marcus) — started today
- 🔄 QA — auth flow test suite (Chen) — writing tests

**Blockers:** None
**Decisions Needed:** None

**Summary:** Massive week. Five deliverables completed today alone. End of week 1 and we're ahead on design, on track for engineering, and content is keeping pace. Clean sweep — zero blockers all week.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 5)**

Exceptional week 1. Five deliverables shipped today. Navigation design complete through hi-fi, frontend nav component built, auth flow done, dashboard wireframes approved, icon refresh complete. All three workstreams on or ahead of schedule. Zero blockers across 5 days. Week 2 focus: dashboard mockups, API endpoints, and QA.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 5)**

Week one has been outstanding. The navigation design is complete through final visual design, and we'll be sharing those with you shortly. The dashboard wireframes are ready for your review, which we'd like to schedule early next week. Authentication functionality is fully built and tested. We completed a refresh of the icon set (48 icons updated). All milestones for week one have been met or exceeded.`,
    },

    // ── Days 6-8: Cracks appear ──
    {
      day: 7, blockersCount: 1, atRiskCount: 1,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 6)**

**Completed:**
- ✅ Dashboard layout — high-fidelity mockups (Sarah) — minor revisions requested by Priya
- ✅ QA — auth flow test suite (Chen) — 14 tests, all passing

**In Progress:**
- 🔄 Client review — design presentation (Sarah) — ⚠️ was scheduled for today, client rescheduled
- 🔄 API — dashboard data endpoints (Marcus) — in progress but no commits since Friday
- 🔄 Component library — button variants (Jordan)
- 🔄 Dashboard copy (Alex) — started writing against wireframes

**🚨 Blockers:**
- **Client review — design presentation** (Sarah) — Waiting on client availability. Was scheduled for today, rescheduled to Wednesday. This blocks design handoff for engineering.

**⚠️ At Risk:**
- **API — dashboard data endpoints** (Marcus) — Due yesterday, no commits since Friday. Marcus may be waiting on design mockup finalization for data shape.

**Decisions Needed:**
- Should Marcus proceed with dashboard endpoints based on wireframes, or wait for finalized mockups?

**Summary:** First real friction. Client review pushed back — not in our control but it cascades. Marcus's dashboard endpoints haven't moved which is unusual for him. Need to check if he's blocked on design decisions.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 6)**

- **On track** overall but two items need attention
- **Blocked:** Client design review rescheduled — was today, moved to Wednesday. This delays design handoff
- **At risk:** Dashboard API endpoints (Marcus) — due yesterday, no commits since Friday. May be waiting on design decisions
- **Decision needed:** Should engineering proceed with dashboard work based on wireframes or wait for final mockups?
- Auth QA complete (14 tests passing). Dashboard mockups done pending client review.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 6)**

Dashboard visual designs are complete and ready for your review — we understand your team's schedule shifted this week, and we've rescheduled the presentation for Wednesday. In the meantime, quality assurance on the authentication system is complete with all tests passing. The engineering team continues building out dashboard functionality. We're monitoring a few timeline items to ensure we stay on track.`,
    },
    {
      day: 6, blockersCount: 1, atRiskCount: 2,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 7)**

**Completed:**
- ✅ Component library — button variants (Jordan)

**In Progress:**
- 🔄 Client review — design presentation (Sarah) — still waiting, now rescheduled to Thursday
- 🔄 API — dashboard data endpoints (Marcus) — ⚠️ still no new commits. Confirmed: waiting on mockup data shape
- 🔄 Component library — form elements (Jordan) — 40% complete
- 🔄 Dashboard copy (Alex) — continuing with wireframe-based content
- 🔄 Settings page — wireframes (Sarah) — started, 30% complete
- 🔄 QA — navigation test suite (Chen) — 4 of 12 tests written

**🚨 Blockers:**
- **Client review — design presentation** (Sarah) — Rescheduled again from Wednesday to Thursday. Two reschedules now. Client team in offsite this week.

**⚠️ At Risk:**
- **API — dashboard data endpoints** (Marcus) — Now 2 days overdue. Marcus confirmed he's blocked on final mockup data requirements. Proceeding with wireframe-based implementation.
- **Dashboard copy** (Alex) — Writing against wireframes but needs hi-fi mockups for empty state illustrations. Partially blocked by design review delay.

**Decisions Needed:** None — Marcus unblocked himself by proceeding with wireframes.

**Summary:** The client review delay is starting to cascade. Marcus was genuinely blocked, now proceeding with wireframe-based work. Alex can keep writing but will need revisions once mockups are finalized. Sarah smartly pivoted to settings wireframes while waiting.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 7)**

- **Blocked:** Client design review rescheduled a second time (now Thursday). Client team is in an offsite this week.
- **Cascading impact:** Marcus's dashboard endpoints were blocked on design data shape (now proceeding with wireframes). Content writing will need revisions post-review.
- **Mitigated:** Marcus self-unblocked. Sarah pivoted to settings wireframes. Team adapting well.
- No action needed from leadership — monitoring.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 7)**

We understand your team's offsite makes scheduling challenging this week. We've adjusted our timeline and moved the design presentation to Thursday. In the meantime, our teams are continuing productive work: the component library is expanding, the engineering team is building dashboard functionality based on approved wireframes, and content development is progressing. We've proactively adapted our workflow to minimize any impact on the overall timeline.`,
    },
    {
      day: 5, blockersCount: 2, atRiskCount: 2,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 8)**

**Completed:** None today.

**In Progress:**
- 🔄 Client review — still Thursday (tomorrow)
- 🔄 API — dashboard data endpoints (Marcus) — resumed work, wireframe-based. 60% complete.
- 🔄 Component library — form elements (Jordan) — inputs and selects done, need checkboxes and radio
- 🔄 Settings page — wireframes (Sarah) — 60% complete
- 🔄 Dashboard copy (Alex) — ⚠️ partially blocked. Has 5 other content tasks queued behind this.
- 🔄 QA — navigation test suite (Chen) — 8 of 12 tests written
- 🔄 Project status report (Priya) — compiling updates

**🚨 Blockers:**
- **Client review** (Sarah) — Tomorrow. If this slips again, design handoff delays by a full week.
- **Dashboard copy — empty states** (Alex) — Cannot write empty state copy without seeing final mockup illustrations.

**⚠️ At Risk:**
- **Alex's workload** — Alex has 6 content tasks remaining, 4 due within the next 7 days. If dashboard copy revisions are needed post-review, this becomes a capacity issue.
- **Design → Content → Engineering dependency chain** — Client review → mockup revisions → content update → frontend integration. Each day of delay on review adds 1+ day to the chain.

**Summary:** No completions today — unusual. Everything is in motion but nothing crossed the finish line. Tomorrow's client review is the bottleneck. If it holds, we recover. If it slips a third time, we need to escalate.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 8)**

- **Critical:** Client design review is tomorrow. If it slips a third time, the design → content → engineering dependency chain delays by 5+ days.
- **At risk:** Alex has 6 content tasks in the next 7 days. Post-review revisions could create a capacity bottleneck.
- **No completions today** — all work is mid-stream. This is a natural mid-sprint trough, not a velocity problem.
- **Recommendation:** If client review slips tomorrow, escalate to get it scheduled within 24 hours.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 8)**

We're looking forward to tomorrow's design presentation where we'll walk through the navigation and dashboard visual designs. Multiple workstreams are converging this week — the engineering team has made strong progress on dashboard functionality, our component library continues to expand, and content development is advancing. Your feedback in tomorrow's review will help us fine-tune several deliverables in parallel.`,
    },

    // ── Days 9-11: Cascade ──
    {
      day: 4, blockersCount: 2, atRiskCount: 3,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 9)**

**Completed:**
- ✅ Client review — design presentation (Sarah) — ✅ FINALLY happened! Approved with minor revisions to dashboard layout. Nav approved as-is.

**In Progress:**
- 🔄 Dashboard layout — revisions per client feedback (Sarah) — estimated 1 day
- 🔄 API — dashboard data endpoints (Marcus) — 80% but needs revision to match updated mockup
- 🔄 Dashboard copy (Alex) — can now see final mockups but needs revised versions first
- 🔄 Settings page — wireframes (Sarah) — paused to handle dashboard revisions
- 🔄 Component library — form elements (Jordan) — 70% complete
- 🔄 QA — navigation test suite (Chen) — 10 of 12 tests

**🚨 Blockers:**
- **Dashboard copy — empty states** (Alex) — Needs revised mockups from Sarah. Sarah is revising now but Alex is bottlenecked until those land.
- **API — dashboard endpoints revision** (Marcus) — Client feedback changed two data display requirements. Marcus needs ~4 hours to adjust.

**⚠️ At Risk:**
- **Alex — capacity** — 5 tasks in next 6 days. Dashboard copy still blocked pending mockup revisions. Once unblocked, revision time eats into other tasks.
- **Settings page wireframes** (Sarah) — Paused while Sarah handles dashboard revisions. Due date at risk.
- **QA — dashboard integration tests** (Chen) — Can't start until dashboard API is stable. Due in 4 days.

**Summary:** The client review happened — that's the good news. But the revisions create a 1-2 day ripple. Sarah has to revise mockups before Alex can finalize copy, before Jordan can integrate. Marcus needs to adjust API endpoints. The cascade is real but manageable if revisions complete by tomorrow EOD.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 9)**

- **Resolved:** Client design review completed. Navigation approved. Dashboard approved with minor revisions.
- **New risk:** Revision cascade — Sarah revising mockups → Alex waiting for revised mockups → Marcus adjusting API. 1-2 day ripple across all workstreams.
- **Capacity flag:** Alex has 5 content deliverables in 6 days. The revision wait time compresses an already tight schedule.
- **Impact:** Settings wireframes paused. Dashboard integration testing delayed. Manageable if revisions complete by tomorrow EOD.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 9)**

Thank you for the design review today — great feedback. Navigation design is approved and moving to implementation. We're incorporating your dashboard feedback now and expect to have revised visuals ready within a day. The engineering team continues building, and we're coordinating across all workstreams to keep momentum strong. We'll share the updated dashboard designs as soon as they're ready.`,
    },
    {
      day: 3, blockersCount: 1, atRiskCount: 3,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 10)**

**Completed:**
- ✅ Dashboard layout — revisions (Sarah) — client feedback incorporated, mockups updated
- ✅ QA — navigation test suite (Chen) — 12/12 tests passing

**In Progress:**
- 🔄 API — dashboard data endpoints (Marcus) — adjusting to revised data shape. 90% complete.
- 🔄 Dashboard copy (Alex) — UNBLOCKED. Revised mockups received. Writing empty state copy now. Working late to catch up.
- 🔄 Settings page — wireframes (Sarah) — resumed, 60% complete
- 🔄 Component library — form elements (Jordan) — finishing checkboxes
- 🔄 Frontend — dashboard layout (Jordan) — skeleton done, waiting on API

**🚨 Blockers:**
- **Frontend — dashboard integration** (Jordan) — Skeleton is ready but can't integrate until Marcus completes API revision. Expected tomorrow.

**⚠️ At Risk:**
- **Alex — capacity** — Now has 5 tasks in 5 days. Working extended hours. Dashboard copy should complete tomorrow but leaves no buffer for remaining tasks.
- **Dashboard integration tests** (Chen) — Waiting on stable API. Due in 3 days. Tight.
- **Settings page wireframes** (Sarah) — Due tomorrow. At 60%. Tight but doable.

**Summary:** Cascade is resolving. Sarah's revisions done — that unblocked Alex and will unblock Marcus tomorrow. But the compression is real. Alex is working late. Chen is waiting. Tomorrow is the day everything needs to land.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 10)**

- **Improving:** Dashboard revisions complete. Content team unblocked. API adjustments at 90%.
- **Capacity concern:** Alex working extended hours — 5 deliverables in 5 days, no buffer. Monitor for quality impact.
- **Tomorrow is key:** API completion unblocks frontend integration and QA. If it lands, we recover. If it slips, QA timeline is at risk.
- Nav QA complete (12/12 tests passing).`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 10)**

Dashboard designs have been updated with your feedback and are now in implementation. The navigation test suite is complete and passing. All teams are progressing on their current deliverables. We expect the dashboard functionality to come together over the next two days as design, engineering, and content components converge. Settings page wireframes are in progress and we'll have those ready for discussion soon.`,
    },
    {
      day: 2, blockersCount: 0, atRiskCount: 2,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 11)**

**Completed:**
- ✅ API — dashboard data endpoints (Marcus) — finally done. 4 days late but solid implementation.
- ✅ Dashboard copy — headings, descriptions, empty states (Alex) — completed late last night. Working against revised mockups.
- ✅ Component library — form elements (Jordan) — all variants complete

**In Progress:**
- 🔄 Frontend — dashboard layout (Jordan) — NOW integrating with API. Estimated 1 day.
- 🔄 Settings page — wireframes (Sarah) — 80%, will complete today
- 🔄 QA — dashboard integration tests (Chen) — started today, API is now stable
- 🔄 Project status report (Priya) — updating with this week's recovery

**⚠️ At Risk:**
- **Alex — remaining content tasks** — 4 tasks in 4 days. Settings copy, error messages, onboarding flow, release notes. Doable but zero margin.
- **QA — dashboard integration tests** (Chen) — Started today, due in 2 days. Tight timeline.

**Summary:** THE LOGJAM BROKE. Three major deliverables completed. Dashboard API, dashboard copy, and form components all landed. Jordan can now build the real dashboard. Chen can write integration tests. The cascade from the client review delay cost us about 3 days but the team adapted well. Alex is the person to watch — working hard, no buffer left.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 11)**

- **Recovery:** Three key deliverables completed. Dashboard API (4 days late, now done), dashboard copy, and component library all landed.
- **Unblocked:** Frontend integration and QA testing both started.
- **Watch:** Alex has 4 content deliverables in 4 days — no buffer. Consider whether any P2 items can shift.
- **Overall:** Project recovering from the client review delay. Expect to be back on track by end of week.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 11)**

Great momentum today. The dashboard API is complete, content has been finalized for all dashboard screens, and our component library is fully built out. The frontend team is now assembling the dashboard experience, bringing together design, content, and functionality. Quality testing is underway. We're on track for a productive end to the week and will have substantial progress to show you at our next checkpoint.`,
    },

    // ── Days 12-14: Resolution ──
    {
      day: 1, blockersCount: 0, atRiskCount: 1,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 12)**

**Completed:**
- ✅ Settings page — wireframes (Sarah) — completed, ready for review
- ✅ Frontend — dashboard layout (Jordan) — integrated with API, data flowing
- ✅ QA — dashboard integration tests (Chen) — 10 tests written, 9 passing, 1 edge case to fix

**In Progress:**
- 🔄 Settings page — high-fidelity mockups (Sarah) — started
- 🔄 Settings page copy (Alex) — started today
- 🔄 Error messages & validation copy (Alex) — 30% complete
- 🔄 Frontend — settings page (Jordan) — building against wireframes
- 🔄 API — settings CRUD (Marcus) — started today

**⚠️ At Risk:**
- **Alex — workload** — 3 remaining tasks in 3 days. On pace but still no buffer.

**Summary:** The project has turned the corner. Dashboard is integrated end-to-end. Settings workstream is kicking off across all three tracks simultaneously. The team learned from the dashboard cascade — design, engineering, and content all started settings work on the same day instead of sequentially. Good adaptation.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 12)**

- **Recovered:** Dashboard fully integrated — design, API, content, and frontend all connected. QA tests 90% passing.
- **Adaptation:** Settings workstream launched all three tracks (design, eng, content) simultaneously, avoiding the sequential delay that hit dashboard. Team learning.
- **Remaining risk:** Alex's capacity tight but manageable.
- **On track** for next week's milestones.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 12)**

The dashboard experience is now fully functional with live data, content, and polished design — a major milestone. Quality testing is nearly complete with excellent results. We've also kicked off the settings section across design, engineering, and content simultaneously to maintain momentum. The team has hit a strong rhythm and we're well-positioned heading into next week.`,
    },
    {
      day: 0, blockersCount: 0, atRiskCount: 0,
      teamBrief: `**Meridian Platform Redesign — Daily Standup (Day 13)**

**Completed:**
- ✅ QA — dashboard integration tests (Chen) — all 10 passing, edge case fixed
- ✅ Error messages & validation copy (Alex) — complete

**In Progress:**
- 🔄 Settings page — high-fidelity mockups (Sarah) — 50% complete
- 🔄 Settings page copy (Alex) — 70% complete
- 🔄 API — settings CRUD (Marcus) — 60% complete
- 🔄 Frontend — settings page (Jordan) — building against wireframes, will integrate when mockups land
- 🔄 Onboarding flow copy (Alex) — started today, 20%

**Blockers:** None
**At Risk:** None — Alex found his rhythm. Pace is sustainable.

**Summary:** Clean day. Dashboard QA complete — zero bugs in production path. Settings progressing across all tracks. Alex knocked out error copy and started onboarding flow — back to normal velocity. The client review cascade cost us about 3 days total but the team's recovery has been impressive. Currently 1 day behind original schedule overall, which is recoverable.`,

      execBrief: `**Meridian Platform Redesign — Executive Summary (Day 13)**

- **Dashboard complete:** All tests passing. Production-ready.
- **Settings on track:** All three tracks progressing in parallel.
- **Schedule:** 1 day behind original timeline (client review cascade). Fully recoverable — no milestone dates at risk.
- **No blockers, no risks.** Clean board.`,

      clientBrief: `**Meridian Platform Redesign — Progress Update (Day 13)**

The dashboard has passed all quality tests and is production-ready — a key milestone for the project. Work on the settings section is progressing well across design, engineering, and content. We're also developing content for the onboarding experience and error handling. The project is in a strong position heading into the final stretch of this sprint.`,
    },
  ]
}

async function seedStandupHistory() {
  const history = buildStandupHistory()
  let runCount = 0

  for (const day of history) {
    const runDate = daysAgo(day.day)

    // Create system run record
    const [run] = await db.insert(schema.systemRuns).values({
      projectId: PROJECT_ID,
      module: 'standup',
      status: 'success',
      startedAt: runDate,
      completedAt: new Date(runDate.getTime() + 45_000), // ~45 seconds
      tokenCount: 8000 + Math.floor(Math.random() * 4000),
      toolCalls: 8 + Math.floor(Math.random() * 4),
      metadata: { model: 'claude-sonnet-4-20250514', version: '1.0.0' },
    }).returning()

    // Create standup history record
    await db.insert(schema.standupHistory).values({
      projectId: PROJECT_ID,
      runId: run.id,
      date: dateStr(runDate),
      teamBrief: day.teamBrief,
      execBrief: day.execBrief,
      clientBrief: day.clientBrief,
      blockersCount: day.blockersCount,
      atRiskCount: day.atRiskCount,
    })

    // Create output log entries
    for (const [type, content] of [
      ['team_brief', day.teamBrief],
      ['exec_brief', day.execBrief],
      ['client_brief', day.clientBrief],
    ] as const) {
      await db.insert(schema.outputLog).values({
        runId: run.id,
        outputType: type,
        content,
        deliveredAt: new Date(runDate.getTime() + 60_000),
        deliveryStatus: 'delivered',
      })
    }

    runCount++
  }

  console.log(`✓ ${runCount} days of standup history seeded (with system runs + output logs)`)
}

// ── Main ─────────────────────────────────────────────────────────

async function cleanup() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`DELETE FROM public.output_log WHERE run_id IN (SELECT id FROM public.system_runs WHERE project_id = ${PROJECT_ID})`
  await sql`DELETE FROM standup.client_updates WHERE project_id = ${PROJECT_ID}`
  await sql`DELETE FROM standup.standup_history WHERE project_id = ${PROJECT_ID}`
  await sql`DELETE FROM public.system_runs WHERE project_id = ${PROJECT_ID}`
  await sql`DELETE FROM standup.tasks WHERE project_id = ${PROJECT_ID}`
  await sql`DELETE FROM public.projects WHERE id = ${PROJECT_ID}`
  console.log('✓ Cleaned up existing seed data')
}

async function main() {
  console.log('\n🌱 Seeding Agentic Project Standup...\n')

  await cleanup()
  await seedProject()
  await seedTasks()
  await seedStandupHistory()

  console.log('\n✅ Seed complete.\n')
  console.log('   Project: Meridian Platform Redesign')
  console.log('   Tasks: 42 across 3 workstreams')
  console.log('   History: 14 days of standups (days 1-5 clean, 6-8 cracks, 9-11 cascade, 12-14 recovery)')
  console.log('   System runs: 14 (one per standup)')
  console.log('   Output logs: 42 (3 briefs × 14 days)')
  console.log('')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
