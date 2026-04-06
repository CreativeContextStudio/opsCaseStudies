import { pgSchema, uuid, text, timestamp, integer, boolean, date, jsonb } from 'drizzle-orm/pg-core'

export const marketSchema = pgSchema('market')

export const sectorProfiles = marketSchema.table('sector_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  keywords: text('keywords').notNull(),
  watchlistCompanies: text('watchlist_companies'),
  themes: text('themes'),
  recipientEmail: text('recipient_email'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const ingestedItems = marketSchema.table('ingested_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull(),
  title: text('title').notNull(),
  url: text('url'),
  publishedAt: timestamp('published_at').notNull(),
  sourceType: text('source_type').notNull(),
  rawSnippet: text('raw_snippet'),
  relevanceScore: integer('relevance_score').notNull(),
  category: text('category').notNull(),
  briefingIncluded: boolean('briefing_included').default(false).notNull(),
  briefingId: uuid('briefing_id'),
  ingestedAt: timestamp('ingested_at').defaultNow().notNull(),
})

export const marketBriefings = marketSchema.table('market_briefings', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull(),
  runId: uuid('run_id'),
  date: date('date').notNull(),
  itemsIngested: integer('items_ingested').notNull(),
  itemsIncluded: integer('items_included').notNull(),
  executiveSummary: text('executive_summary').notNull(),
  fullBriefing: text('full_briefing').notNull(),
  deliveredTo: text('delivered_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
