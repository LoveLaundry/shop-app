import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { formatDate, formatNumber, useCachedQuery, useFeature } from '../features/feature-pack'
import {
  DataTable,
  LastUpdated,
  ToneChip,
  TooltipText,
  type TableColumn,
} from '../features/feature-pack/components'
import { aggregateItems, normalizeItems, receivedPiecesFromItems } from '../features/feature-pack/utils'
import { useGlobalRefresh, usePageShortcuts } from '../features/feature-pack/hooks'
import { Notice, PageHeader, Pagination } from '../ui/kit'

interface ShopOrderItem {
  item_name?: string
  name?: string
  client_qty?: number | string | null
  quantity?: number | string | null
  received_qty?: number | string | null
}

interface ShopOrder {
  id: string
  gate_pass_number: string
  status: string
  receiving_date: string | null
  line_count: number
  pieces: number
  items?: ShopOrderItem[] | null
}

interface Response {
  total: number
  items: ShopOrder[]
}

const PAGE_SIZE = 50

/** Received always comes from items[].received_qty — never from sent totals. */
function receivedPieces(order: ShopOrder): number {
  return receivedPiecesFromItems(order.items)
}

function OrderDetail({ order }: { order: ShopOrder }) {
  const aggregate = aggregateItems(order.items)
  return (
    <div className="fp-detail">
      <p className="text-xs uppercase tracking-wide text-slate-400">Order</p>
      <p className="text-lg font-semibold text-slate-900">{order.gate_pass_number}</p>
      <div className="fp-detail-grid">
        <div><span>Raised</span><strong>{formatDate(order.receiving_date)}</strong></div>
        <div><span>Sent</span><strong>{formatNumber(aggregate.sent)} pieces</strong></div>
        <div><span>Received</span><strong>{formatNumber(aggregate.received)} pieces</strong></div>
        <div><span>Status</span><strong><ToneChip status={order.status} /></strong></div>
      </div>
      <p className="fp-detail-subtitle">Item breakdown · {aggregate.lines} lines</p>
      {aggregate.byName.length > 0 ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <caption className="sr-only">Item counts for order {order.gate_pass_number}</caption>
            <thead><tr><th scope="col">Item</th><th scope="col">Sent</th><th scope="col">Received</th></tr></thead>
            <tbody>
              {aggregate.byName.map((line) => (
                <tr key={line.name}>
                  <td>{line.name}</td>
                  <td className="tabular-nums">{formatNumber(line.sent)}</td>
                  <td className="tabular-nums">{formatNumber(line.received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="fp-muted">The laundry has not counted any items on this order yet.</p>
      )}
      {normalizeItems(order.items).some((item) => item.received_qty !== undefined && item.received_qty !== null) ? null : (
        <p className="fp-detail-notes">Received counts appear once the laundry confirms the delivery.</p>
      )}
    </div>
  )
}

export function OrdersPage() {
  const location = useLocation()
  const created = Boolean((location.state as { created?: boolean } | null)?.created)
  const [page, setPage] = useState(0)
  const { toast, publishNotifications, pendingOrders, retryOrder } = useFeature()
  const { data, error, loading, revalidating, updatedAt, reload } = useCachedQuery<Response>('/client-portal/shop/orders', {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  usePageShortcuts(reload, () => document.querySelector<HTMLInputElement>('#orders-search')?.focus())
  useGlobalRefresh(reload)

  const orders = useMemo(() => Array.isArray(data?.items) ? data.items : [], [data])

  useEffect(() => {
    const drafts = orders.filter((order) => order.status === 'DRAFT').length
    publishNotifications('orders', [
      ...(drafts > 0 ? [{
        id: 'orders-drafts',
        title: `${drafts} draft order${drafts === 1 ? '' : 's'}`,
        detail: 'These orders stay in draft until the laundry counts the delivery.',
        tone: 'info' as const,
      }] : []),
      ...(pendingOrders.length > 0 ? pendingOrders.map((order) => ({
        id: `pending-${order.id}`,
        title: order.status === 'failed' ? 'Order could not be sent' : 'Order is being sent',
        detail: order.label,
        tone: (order.status === 'failed' ? 'warning' : 'info') as 'warning' | 'info',
        actionLabel: order.status === 'failed' ? 'Retry now' : undefined,
        onAction: order.status === 'failed' ? () => retryOrder(order.id) : undefined,
      })) : []),
    ])
  }, [orders, pendingOrders, publishNotifications, retryOrder])

  const columns: TableColumn<ShopOrder>[] = [
    {
      key: 'gate_pass_number',
      header: 'Order',
      render: (order) => <strong><TooltipText value={order.gate_pass_number} max={24} /></strong>,
      exportValue: (order) => order.gate_pass_number,
      sortable: true,
    },
    {
      key: 'receiving_date',
      header: 'Raised',
      render: (order) => formatDate(order.receiving_date),
      exportValue: (order) => order.receiving_date ?? '',
      sortable: true,
    },
    {
      key: 'line_count',
      header: 'Items',
      render: (order) => formatNumber(order.line_count),
      exportValue: (order) => order.line_count,
      sortable: true,
      align: 'right',
    },
    {
      key: 'pieces',
      header: 'Sent',
      render: (order) => formatNumber(order.pieces),
      exportValue: (order) => order.pieces,
      sortable: true,
      align: 'right',
    },
    {
      key: 'received',
      header: 'Received',
      render: (order) => order.status === 'DRAFT' ? '—' : formatNumber(receivedPieces(order)),
      exportValue: (order) => (order.status === 'DRAFT' ? '' : receivedPieces(order)),
      sortable: true,
      align: 'right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <ToneChip status={order.status} />,
      exportValue: (order) => order.status,
      sortable: true,
    },
  ]

  const sortValue = (order: ShopOrder, key: string): string | number => {
    switch (key) {
      case 'gate_pass_number': return order.gate_pass_number
      case 'receiving_date': return order.receiving_date ?? ''
      case 'line_count': return order.line_count
      case 'pieces': return order.pieces
      case 'received': return receivedPieces(order)
      default: return order.status
    }
  }

  return (
    <>
      <PageHeader title="Orders" subtitle="What you sent, and what the laundry has counted in" />

      {created ? (
        <Notice tone="success" title="Order sent" action={<Link to="/orders" className="btn btn-ghost">Dismiss</Link>}>
          Your order is with the laundry. It stays in draft until they confirm receipt.
        </Notice>
      ) : null}

      {pendingOrders.length > 0 ? (
        <div className="fp-pending-list" role="status">
          {pendingOrders.map((order) => (
            <div key={order.id} className="fp-pending-row">
              <span>{order.status === 'failed' ? 'Could not send' : 'Sending'} · {order.label}</span>
              {order.status === 'failed' ? (
                <button type="button" className="btn btn-secondary" onClick={() => retryOrder(order.id)}>Retry</button>
              ) : <span className="fp-muted">Waiting for the server…</span>}
            </div>
          ))}
        </div>
      ) : null}

      <div className="fp-page-actions">
        <LastUpdated at={updatedAt} refreshing={revalidating} />
        <button type="button" className="btn btn-secondary" onClick={reload} aria-label="Refresh orders">
          <RefreshCw aria-hidden="true" /> Refresh
        </button>
        <Link to="/orders/new" className="btn btn-primary">
          <Plus />
          New order
        </Link>
      </div>

      <DataTable
        id="orders"
        caption="Orders raised by the active shop account"
        rows={orders}
        columns={columns}
        idOf={(order) => order.id}
        searchable={[(order) => order.gate_pass_number, (order) => order.id, (order) => order.status]}
        statusOf={(order) => order.status}
        statusOptions={['DRAFT', 'RECEIVED', 'PROCESSING', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']}
        dateOf={(order) => order.receiving_date}
        sortValue={sortValue}
        initialPageSize={50}
        loading={loading && orders.length === 0}
        error={error}
        onRetry={reload}
        emptyTitle="No orders yet"
        emptyDetail="Use New order to tell the laundry what you are sending."
        emptyAction={<Link to="/orders/new" className="btn btn-primary">Create an order</Link>}
        renderDetail={(order) => <OrderDetail order={order} />}
        onToast={toast}
        toolbarExtra={
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onPage={setPage}
            label="server pages of orders"
          />
        }
      />
    </>
  )
}
