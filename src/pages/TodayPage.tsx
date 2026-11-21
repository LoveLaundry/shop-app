import { Link } from 'react-router-dom'
import { ArrowRight, ReceiptText, Package } from 'lucide-react'
import { formatMoney, useQuery } from '../api/hooks'
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
  const { data, error, loading, reload } = useQuery<Summary>('/client-portal/shop/summary')

  return (
    <>
      <PageHeader
        title={data?.shop ?? 'Account'}
        subtitle="Your account with this laundry — only this laundry's records are visible"
      />

      <StateBox
        loading={loading}
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
              value={formatMoney(data.outstanding_amount)}
              hint="Outstanding across all bills"
            />
            <Stat
              label="Invoiced this month"
              value={formatMoney(data.invoiced_this_month)}
              hint="Excludes cancelled bills"
            />
          </div>
        ) : null}
      </StateBox>

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
