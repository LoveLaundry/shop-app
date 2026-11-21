import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dataApi, errorStatus, errorMessage } from './client'

type Params = Record<string, string | number | undefined>

interface QueryResult<T> {
  data: T | null
  error: string | null
  /** HTTP status of the failed request, so screens can explain 404s properly. */
  status?: number
  loading: boolean
  reload: () => void
}

/**
 * Minimal GET hook.
 *
 * Deliberately not react-query: a handful of screens do not justify the
 * dependency, and this keeps the refresh semantics obvious. The request key is
 * serialised so a fresh object literal on every render does not refetch in a
 * loop.
 */
export function useQuery<T>(path: string, params?: Params): QueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const key = useMemo(() => JSON.stringify(params ?? {}), [params])
  const pathRef = useRef(path)
  pathRef.current = path

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStatus(undefined)
    try {
      const response = await dataApi.get<T>(pathRef.current, {
        params: JSON.parse(key) as Params,
      })
      setData(response.data)
    } catch (caught) {
      setError(errorMessage(caught))
      setStatus(errorStatus(caught))
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    void load()
  }, [load])

  return { data, error, status, loading, reload: () => void load() }
}

export function formatMoney(value: number | string | null | undefined, currency = 'LKR'): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function pieces(items: unknown): number {
  if (!Array.isArray(items)) return 0
  return items.reduce((total, raw) => {
    const item = raw as Record<string, unknown>
    const qty = Number(item.client_qty ?? item.received_qty ?? item.quantity ?? 0)
    return total + (Number.isFinite(qty) ? qty : 0)
  }, 0)
}
