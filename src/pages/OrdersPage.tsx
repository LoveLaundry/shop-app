import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { formatDate, useQuery } from '../api/hooks'
import { Notice, PageHeader, Pagination, StateBox, StatusChip, Table } from '../ui/kit'

interface ShopOrder {
  id: string
  gate_pass_number: string
  status: string
  receiving_date: string | null
  line_count: number
  pieces: number
  received_pieces: number
}

interface Response {
  total: number
  items: ShopOrder[]
}

const PAGE_SIZE = 50

export function OrdersPage() {
  const location = useLocation()
  const created = Boolean((location.state as { created?: boolean } | null)?.created)
  const [page, setPage] = useState(0)
  const { data, error, loading, reload } = useQuery<Response>('/client-portal/shop/orders', {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  return (
    <>
      <PageHeader title="Orders" subtitle="What you sent, and what the laundry has counted in" />

      {created ? (
        <Notice tone="success" title="Order sent" action={<Link to="/orders" className="btn btn-ghost">Dismiss</Link>}>
          Your order is with the laundry. It stays in draft until they confirm receipt.
        </Notice>
      ) : null}

      <div className="panel panel-pad mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="panel-note">Newest orders first. A draft becomes active once the laundry counts the pieces.</p>
        <Link to="/orders/new" className="btn btn-primary">
          <Plus />
          New order
        </Link>
      </div>

      <StateBox
        loading={loading}
        error={error}
        empty={!loading && !error && (data?.items.length ?? 0) === 0}
        onRetry={reload}
        emptyTitle="No orders yet"
        emptyDetail="Use New order to tell the laundry what you are sending."
      >
        <Table head={['Order', 'Raised', 'Items', 'Sent', 'Received', 'Status']}>
          {(data?.items ?? []).map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-medium">{order.gate_pass_number}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(order.receiving_date)}</td>
              <td className="px-4 py-3 tabular-nums">{order.line_count}</td>
              <td className="px-4 py-3 tabular-nums">{order.pieces}</td>
              {/* Zero until the laundry counts the delivery — that gap is what
                  the shop is waiting on, so it is shown per row. */}
              <td className="px-4 py-3 tabular-nums">
                {order.status === 'DRAFT' ? '—' : order.received_pieces}
              </td>
              <td className="px-4 py-3"><StatusChip status={order.status} /></td>
            </tr>
          ))}
        </Table>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          onPage={setPage}
          label="orders"
        />
      </StateBox>
    </>
  )
}
