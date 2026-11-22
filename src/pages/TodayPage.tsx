import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Package, ReceiptText, RefreshCw, ShieldCheck } from 'lucide-react'
import { formatMoney, useCachedQuery, useFeature } from '../features/feature-pack'
import { friendlyRole, relativeTime } from '../features/feature-pack/utils'
import { useGlobalRefresh, usePageShortcuts } from '../features/feature-pack/hooks'
import { LastUpdated, SkeletonRows } from '../features/feature-pack/components'
import { useAuth } from '../auth/AuthContext'
import { PageHeader, Stat, StateBox } from '../ui/kit'

interface Summary {
  shop: string
  laundry_id: string
  open_bills: number
  outstanding_amount: number
  invoiced_this_month: number
  scanned?: string | null
  currency: string
}

export function TodayPage() {
  const { user, lastSignIn } = useAuth()
  const navigate = useNavigate()
  const { publishNotifications, pendingOrders, toast } = useFeature()
  const { data, error, loading, revalidating, updatedAt, reload } = useCachedQuery<Summary>('/client-portal/shop/summary')

  usePageShortcuts(reload, () => undefined)
  useGlobalRefresh(reload)

  const notifications = useMemo(() => {
    if (!data) return []
    const items = []
    if (data.open_bills > 0) {
      items.push({
        id: 'summary-open-bills',
        title: `${data.open_bills} open bill${data.open_bills === 1 ? '' : 's'}`,
        detail: 'Review the outstanding invoices for this account.',
        tone: 'warning' as const,
        actionLabel: 'Review bills',
        onAction: () => { void navigate('/bills') },
      })
    }
    if (Number(data.outstanding_amount) > 0) {
      items.push({
        id: 'summary-balance',
        title: 'Balance outstanding',
        detail: `${formatMoney(data.outstanding_amount)} is still due on this account.`,
        tone: 'info' as const,
      })
    }
    if (pendingOrders.length > 0) {
      items.push({
        id: 'summary-pending',
        title: 'Orders waiting to send',
        detail: `${pendingOrders.length} order${pendingOrders.length === 1 ? '' : 's'} have not been confirmed by the server yet.`,
        tone: 'warning' as const,
      })
    }
    return items
  }, [data, pendingOrders.length])

  useEffect(() => {
    publishNotifications('account-summary', notifications)
  }, [notifications, publishNotifications])

  useEffect(() => {
    if (error) toast(`Account summary could not be refreshed: ${error}`, 'error', 'Retry', reload)
    // Only react to a new error message, not every toast identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <>
      <PageHeader
        title={data?.shop ?? 'Account'}
        subtitle={`Your account with this laundry — ${friendlyRole(user?.role)} access, scoped to this laundry only`}
      />

      <div className="fp-page-actions">
        <LastUpdated at={updatedAt} refreshing={revalidating} />
        <button type="button" className="btn btn-secondary" onClick={reload} aria-label="Refresh account summary">
          <RefreshCw aria-hidden="true" /> Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="panel panel-pad mb-4" aria-label="Loading account summary">
          <SkeletonRows count={3} />
        </div>
      ) : null}

      <StateBox
        loading={false}
        error={error}
        empty={!loading && !error && !data}
        onRetry={reload}
        emptyTitle="Account summary is unavailable"
        emptyDetail="Your provider has not published a summary for this account yet."
      >
        {data ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Open bills"
              value={String(data.open_bills ?? 0)}
              hint="Issued and not yet settled"
            />
            <Stat
              label="Balance"
              value={formatMoney(data.outstanding_amount, data.currency)}
              hint="Outstanding across all bills"
            />
            <Stat
              label="Invoiced this month"
              value={formatMoney(data.invoiced_this_month, data.currency)}
              hint="Excludes cancelled bills"
            />
          </div>
        ) : null}
      </StateBox>

      {lastSignIn ? (
        <p className="fp-signin-note">
          <ShieldCheck aria-hidden="true" />
          Last signed in as {lastSignIn.username} {relativeTime(lastSignIn.at)}.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link to="/bills" className="panel panel-pad quick-link flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <ReceiptText className="text-accent" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Review bills</span>
              <span className="block text-xs text-slate-500">Line items, payments and balances</span>
            </span>
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link to="/orders" className="panel panel-pad quick-link flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <Package className="text-accent" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Track orders</span>
              <span className="block text-xs text-slate-500">What you sent and what was received</span>
            </span>
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}
