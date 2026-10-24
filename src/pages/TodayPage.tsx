import { formatMoney, useQuery } from '../api/hooks'
import { PageHeader, Stat, StateBox } from '../ui/kit'

interface Overview {
  total_bills: number
  total_revenue: number
  total_paid: number
  total_outstanding: number
}

export function TodayPage() {
  const { data, error, loading, reload } = useQuery<Overview>('/shop-bills/stats/overview')

  return (
    <>
      <PageHeader title="Today" subtitle="Where the shop counter stands right now" />

      <StateBox loading={loading} error={error} onRetry={reload}>
        {data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Bills" value={String(data.total_bills)} hint="All shop bills" />
            <Stat label="Billed" value={formatMoney(data.total_revenue)} />
            <Stat label="Collected" value={formatMoney(data.total_paid)} />
            <Stat
              label="Outstanding"
              value={formatMoney(data.total_outstanding)}
              hint="Still owed by customers"
            />
          </div>
        ) : null}
      </StateBox>

      <p className="mt-6 max-w-prose text-sm text-slate-500">
        These totals are aggregated by the billing service across every shop bill for this
        laundry. The screen performs no arithmetic of its own.
      </p>
    </>
  )
}
