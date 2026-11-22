import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { formatDate, formatMoney, useCachedQuery, useFeature } from '../features/feature-pack'
import {
  DataTable,
  LastUpdated,
  RetryInline,
  SkeletonRows,
  ToneChip,
  TooltipText,
  type TableColumn,
} from '../features/feature-pack/components'
import { aggregateItems, normalizeItems } from '../features/feature-pack/utils'
import { useGlobalRefresh, usePageShortcuts } from '../features/feature-pack/hooks'
import { PageHeader, Pagination } from '../ui/kit'

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

/** The drawer fetches only the bill the user opened. */
function BillDetailContent({ bill }: { bill: ShopBill }) {
  const { data, error, loading, reload } = useCachedQuery<BillDetail>(`/client-portal/shop/bills/${bill.id}`)
  const lines = normalizeItems(data?.items) as unknown as BillLine[]
  const totals = aggregateItems(data?.items)

  if (loading) return <SkeletonRows count={4} />
  if (error) return <RetryInline onRetry={reload} message={error} />

  return (
    <div className="fp-detail">
      <p className="text-xs uppercase tracking-wide text-slate-400">Bill</p>
      <p className="text-lg font-semibold text-slate-900">{data?.bill_number ?? bill.bill_number ?? '—'}</p>
      <div className="fp-detail-grid">
        <div><span>Total</span><strong>{formatMoney(data?.grand_total ?? bill.grand_total)}</strong></div>
        <div><span>Paid</span><strong>{formatMoney(data?.paid_amount ?? bill.paid_amount)}</strong></div>
        <div><span>Balance</span><strong>{formatMoney(data?.balance ?? bill.balance)}</strong></div>
        <div><span>Raised</span><strong>{formatDate(data?.created_at ?? bill.created_at)}</strong></div>
      </div>
      <p className="fp-detail-subtitle">Line items · {totals.lines} lines · {totals.sent} pieces</p>
      {lines.length > 0 ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <caption className="sr-only">Line items for bill {data?.bill_number ?? bill.id}</caption>
            <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr></thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={`${line.item_name ?? 'line'}-${index}`}>
                  <td>{line.item_name ?? '—'}</td>
                  <td className="tabular-nums">{line.quantity ?? ''}</td>
                  <td className="tabular-nums">{line.unit_price === undefined ? '—' : formatMoney(line.unit_price)}</td>
                  <td className="tabular-nums">{line.amount === undefined ? '—' : formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="fp-muted">No line items recorded on this bill.</p>}
      {data?.notes ? <p className="fp-detail-notes">{data.notes}</p> : null}
    </div>
  )
}

export function BillsPage() {
  const [page, setPage] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState('')
  const { toast, publishNotifications } = useFeature()
  // This endpoint names its page cursor `offset` (not `skip`).
  const { data, error, loading, revalidating, updatedAt, reload } = useCachedQuery<Response>('/client-portal/shop/bills', {
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    status: paymentStatus || undefined,
  })

  usePageShortcuts(reload, () => document.querySelector<HTMLInputElement>('#bills-search')?.focus())
  useGlobalRefresh(reload)

  const bills = useMemo(() => Array.isArray(data?.items) ? data.items : [], [data])

  useEffect(() => {
    const unpaid = bills.filter((bill) => Number(bill.balance) > 0).length
    publishNotifications('bills', unpaid > 0 ? [{
      id: 'bills-unpaid',
      title: `${unpaid} bill${unpaid === 1 ? '' : 's'} with a balance`,
      detail: 'Open bills still show an outstanding amount.',
      tone: 'warning' as const,
      actionLabel: 'Filter unpaid bills',
      onAction: () => setPaymentStatus('PARTIALLY_PAID'),
    }] : [])
  }, [bills, publishNotifications])

  const columns: TableColumn<ShopBill>[] = [
    {
      key: 'bill',
      header: 'Bill',
      render: (bill) => <strong><TooltipText value={bill.bill_number ?? bill.id} max={24} /></strong>,
      exportValue: (bill) => bill.bill_number ?? bill.id,
      sortable: true,
    },
    {
      key: 'raised',
      header: 'Raised',
      render: (bill) => formatDate(bill.created_at),
      exportValue: (bill) => bill.created_at ?? '',
      sortable: true,
    },
    {
      key: 'total',
      header: 'Total',
      render: (bill) => formatMoney(bill.grand_total),
      exportValue: (bill) => bill.grand_total,
      sortable: true,
      align: 'right',
    },
    {
      key: 'paid',
      header: 'Paid',
      render: (bill) => formatMoney(bill.paid_amount),
      exportValue: (bill) => bill.paid_amount,
      sortable: true,
      align: 'right',
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (bill) => formatMoney(bill.balance),
      exportValue: (bill) => bill.balance,
      sortable: true,
      align: 'right',
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (bill) => <ToneChip status={bill.payment_status} />,
      exportValue: (bill) => bill.payment_status,
      sortable: true,
    },
  ]

  const sortValue = (bill: ShopBill, key: string): string | number => {
    switch (key) {
      case 'bill': return bill.bill_number ?? bill.id
      case 'raised': return bill.created_at ?? ''
      case 'total': return bill.grand_total
      case 'paid': return bill.paid_amount
      case 'balance': return bill.balance
      default: return bill.payment_status
    }
  }

  return (
    <>
      <PageHeader title="Bills" subtitle="Invoices raised by the laundry for this shop" />

      <div className="fp-page-actions">
        <LastUpdated at={updatedAt} refreshing={revalidating} />
        <button type="button" className="btn btn-secondary" onClick={reload} aria-label="Refresh bills">
          <RefreshCw aria-hidden="true" /> Refresh
        </button>
      </div>

      <div className="panel panel-pad mb-4 fp-filter-panel">
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
            {STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <p className="panel-note">Search, dates and sorting apply to the current server page.</p>
      </div>

      <DataTable
        id="bills"
        caption="Bills for the active shop account"
        rows={bills}
        columns={columns}
        idOf={(bill) => bill.id}
        searchable={[(bill) => bill.bill_number ?? '', (bill) => bill.id, (bill) => bill.payment_status]}
        statusOf={(bill) => bill.payment_status}
        statusOptions={STATUSES}
        dateOf={(bill) => bill.created_at}
        sortValue={sortValue}
        initialPageSize={25}
        loading={loading && bills.length === 0}
        error={error}
        onRetry={reload}
        emptyTitle={paymentStatus ? 'No bills with that status' : 'No bills yet'}
        emptyDetail={paymentStatus ? 'Choose a different status to see more records.' : 'Invoices raised by your provider will appear here.'}
        emptyAction={<Link to="/orders" className="btn btn-secondary">Review orders</Link>}
        renderDetail={(bill) => <BillDetailContent bill={bill} />}
        onToast={toast}
        toolbarExtra={
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onPage={setPage}
            label="server pages of bills"
          />
        }
      />
    </>
  )
}
