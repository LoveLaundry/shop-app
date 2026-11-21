import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ClipboardList,
  FileText,
  Inbox,
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
  children,
}: {
  loading: boolean
  error: string | null
  empty?: boolean
  onRetry?: () => void
  children: ReactNode
}) {
  if (loading) {
    return (
      <div className="state-box">
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
      <div className="state-box">
        <div>
          <span className="state-icon is-error" aria-hidden="true">
            <Activity />
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
          <p className="state-box-text">Nothing here yet.</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
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
