import { useState } from 'react'
import { X } from 'lucide-react'
import { dataApi, errorMessage } from '../api/client'
import { formatDate, formatMoney, useQuery } from '../api/hooks'
import { Notice, PageHeader, Pagination, Panel, StateBox, StatusChip, Table } from '../ui/kit'

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

interface BillLine {
  item_name?: string
  quantity?: number
  unit_price?: number
  amount?: number
}

interface BillDetail extends ShopBill {
  items?: BillLine[]
  notes?: string | null
}

interface Response {
  total: number
  items: ShopBill[]
}

const PAGE_SIZE = 25
const STATUSES = ['PENDING', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']

export function BillsPage() {
  const [page, setPage] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [detail, setDetail] = useState<BillDetail | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)

  // This endpoint names its page cursor `offset` (not `skip`). Sending the
  // wrong key silently pinned every page to the first 25 bills.
  const { data, error, loading, reload } = useQuery<Response>('/client-portal/shop/bills', {
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    status: paymentStatus || undefined,
  })

  async function open(bill: ShopBill) {
    setOpeningId(bill.id)
    setDetailError(null)
    try {
      const { data: full } = await dataApi.get<BillDetail>(`/client-portal/shop/bills/${bill.id}`)
      setDetail(full)
    } catch (caught) {
      setDetail(null)
      setDetailError(errorMessage(caught))
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <>
      <PageHeader title="Bills" subtitle="Invoices raised by the laundry for this shop" />

      <div className="panel panel-pad mb-4">
        <label className="block max-w-xs">
          <span className="field-label">Filter by payment status</span>
          <select
            className="field-input select-input"
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value)
              setPage(0)
            }}
            aria-label="Filter bills by payment status"
          >
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </label>
      </div>

      <StateBox
        loading={loading}
        error={error}
        empty={!loading && !error && (data?.items.length ?? 0) === 0}
        onRetry={reload}
        emptyTitle={paymentStatus ? 'No bills with that status' : 'No bills yet'}
        emptyDetail={paymentStatus ? 'Choose a different status to see more records.' : 'Invoices raised by your provider will appear here.'}
      >
        <Table head={['Bill', 'Raised', 'Total', 'Paid', 'Balance', 'Status', '']}>
          {(data?.items ?? []).map((bill) => (
            <tr key={bill.id}>
              <td className="px-4 py-3 font-medium">{bill.bill_number ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(bill.created_at)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMoney(bill.grand_total)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMoney(bill.paid_amount)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMoney(bill.balance)}</td>
              <td className="px-4 py-3"><StatusChip status={bill.payment_status} /></td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => void open(bill)}
                  disabled={openingId === bill.id}
                  className="btn btn-secondary"
                  aria-label={`View bill ${bill.bill_number ?? bill.id}`}
                >
                  {openingId === bill.id ? 'Opening…' : 'View'}
                </button>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          onPage={setPage}
          label="bills"
        />
      </StateBox>

      {detailError ? (
        <div className="mt-4">
          <Notice tone="danger" title="Bill detail could not be loaded">
            {detailError}
          </Notice>
        </div>
      ) : null}

      {detail ? (
        <Panel className="mt-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Bill</p>
              <p className="text-lg font-semibold text-slate-900">{detail.bill_number ?? '—'}</p>
            </div>
            <button type="button" onClick={() => setDetail(null)} className="btn btn-secondary" aria-label="Close bill detail">
              <X />
              Close
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Total</p>
              <p className="font-medium">{formatMoney(detail.grand_total)}</p>
            </div>
            <div>
              <p className="text-slate-500">Paid</p>
              <p className="font-medium">{formatMoney(detail.paid_amount)}</p>
            </div>
            <div>
              <p className="text-slate-500">Balance</p>
              <p className="font-medium">{formatMoney(detail.balance)}</p>
            </div>
          </div>

          {(detail.items?.length ?? 0) > 0 ? (
            <Table head={['Item', 'Qty', 'Unit price', 'Amount']}>
              {(detail.items ?? []).map((line, index) => (
                <tr key={`${line.item_name ?? 'line'}-${index}`}>
                  <td className="px-4 py-3">{line.item_name ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{line.quantity ?? ''}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {line.unit_price === undefined ? '—' : formatMoney(line.unit_price)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {line.amount === undefined ? '—' : formatMoney(line.amount)}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <p className="text-sm text-slate-500">No line items recorded on this bill.</p>
          )}

          {detail.notes ? <p className="mt-3 text-sm text-slate-600">{detail.notes}</p> : null}
        </Panel>
      ) : null}
    </>
  )
}
