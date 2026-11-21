import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  )
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat-card">
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
        <p className="state-box-text">Loading…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="state-box">
        <div>
          <p className="state-box-text state-box-error">{error}</p>
          {onRetry ? (
            <button type="button" onClick={onRetry} className="btn btn-secondary" style={{ marginTop: '0.85rem' }}>
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
        <p className="state-box-text">Nothing here yet.</p>
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
  CANCELLED: 'chip',
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
  const tone = STATUS_TONE[value] ?? 'chip'
  return <span className={tone}>{value.replaceAll('_', ' ') || '—'}</span>
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="data-table-wrap panel">
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
