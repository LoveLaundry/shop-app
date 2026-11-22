/**
 * Pure helpers for the feature pack.
 *
 * Nothing in this module touches React, the DOM, storage or the network. That
 * keeps the table, form and session rules testable in isolation and lets the
 * tests import the file without a browser shim.
 */

export type SortDirection = 'asc' | 'desc'

export interface AssociationView {
  laundry_id: string
  laundry_name: string
  client_name: string
  client_type: string
  role_id: string
  status: string
}

export interface TableFilter<T> {
  search?: string
  searchable?: Array<(row: T) => string>
  status?: string
  statusOf?: (row: T) => string
  dateFrom?: string
  dateTo?: string
  dateOf?: (row: T) => string | null | undefined
}

export interface PageRange {
  page: number
  pageCount: number
  start: number
  end: number
  total: number
}

const SHOP_ROLES = ['SHOP_ADMIN', 'SHOP_STAFF'] as const
const GENERIC_ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'USER', 'CLIENT'] as const

/** Normalise free-form text from an API into something safe to render. */
export function normalizeText(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text || fallback
}

export function formatMoney(value: number | string | null | undefined, currency = 'LKR'): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number | string | null | undefined, maximumFractionDigits = 0): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-LK', { maximumFractionDigits }).format(amount)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Compact relative label used by last-updated and last-sign-in indicators. */
export function relativeTime(value: string | number | null | undefined, now = Date.now()): string {
  if (value === null || value === undefined || value === '') return '—'
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return '—'
  const seconds = Math.round((timestamp - now) / 1000)
  const future = seconds > 0
  const abs = Math.abs(seconds)
  if (abs < 45) return future ? 'in a moment' : 'just now'
  const units: Array<[number, string]> = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
  ]
  for (let i = units.length - 1; i >= 0; i -= 1) {
    const [size, name] = units[i]
    if (abs >= size) {
      const count = Math.round(abs / size)
      const label = `${count} ${name}${count === 1 ? '' : 's'}`
      return future ? `in ${label}` : `${label} ago`
    }
  }
  return future ? 'soon' : 'a while ago'
}

/** Turn any thrown value into one calm, user-facing sentence. */
export function normalizeError(error: unknown): string {
  if (typeof error === 'string' && error.trim()) return error.trim()
  if (error instanceof Error && error.message.trim()) return error.message.trim()
  const record = error as { response?: { status?: number; data?: unknown }; code?: string } | null
  const status = record?.response?.status
  const data = record?.response?.data as { detail?: unknown; message?: unknown } | undefined
  const detail = data?.detail ?? data?.message
  if (typeof detail === 'string' && detail.trim()) return detail.trim()
  if (status === 400) return 'One or more fields need attention. Check the highlighted fields.'
  if (status === 403) return 'This account does not have access to that action.'
  if (status === 404) return 'The requested information is not available yet.'
  if (status === 408 || record?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Try again.'
  }
  if (status === 409) return 'That action conflicts with the current state. Refresh and try again.'
  if (status && status >= 500) return 'The service is temporarily unavailable. Try again shortly.'
  if (!status && record?.code) return 'Cannot reach the server. Check your connection.'
  return 'Something went wrong. Try again.'
}

export function normalizeStatus(value: unknown, fallback = 'ACTIVE'): string {
  const status = normalizeText(value).toUpperCase()
  return status || fallback
}

/** Generic roles are never valid for this shop-scoped portal. */
export function isGenericRole(value: unknown): boolean {
  return (GENERIC_ROLES as readonly string[]).includes(normalizeText(value).toUpperCase())
}

export function isShopRole(value: unknown): boolean {
  return (SHOP_ROLES as readonly string[]).includes(normalizeText(value).toUpperCase())
}

/**
 * Shop roles only. Missing or generic roles fall back to the least-privileged
 * display role; the server remains the authority for what the token may do.
 */
export function normalizeRole(value: unknown, fallback: 'SHOP_ADMIN' | 'SHOP_STAFF' = 'SHOP_STAFF'): 'SHOP_ADMIN' | 'SHOP_STAFF' {
  const role = normalizeText(value).toUpperCase()
  return isShopRole(role) ? (role as 'SHOP_ADMIN' | 'SHOP_STAFF') : fallback
}

export function friendlyRole(value: unknown): string {
  const role = normalizeRole(value)
  return role === 'SHOP_ADMIN' ? 'Shop admin' : 'Shop staff'
}

/** Normalise a 409 multi-laundry candidate that may omit status and role. */
export function normalizeAssociation(raw: unknown): AssociationView {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    laundry_id: normalizeText(row.laundry_id),
    laundry_name: normalizeText(row.laundry_name, normalizeText(row.laundry_id, 'Laundry')),
    client_name: normalizeText(row.client_name),
    client_type: normalizeText(row.client_type, 'SHOP').toUpperCase(),
    role_id: normalizeRole(row.role_id),
    status: normalizeStatus(row.status),
  }
}

