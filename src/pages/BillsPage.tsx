import { useState } from 'react'
import { formatDate, formatMoney, useQuery } from '../api/hooks'
import { PageHeader, Panel, StateBox, StatusChip, Table } from '../ui/kit'

interface ShopBill {
  id: string
  bill_number: string | null
  created_at: string | null
  delivery_date: string | null
  grand_total: number
  paid_amount: number
  balance: number
  payment_status: string
  status: string
  total_quantity?: number
}

interface Response {
  total: number
  items: ShopBill[]
}

const PAGE_SIZE = 25

export function BillsPage() {
  const [skip, setSkip] = useState(0)
  const { data, error, loading, reload } = useQuery<Response>('/client-portal/shop/bills', {
    skip,
    limit: PAGE_SIZE,
  })

  const total = data?.total ?? 0
  const from = total === 0 ? 0 : skip + 1
  const to = Math.min(skip + PAGE_SIZE, total)

  return (
    <>
      <PageHeader
        title="Bills"
        subtitle="Bills this shop has with the laundry currently selected"
      />

      <StateBox loading={loading} error={error} onRetry={reload}>
        <Panel className="overflow-hidden">
          {data && data.items.length > 0 ? (
            <Table
              head={['Bill', 'Issued', 'Delivery', 'Total', 'Paid', 'Balance', 'Status']}
            >
              {data.items.map((bill) => (
                <tr key={bill.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-medium">{bill.bill_number ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(bill.created_at)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(bill.delivery_date)}</td>
                  <td className="px-4 py-2.5 tabular-nums">{formatMoney(bill.grand_total)}</td>
                  <td className="px-4 py-2.5 tabular-nums">{formatMoney(bill.paid_amount)}</td>
                  <td className="px-4 py-2.5 tabular-nums font-medium">
                    {formatMoney(bill.balance)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusChip status={bill.payment_status} />
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              No bills with this laundry yet.
            </p>
          )}
        </Panel>

        {total > PAGE_SIZE ? (
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>
              Showing {from}–{to} of {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                disabled={skip === 0}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setSkip(skip + PAGE_SIZE)}
                disabled={to >= total}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </StateBox>
    </>
  )
}
