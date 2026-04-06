/**
 * Safely parse a date value from Neon.
 * Postgres `date` columns come back as ISO datetime strings like "2026-04-06T04:00:00.000Z".
 * This normalizes them into a reliable Date object.
 */
export function parseDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  return new Date()
}

/** "Mon, Apr 6" */
export function formatShortDate(value: unknown): string {
  const d = parseDate(value)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** "Monday, April 6, 2026" */
export function formatLongDate(value: unknown): string {
  const d = parseDate(value)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

/** "6" (day only) */
export function formatDay(value: unknown): string {
  const d = parseDate(value)
  return d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
}

/** "Apr 6" */
export function formatMonthDay(value: unknown): string {
  const d = parseDate(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
