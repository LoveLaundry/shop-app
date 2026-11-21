import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  FileText,
  Inbox,
  Info,
  LayoutDashboard,
  LoaderCircle,
  Package,
  ReceiptText,
  RefreshCw,
  Shirt,
  Ticket,
  Truck,
  Wallet,
} from 'lucide-react'

function headerIcon(title: string): LucideIcon {
  const value = title.toLowerCase()
  if (value.includes('bill') || value.includes('invoice')) return ReceiptText
  if (value.includes('order') || value.includes('deliver')) return Package
  if (value.includes('linen')) return Shirt
  if (value.includes('gate')) return Ticket
  if (value.includes('account') || value.includes('overview')) return LayoutDashboard
  return Activity
}

function statIcon(label: string): LucideIcon {
  const value = label.toLowerCase()
  if (value.includes('balance') || value.includes('amount') || value.includes('due')) return Wallet
  if (value.includes('bill') || value.includes('invoice')) return ReceiptText
  if (value.includes('order')) return Package
  if (value.includes('linen') || value.includes('piece')) return Shirt
  if (value.includes('deliver')) return Truck
  if (value.includes('gate')) return Ticket
  if (value.includes('receiv') || value.includes('issued')) return FileText
  return ClipboardList
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const Icon = headerIcon(title)
  return (
    <div className="page-header">
      <span className="page-icon" aria-hidden="true">
        <Icon />
      </span>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const Icon = statIcon(label)
  return (
    <div className="stat-card">
      <span className="stat-icon" aria-hidden="true">
        <Icon />
      </span>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `panel panel-pad ${className}` : 'panel panel-pad'}>{children}</div>
}

export function StateBox({
  loading,
  error,
  empty,
  onRetry,
  emptyTitle = 'Nothing here yet.',
  emptyDetail,
  children,
}: {
  loading: boolean
  error: string | null
  empty?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDetail?: string
  children: ReactNode
}) {
  if (loading) {
    return (
      <div className="state-box" role="status">
        <div>
          <span className="state-icon is-loading" aria-hidden="true">
            <LoaderCircle />
          </span>
          <p className="state-box-text">Loading…</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="state-box" role="alert">
        <div>
          <span className="state-icon is-error" aria-hidden="true">
            <CircleAlert />
          </span>
          <p className="state-box-text state-box-error">{error}</p>
          {onRetry ? (
            <button type="button" onClick={onRetry} className="btn btn-secondary" style={{ marginTop: '0.8rem' }}>
              <RefreshCw />
              Try again
            </button>
          ) : null}
        </div>
      </div>
    )
  }
  if (empty) {
    return (
      <div className="state-box">
        <div>
          <span className="state-icon" aria-hidden="true">
            <Inbox />
          </span>
          <p className="state-box-text">{emptyTitle}</p>
          {emptyDetail ? <p className="state-box-detail">{emptyDetail}</p> : null}
        </div>
      </div>
    )
  }
  return <>{children}</>
}

const NOTICE_ICONS: Record<string, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: Activity,
  danger: CircleAlert,
}

/** A short, scoped message that sits inline with page content. */
export function Notice({
  tone = 'info',
  title,
  action,
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  const Icon = NOTICE_ICONS[tone]
  return (
    <div className={`notice notice--${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
        {action ? <div className="notice-action">{action}</div> : null}
      </div>
    </div>
  )
}

/** Consistent range label + prev/next controls for list screens. */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  label = 'records',
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  label?: string
}) {
  const pageCount = Math.ceil(total / pageSize)
  if (pageCount <= 1) return null
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min(total, (page + 1) * pageSize)
  return (
    <div className="pagination">
      <span>
        Showing {start}–{end} of {total} {label}
      </span>
      <div className="pagination-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="pagination-count">
          {page + 1} / {pageCount}
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPage(page + 1)}
          disabled={page + 1 >= pageCount}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  )
}

const STATUS_TONE: Record<string, string> = {
  RECEIVED: 'chip',
  PROCESSING: 'chip chip-warning',
  READY_FOR_DELIVERY: 'chip',
  PARTIALLY_DELIVERED: 'chip chip-warning',
  DELIVERED: 'chip chip-positive',
  CANCELLED: 'chip chip-danger',
  PAID: 'chip chip-positive',
  ISSUED: 'chip',
  PENDING: 'chip chip-warning',
  PARTIALLY_PAID: 'chip chip-warning',
  DRAFT: 'chip',
  APPROVED: 'chip chip-positive',
  COMPLETED: 'chip chip-positive',
  IN_TRANSIT: 'chip',
  SCANNED: 'chip chip-positive',
  DAMAGED: 'chip chip-danger',
  MISSING: 'chip chip-danger',
}

export function StatusChip({ status }: { status: string | null | undefined }) {
  const value = (status ?? '').toUpperCase()
  return <span className={STATUS_TONE[value] ?? 'chip'}>{value.replaceAll('_', ' ') || '—'}</span>
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {head.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
