import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { dataApi, errorStatus, errorMessage } from '../../api/client'
import { getToken } from '../../session'
import {
  cacheKey,
  clamp,
  filterRows,
  isResponseTooLarge,
  isRetryableStatus,
  paginate,
  pageRange,
  retryDelay,
  sessionRemainingMs,
  sortRows,
  type SortDirection,
} from './utils'

/** 1 — Keep the browser title in step with the routed screen. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · Shop Portal`
  }, [title])
}

/** 3 — Add a shadow only after the page has actually been scrolled. */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold])
  return scrolled
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

/** 12 — Respect the operating-system motion preference everywhere. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Small persisted UI preferences; never used for tokens or customer data. */
export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be disabled; the control still works for this session.
    }
  }, [key, value])

  return [value, setValue] as const
}

/** 13 — Debounce table search input before filtering rows. */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/** 4, 32, 47, 99 — Trap focus in a drawer or dialog and restore it on close. */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onEscape?: () => void): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape

  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement | null
    const root = ref.current
    if (!root) return

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusable = () => [...root.querySelectorAll<HTMLElement>(selector)].filter((element) => element.offsetParent !== null)
    focusable()[0]?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previous?.focus?.()
    }
  }, [active])

  return ref
}

/** 72 — One Escape handler shared by menus, drawers and dialogs. */
export function useEscapeKey(handler: () => void, active = true): void {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!active) return
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') ref.current()
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [active])
}

/** 17, 100 — Dismiss a popover when focus or a pointer moves outside it. */
export function useOutsideClick<T extends HTMLElement>(active: boolean, handler: () => void): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    if (!active) return
    const listener = (event: MouseEvent | TouchEvent) => {
      const root = ref.current
      if (root && !root.contains(event.target as Node)) handlerRef.current()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [active])
  return ref
}

/** 88 — Browser online/offline state without polling. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

/** 36, 97 — Lock a write once and dedupe rapid repeats of the same intent. */
export function useSubmitGuard() {
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const lastKey = useRef<string | null>(null)

  const run = useCallback(async (key: string, task: () => Promise<void>): Promise<boolean> => {
    if (inFlight.current || lastKey.current === key) return false
    inFlight.current = true
    lastKey.current = key
    setBusy(true)
    try {
      await task()
      return true
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }, [])

  const reset = useCallback(() => {
    lastKey.current = null
  }, [])

  return { busy, run, reset }
}

/** 34 — Track touched fields so validation appears on blur. */
export function useFieldValidation(errors: Record<string, string | undefined>) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const markTouched = useCallback((name: string) => {
    setTouched((current) => (current[name] ? current : { ...current, [name]: true }))
  }, [])
  const resetTouched = useCallback(() => setTouched({}), [])
  const errorFor = useCallback((name: string) => (touched[name] ? errors[name] : undefined), [errors, touched])
  return { touched, markTouched, resetTouched, errorFor }
}

/** 37, 38, 52 — Local draft autosave with an explicit restore decision. */
export function useDraft<T>(key: string, empty: T, delay = 400) {
  const [value, setValueState] = useState<T>(empty)
  const [restored, setRestored] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    setRestored(false)
    setSaveStatus('idle')
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        setValueState(JSON.parse(raw) as T)
        setHasDraft(true)
        return
      }
    } catch {
      // Ignore malformed drafts rather than blocking the form.
    }
    setValueState(empty)
    setHasDraft(false)
    // `empty` is a stable constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!restored) return
    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        setSaveStatus('saved')
      } catch {
        setSaveStatus('idle')
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [key, value, restored, delay])

  const setValue = useCallback((next: T | ((current: T) => T)) => {
    setValueState((current) => (typeof next === 'function' ? (next as (value: T) => T)(current) : next))
    setRestored(true)
  }, [])

  const restore = useCallback(() => {
    setRestored(true)
    setHasDraft(false)
  }, [])

  const discard = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Nothing to discard if storage is unavailable.
    }
    setValueState(empty)
    setRestored(false)
    setHasDraft(false)
    setSaveStatus('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { value, setValue, restored, saveStatus, hasDraft, restore, discard }
}

/* ─────────────────────────── Data cache ────────────────────────────────── */

interface CacheEntry {
  data: unknown
  at: number
}

/** Module-level so stale data survives a route remount inside the same scope. */
const FEATURE_CACHE = new Map<string, CacheEntry>()
const IN_FLIGHT = new Map<string, Promise<unknown>>()

/** 90, 91 — Clear one session's data, or every entry when scope is omitted. */
export function clearFeatureCache(scope?: string): void {
  if (!scope) {
    FEATURE_CACHE.clear()
    IN_FLIGHT.clear()
    return
  }
  const prefix = `${scope}::`
  for (const key of [...FEATURE_CACHE.keys()]) {
    if (key.startsWith(prefix)) FEATURE_CACHE.delete(key)
  }
  for (const key of [...IN_FLIGHT.keys()]) {
    if (key.startsWith(prefix)) IN_FLIGHT.delete(key)
  }
}

