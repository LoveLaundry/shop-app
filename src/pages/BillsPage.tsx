import { useState } from 'react'
import { formatDate, formatMoney, useQuery } from '../api/hooks'
import { PageHeader, Panel, StateBox, StatusChip, Table } from '../ui/kit'

interface ShopBill {
  id?: string
  bill_number?: string
  client_name?: string
  created_at?: string
  grand_total?: number
  paid_amount?: number
  outstanding_amount?: number
  payment_status?: string
}

interface Response {
  items: ShopBill[]
  total: number
}

const PAGE_SIZE = 20

export function BillsPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')

  const { data, error, loading, reload } = useQuery<Response>('/shop-bills', {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: applied || undefined,
  })

  const total = data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader title="Bills" subtitle="Every bill raised at the counter" />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setPage(0)
          setApplied(search.trim())
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search bill number or customer"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      <StateBox loading={loading} error={error} empty={data?.items.length === 0} onRetry={reload}>
        <Table head={['Bill', 'Customer', 'Date', 'Total', 'Paid', 'Outstanding', 'Status']}>
          {(data?.items ?? []).map((bill, index) => (
            <tr key={bill.id ?? `${bill.bill_number}-${index}`} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{bill.bill_number || '—'}</td>
              <td className="px-4 py-3 text-slate-600">{bill.client_name || 'Walk-in'}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(bill.created_at)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMoney(bill.grand_total)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatMoney(bill.paid_amount)}</td>
              <td className="px-4 py-3 tabular-nums font-semibold">
                {formatMoney(bill.outstanding_amount)}
              </td>
              <td className="px-4 py-3">
                <StatusChip status={bill.payment_status} />
              </td>
            </tr>
          ))}
        </Table>
      </StateBox>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Page {page + 1} of {pages} · {total} bills
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
            disabled={page >= pages - 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  )
}

export function BillsHint() {
  return (
    <Panel>
      <p className="text-sm text-slate-500">Search runs server-side against bill number and customer.</p>
    </Panel>
  )
}