export function normalizeAssociations(raw: unknown): AssociationView[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAssociation).filter((item) => Boolean(item.laundry_id))
}

export function isActiveAssociation(item: AssociationView): boolean {
  return item.status === 'ACTIVE'
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/** Page numbers are zero-based; an out-of-range page is clamped, not blank. */
export function pageRange(page: number, pageSize: number, total: number): PageRange {
  const size = Math.max(1, Math.floor(pageSize))
  const count = Math.max(1, Math.ceil(total / size))
  const current = clamp(Math.floor(page), 0, count - 1)
  const start = total === 0 ? 0 : current * size + 1
  const end = Math.min(total, (current + 1) * size)
  return { page: current, pageCount: count, start, end, total }
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const size = Math.max(1, Math.floor(pageSize))
  const range = pageRange(page, size, rows.length)
  return rows.slice(range.page * size, range.end)
}

/** Search, status and inclusive date-range filtering over a row array. */
export function filterRows<T>(rows: T[], filter: TableFilter<T>): T[] {
  const term = normalizeText(filter.search).toLowerCase()
  const from = filter.dateFrom ? new Date(`${filter.dateFrom}T00:00:00`).getTime() : undefined
  const to = filter.dateTo ? new Date(`${filter.dateTo}T23:59:59`).getTime() : undefined

  return rows.filter((row) => {
    if (term && filter.searchable?.length) {
      const haystack = filter.searchable.map((get) => normalizeText(get(row)).toLowerCase()).join(' ')
      if (!haystack.includes(term)) return false
    }
    if (filter.status && filter.statusOf) {
      if (normalizeStatus(filter.statusOf(row)) !== normalizeStatus(filter.status)) return false
    }
    if ((from !== undefined || to !== undefined) && filter.dateOf) {
      const raw = filter.dateOf(row)
      const time = raw ? new Date(raw).getTime() : Number.NaN
      if (!Number.isFinite(time)) return false
      if (from !== undefined && time < from) return false
      if (to !== undefined && time > to) return false
    }
    return true
  })
}

/** Stable sort: equal values keep their original order. */
export function sortRows<T>(
  rows: T[],
  key: string | null,
  direction: SortDirection,
  getValue: (row: T, key: string) => string | number | null | undefined,
): T[] {
  if (!key) return rows
  const factor = direction === 'asc' ? 1 : -1
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const left = getValue(a.row, key)
      const right = getValue(b.row, key)
      const leftNumber = typeof left === 'number' ? left : Number.NaN
      const rightNumber = typeof right === 'number' ? right : Number.NaN
      let comparison: number
      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        comparison = leftNumber - rightNumber
      } else {
        comparison = normalizeText(left).localeCompare(normalizeText(right))
      }
      return comparison === 0 ? a.index - b.index : comparison * factor
    })
    .map(({ row }) => row)
}

/** Duplicate keys in a list, used to warn before sending an order. */
export function duplicateKeys<T>(rows: T[], keyOf: (row: T) => string): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  rows.forEach((row) => {
    const key = normalizeText(keyOf(row)).toLowerCase()
    if (!key) return
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  })
  return [...duplicates]
}

/** APIs sometimes return null, an object or a nested wrapper for items. */
export function normalizeItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
  }
  if (value && typeof value === 'object') {
    const wrapper = value as Record<string, unknown>
    for (const key of ['items', 'lines', 'data']) {
      if (Array.isArray(wrapper[key])) return normalizeItems(wrapper[key])
    }
  }
  return []
}

function toNumber(value: unknown): number {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
}

/** Shop Orders "Received" is derived from each item's received_qty only. */
export function receivedPiecesFromItems(value: unknown): number {
  return normalizeItems(value).reduce((sum, item) => sum + toNumber(item.received_qty), 0)
}

/** Sent quantities can live under several names depending on the endpoint. */
export function sentPiecesFromItems(value: unknown): number {
  return normalizeItems(value).reduce(
    (sum, item) => sum + toNumber(item.client_qty ?? item.quantity ?? item.received_qty),
    0,
  )
}

export interface ItemAggregate {
  lines: number
  sent: number
  received: number
  byName: Array<{ name: string; sent: number; received: number }>
}

/** Aggregate nested items once, so detail drawers and tables agree. */
export function aggregateItems(value: unknown): ItemAggregate {
  const items = normalizeItems(value)
  const named = new Map<string, { name: string; sent: number; received: number }>()
  items.forEach((item) => {
    const name = normalizeText(item.item_name ?? item.name ?? item.description, 'Unnamed item')
    const entry = named.get(name) ?? { name, sent: 0, received: 0 }
    entry.sent += toNumber(item.client_qty ?? item.quantity ?? item.received_qty)
    entry.received += toNumber(item.received_qty)
    named.set(name, entry)
  })
  return {
    lines: items.length,
    sent: sentPiecesFromItems(items),
    received: receivedPiecesFromItems(items),
    byName: [...named.values()],
  }
}