export function cachedEntry(key: string): CacheEntry | undefined {
  return FEATURE_CACHE.get(key)
}

interface CachedQueryOptions {
  enabled?: boolean
  scope?: string
  timeout?: number
  /** Milliseconds before cached data is considered stale; still shown meanwhile. */
  maxAge?: number
}

interface CachedQueryResult<T> {
  data: T | null
  error: string | null
  status?: number
  loading: boolean
  revalidating: boolean
  updatedAt: number | null
  reload: () => void
}

/**
 * 85, 86, 87, 93, 95 — Stale-while-revalidate GET with capped backoff,
 * normalised timeouts and a response-size guard.
 */
export function useCachedQuery<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options: CachedQueryOptions = {},
): CachedQueryResult<T> {
  const token = getToken()
  const scope = options.scope ?? token ?? 'anonymous'
  const serialized = JSON.stringify(params)
  const key = useMemo(() => cacheKey(scope, path, JSON.parse(serialized) as Record<string, unknown>), [scope, path, serialized])
  const cached = FEATURE_CACHE.get(key) as { data: T; at: number } | undefined

  const [data, setData] = useState<T | null>(cached?.data ?? null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(!cached)
  const [revalidating, setRevalidating] = useState(Boolean(cached))
  const [updatedAt, setUpdatedAt] = useState<number | null>(cached?.at ?? null)
  const [revision, setRevision] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const entry = FEATURE_CACHE.get(key) as { data: T; at: number } | undefined
    setData(entry?.data ?? null)
    setUpdatedAt(entry?.at ?? null)
    setLoading(!entry)
    setRevalidating(Boolean(entry))
    setError(null)
    setStatus(undefined)
  }, [key])

  const load = useCallback(async () => {
    if (options.enabled === false) {
      setLoading(false)
      setRevalidating(false)
      return
    }
    const hasCached = FEATURE_CACHE.has(key)
    if (hasCached) setRevalidating(true)
    else setLoading(true)
    setError(null)

    const request = async (): Promise<{ data: T }> => {
      let lastError: unknown
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await dataApi.get<T>(path, {
            params: JSON.parse(serialized) as Record<string, string | number | undefined>,
            timeout: options.timeout ?? 12000,
          })
          if (isResponseTooLarge(response.data)) {
            throw new Error('That response is too large to display safely. Ask for a narrower date range.')
          }
          return response
        } catch (caught) {
          lastError = caught
          const code = errorStatus(caught)
          if (attempt === 2 || !isRetryableStatus(code)) break
          await new Promise((resolve) => window.setTimeout(resolve, retryDelay(attempt)))
        }
      }
      throw lastError
    }

    const existing = IN_FLIGHT.get(key)
    const promise = existing ?? request()
    if (!existing) IN_FLIGHT.set(key, promise)
    try {
      const response = (await promise) as { data: T }
      const at = Date.now()
      FEATURE_CACHE.set(key, { data: response.data, at })
      if (mounted.current) {
        setData(response.data)
        setUpdatedAt(at)
        setStatus(undefined)
      }
    } catch (caught) {
      if (mounted.current) {
        setError(errorMessage(caught))
        setStatus(errorStatus(caught))
      }
    } finally {
      IN_FLIGHT.delete(key)
      if (mounted.current) {
        setLoading(false)
        setRevalidating(false)
      }
    }
  }, [key, options.enabled, options.timeout, path, serialized, revision])

  useEffect(() => {
    void load()
  }, [load])

  const reload = useCallback(() => setRevision((value) => value + 1), [])
  return { data, error, status, loading, revalidating, updatedAt, reload }
}

/** 93 — Pages listen for the shell-wide refresh dispatched by the palette. */
export function useGlobalRefresh(handler: () => void): void {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const listener = () => ref.current()
    window.addEventListener('ll:refresh', listener)
    return () => window.removeEventListener('ll:refresh', listener)
  }, [])
}

/** 82 — Refresh and search keys, ignored while typing in a field. */
export function usePageShortcuts(onRefresh: () => void, onFocusSearch: () => void): void {
  const refreshRef = useRef(onRefresh)
  const searchRef = useRef(onFocusSearch)
  refreshRef.current = onRefresh
  searchRef.current = onFocusSearch

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key.toLowerCase() === 'r') {
        refreshRef.current()
      } else if (event.key === '/') {
        event.preventDefault()
        searchRef.current()
      }
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [])
}

/* ─────────────────────────── Table controller ──────────────────────────── */

