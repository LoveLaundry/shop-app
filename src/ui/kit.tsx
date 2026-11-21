import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
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
      <div className="stat-top">
        <span className="stat-icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="stat-trend" aria-hidden="true">
          <ArrowUpRight />
          Live
        </span>
      </div>
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
            <CircleAlert />
          </span>
          <p className="state-box-text state-box-error">{error}</p>
          {onRetry ? (
            <button type="button" onClick={onRetry} className="btn btn-secondary" style={{ marginTop: '0.85rem' }}>
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

const STATUS_TONE: Record<string, { className: string; icon: LucideIcon }> = {
  RECEIVED: { className: 'chip', icon: Activity },
  PROCESSING: { className: 'chip chip-warning', icon: LoaderCircle },
  READY_FOR_DELIVERY: { className: 'chip', icon: Package },
  PARTIALLY_DELIVERED: { className: 'chip chip-warning', icon: Truck },
  DELIVERED: { className: 'chip chip-positive', icon: CircleCheck },
  CANCELLED: { className: 'chip chip-danger', icon: CircleAlert },
  PAID: { className: 'chip chip-positive', icon: CircleCheck },
  ISSUED: { className: 'chip', icon: ReceiptText },
  PENDING: { className: 'chip chip-warning', icon: LoaderCircle },
  PARTIALLY_PAID: { className: 'chip chip-warning', icon: Wallet },
  DRAFT: { className: 'chip', icon: FileText },
  APPROVED: { className: 'chip chip-positive', icon: CircleCheck },
  COMPLETED: { className: 'chip chip-positive', icon: CircleCheck },
  IN_TRANSIT: { className: 'chip', icon: Truck },
  SCANNED: { className: 'chip chip-positive', icon: CircleCheck },
  DAMAGED: { className: 'chip chip-danger', icon: CircleAlert },
  MISSING: { className: 'chip chip-danger', icon: CircleAlert },
}

export function StatusChip({ status }: { status: string | null | undefined }) {
  const value = (status ?? '').toUpperCase()
  const tone = STATUS_TONE[value] ?? { className: 'chip', icon: Activity }
  const Icon = tone.icon
  return (
    <span className={tone.className}>
      <Icon aria-hidden="true" />
      {value.replaceAll('_', ' ') || '—'}
    </span>
  )
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
