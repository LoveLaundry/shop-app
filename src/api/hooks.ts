import { useCallback, useEffect, useMemo, useState } from 'react'
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

  // The path belongs in the request key too. A panel can ask for a different
  // resource with the same params (for example, another bill's detail view);
  // keying on params alone reused the previous response under a new heading.
  const key = useMemo(() => JSON.stringify({ path, params: params ?? {} }), [path, params])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStatus(undefined)
    try {
      const { params: queryParams } = JSON.parse(key) as { params?: Params }
      const response = await dataApi.get<T>(path, { params: queryParams })
      setData(response.data)
    } catch (caught) {
      setError(errorMessage(caught))
      setStatus(errorStatus(caught))
    } finally {
      setLoading(false)
    }
  }, [key, path])

  useEffect(() => {
    void load()
  }, [load])

  return { data, error, status, loading, reload: () => void load() }
}

/* Formatting and item aggregation now live in the shared feature pack so
   tables, drawers and pages all use the same rules. */
export { formatMoney, formatDate, formatNumber } from '../features/feature-pack/utils'
export { sentPiecesFromItems as pieces } from '../features/feature-pack/utils'