/** Guard against accidentally caching a runaway response. */
export function isResponseTooLarge(data: unknown, maxBytes = 2_000_000): boolean {
  try {
    return JSON.stringify(data).length > maxBytes
  } catch {
    return true
  }
}

/** Stable idempotency key for a retry of the same logical write. */
export function makeIdempotencyKey(prefix = 'shop-order', now = Date.now()): string {
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${now.toString(36)}-${random}`
}

export function retryDelay(attempt: number, base = 300, cap = 4000): number {
  const step = Math.max(0, Math.floor(attempt))
  return Math.min(cap, base * 2 ** step)
}

export function isRetryableStatus(status: number | undefined): boolean {
  return status === undefined || status === 408 || status === 425 || status === 429 || (status >= 500 && status < 600)
}

/** Cache keys include the session scope; one tenant can never read another's data. */
export function cacheKey(scope: string, path: string, params: Record<string, unknown> = {}): string {
  return `${scope || 'anonymous'}::${path}::${JSON.stringify(params)}`
}

export function toCsv(rows: Record<string, unknown>[], columns: Array<{ key: string; label: string }>): string {
  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  const head = columns.map((column) => escape(column.label)).join(',')
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(','))
  return [head, ...body].join('\r\n')
}

export function toJson(rows: unknown): string {
  return JSON.stringify(rows, null, 2)
}

/** Milliseconds until the JWT expires; zero when absent or already expired. */
export function sessionRemainingMs(token: string | null | undefined, now = Date.now()): number {
  if (!token) return 0
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: unknown }
    if (typeof payload.exp !== 'number') return 0
    return Math.max(0, payload.exp * 1000 - now)
  } catch {
    return 0
  }
}

export function isSessionExpiring(token: string | null | undefined, thresholdMs = 10 * 60 * 1000): boolean {
  const remaining = sessionRemainingMs(token)
  return remaining > 0 && remaining <= thresholdMs
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  hints: string[]
}

export function passwordStrength(value: string): PasswordStrength {
  const hints: string[] = []
  let score = 0
  if (value.length >= 8) score += 1
  else hints.push('Use at least 8 characters.')
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  else hints.push('Mix upper and lower case.')
  if (/\d/.test(value)) score += 1
  else hints.push('Add a number.')
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  else hints.push('Add a symbol.')
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: score as PasswordStrength['score'], label: labels[score], hints }
}

export type LoginErrors = Record<string, string | undefined>

export function validateLogin(username: string, password: string): LoginErrors {
  const errors: LoginErrors = {}
  if (username.trim().length < 3) errors.username = 'Enter the account username (3 characters or more).'
  if (!password) errors.password = 'Enter your password.'
  return errors
}

export interface OrderLineView {
  item_name: string
  quantity: string
  unit: string
}

export function isOrderLineValid(line: OrderLineView): boolean {
  const quantity = Number(line.quantity)
  return Boolean(line.item_name.trim()) && Number.isFinite(quantity) && quantity > 0
}

export function validateOrderLines(lines: OrderLineView[]): Record<string, string> {
  const errors: Record<string, string> = {}
  lines.forEach((line, index) => {
    if (!line.item_name.trim()) errors[`line-${index}-name`] = 'Name the item.'
    const quantity = Number(line.quantity)
    if (!line.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) {
      errors[`line-${index}-quantity`] = 'Use a quantity above zero.'
    }
  })
  return errors
}

export interface AccessRequestView {
  name: string
  email: string
  laundry: string
  reason: string
}

export function validateAccessRequest(value: AccessRequestView): Record<string, string> {
  const errors: Record<string, string> = {}
  if (value.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Enter a valid work email.'
  if (value.laundry.trim().length < 2) errors.laundry = 'Enter the laundry or account name.'
  if (value.reason.trim().length < 10) errors.reason = 'Give at least 10 characters of context.'
  return errors
}

export function isTruncated(text: string, maxLength: number): boolean {
  return text.length > maxLength
}

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

export function statusTone(status: string): string {
  const value = normalizeStatus(status)
  if (['PAID', 'DELIVERED', 'COMPLETED', 'APPROVED', 'ACTIVE', 'SCANNED'].includes(value)) return 'positive'
  if (['PENDING', 'DRAFT', 'PROCESSING', 'PARTIALLY_PAID', 'PARTIALLY_DELIVERED', 'IN_TRANSIT'].includes(value)) {
    return 'warning'
  }
  if (['CANCELLED', 'MISSING', 'DAMAGED', 'SUSPENDED', 'OVERDUE'].includes(value)) return 'danger'
  return 'neutral'
}

export function bulkLabel(count: number): string {
  if (count <= 0) return 'No rows selected'
  return `${count} row${count === 1 ? '' : 's'} selected`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