export interface TableControllerOptions<T> {
  idOf: (row: T) => string
  searchable: Array<(row: T) => string>
  statusOf?: (row: T) => string
  dateOf?: (row: T) => string | null | undefined
  sortValue?: (row: T, key: string) => string | number | null | undefined
  initialPageSize?: number
  initialHidden?: string[]
}

export interface TableController<T> {
  searchInput: string
  setSearchInput: (value: string) => void
  search: string
  status: string
  setStatus: (value: string) => void
  dateFrom: string
  setDateFrom: (value: string) => void
  dateTo: string
  setDateTo: (value: string) => void
  sortKey: string | null
  sortDirection: SortDirection
  toggleSort: (key: string) => void
  selected: Set<string>
  toggleRow: (id: string) => void
  toggleAll: (ids: string[], checked: boolean) => void
  clearSelection: () => void
  hiddenColumns: Set<string>
  toggleColumn: (key: string) => void
  density: 'comfortable' | 'compact'
  setDensity: (value: 'comfortable' | 'compact') => void
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (value: number) => void
  rows: T[]
  range: ReturnType<typeof pageRange>
  totalBeforePaging: number
  filtered: T[]
}

/** Shared state behind every data table: search, filters, sort, select, page. */
export function useTableController<T>(rows: T[], options: TableControllerOptions<T>): TableController<T> {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 200)
  const [status, setStatusState] = useState('')
  const [dateFrom, setDateFromState] = useState('')
  const [dateTo, setDateToState] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set(options.initialHidden ?? []))
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [page, setPageState] = useState(0)
  const [pageSize, setPageSizeState] = useState(options.initialPageSize ?? 10)

  const setStatus = useCallback((value: string) => setStatusState(value), [])
  const setDateFrom = useCallback((value: string) => setDateFromState(value), [])
  const setDateTo = useCallback((value: string) => setDateToState(value), [])
  const setPage = useCallback((value: number) => setPageState(Math.max(0, value)), [])
  const setPageSize = useCallback((value: number) => setPageSizeState(Math.max(1, value)), [])

  useEffect(() => {
    setPageState(0)
  }, [search, status, dateFrom, dateTo, pageSize])

  const filtered = useMemo(
    () =>
      filterRows(rows, {
        search,
        searchable: options.searchable,
        status,
        statusOf: options.statusOf,
        dateFrom,
        dateTo,
        dateOf: options.dateOf,
      }),
    [rows, search, options.searchable, status, options.statusOf, dateFrom, dateTo, options.dateOf],
  )

  const sorted = useMemo(
    () =>
      sortRows(filtered, sortKey, sortDirection, (row, key) =>
        options.sortValue ? options.sortValue(row, key) : (row as Record<string, unknown>)[key] as string | number,
      ),
    [filtered, sortKey, sortDirection, options.sortValue],
  )

  const range = pageRange(page, pageSize, sorted.length)
  const visible = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize])

  const toggleSort = useCallback((key: string) => {
    setSortKey((current) => {
      if (current !== key) {
        setSortDirection('asc')
        return key
      }
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
      return key
    })
  }, [])

  const toggleRow = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback((ids: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelected(new Set()), [])
  const toggleColumn = useCallback((key: string) => {
    setHiddenColumns((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return {
    searchInput,
    setSearchInput,
    search,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortKey,
    sortDirection,
    toggleSort,
    selected,
    toggleRow,
    toggleAll,
    clearSelection,
    hiddenColumns,
    toggleColumn,
    density,
    setDensity,
    page: range.page,
    setPage,
    pageSize,
    setPageSize,
    rows: visible,
    range,
    totalBeforePaging: sorted.length,
    filtered: sorted,
  }
}

/** 59 — A ticking countdown for the expiry banner, without leaking the token. */
export function useSessionCountdown(token: string | null | undefined): { remaining: number; expiring: boolean } {
  const [remaining, setRemaining] = useState(() => sessionRemainingMs(token))
  useEffect(() => {
    setRemaining(sessionRemainingMs(token))
    if (!token) return
    const timer = window.setInterval(() => setRemaining(sessionRemainingMs(token)), 30_000)
    return () => window.clearInterval(timer)
  }, [token])
  return { remaining, expiring: remaining > 0 && remaining <= 10 * 60 * 1000 }
}

/** 57 — Remember the last laundry chosen for this login. */
export function useLastLaundry() {
  return useLocalStorageState<string | null>('ll_shop_last_laundry', null)
}

/** 7 — Persist the collapsed state of the sidebar. */
export function useSidebarCollapsed() {
  return useLocalStorageState<boolean>('ll_shop_sidebar_collapsed', false)
}

/** Clamp any externally supplied page against the last known total. */
export function useClampedPage(page: number, pageCount: number): number {
  return clamp(page, 0, Math.max(0, pageCount - 1))
}
