import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, RefreshCw, WifiOff } from 'lucide-react'
import { dataApi } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { appConfig } from '../../config/app'
import {
  ConfirmDialog,
  FeatureErrorBoundary,
  ProgressBar,
  SkipLink,
  Toasts,
  type ToastItem,
} from './components'
import {
  clearFeatureCache,
  useDocumentTitle,
  useOnlineStatus,
  useReducedMotion,
  useSessionCountdown,
} from './hooks'
import { makeIdempotencyKey, normalizeError, pluralize } from './utils'

export interface FeatureNotification {
  id: string
  title: string
  detail: string
  tone?: 'info' | 'warning' | 'success'
  actionLabel?: string
  onAction?: () => void
}

export interface PendingOrder {
  id: string
  label: string
  createdAt: number
  status: 'sending' | 'failed'
  payload: Record<string, unknown>
}

interface ConfirmRequest {
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'neutral'
}

interface ConfirmState extends ConfirmRequest {
  resolve: (value: boolean) => void
}

interface FeatureContextValue {
  toast: (message: string, tone?: ToastItem['tone'], actionLabel?: string, onAction?: () => void) => void
  confirm: (request: ConfirmRequest) => Promise<boolean>
  announce: (message: string) => void
  publishNotifications: (key: string, items: FeatureNotification[]) => void
  notifications: FeatureNotification[]
  pendingOrders: PendingOrder[]
  queueOrder: (payload: Record<string, unknown>, label: string, idempotencyKey?: string) => void
  retryOrder: (id: string) => void
  safeSignOut: () => void
  online: boolean
  reducedMotion: boolean
  refreshPage: () => void
}

const FeatureContext = createContext<FeatureContextValue | null>(null)

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Account',
  '/bills': 'Bills',
  '/orders': 'Orders',
  '/orders/new': 'New order',
  '/about': 'About this portal',
  '/login': 'Sign in',
  '/register': 'Registration',
}

/** 401 responses broadcast this so scoped caches can follow the token out. */
export const SESSION_EXPIRED_EVENT = 'll:session-expired'

function routeTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/orders/')) return 'Order details'
  return appConfig.title
}

/**
 * Owns the cross-cutting UI state: toasts, dialogs, optimistic writes,
 * notifications, display preferences and accessibility announcements.
 */
export function FeatureProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const online = useOnlineStatus()
  const reducedMotion = useReducedMotion()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [notifications, setNotifications] = useState<Record<string, FeatureNotification[]>>({})
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [dismissedExpiry, setDismissedExpiry] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useDocumentTitle(routeTitle(location.pathname))

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'info', actionLabel?: string, onAction?: () => void) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((current) => [...current.slice(-3), { id, message, tone, actionLabel, onAction }])
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, tone === 'error' ? 8000 : 5000)
    timers.current.push(timer)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const announce = useCallback((message: string) => {
    setAnnouncement({ id: Date.now() + Math.random(), message })
  }, [])

  useEffect(() => {
    if (!announcement) return
    const timer = window.setTimeout(() => setAnnouncement(null), 6000)
    return () => window.clearTimeout(timer)
  }, [announcement])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const confirm = useCallback((request: ConfirmRequest) =>
    new Promise<boolean>((resolve) => {
      setConfirmState({ ...request, resolve })
    }), [])

  const closeConfirm = useCallback((value: boolean) => {
    setConfirmState((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  const publishNotifications = useCallback((key: string, items: FeatureNotification[]) => {
    setNotifications((current) => {
      const existing = current[key]
      if (existing && JSON.stringify(existing.map((item) => [item.id, item.title, item.detail])) === JSON.stringify(items.map((item) => [item.id, item.title, item.detail]))) {
        return current
      }
      return { ...current, [key]: items }
    })
  }, [])

  const allNotifications = useMemo(() => Object.values(notifications).flat(), [notifications])

  const sendPending = useCallback((order: PendingOrder) => {
    setPendingOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: 'sending' } : item)))
    void dataApi
      .post('/client-portal/shop/orders', order.payload, {
        headers: { 'Idempotency-Key': order.id },
      })
      .then(() => {
        setPendingOrders((current) => current.filter((item) => item.id !== order.id))
        toast('Order sent. The laundry has been notified.', 'success')
        announce('Order sent successfully.')
      })
      .catch((caught: unknown) => {
        const message = normalizeError(caught)
        setPendingOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: 'failed' } : item)))
        toast(message, 'error', 'Retry', () => sendPending(order))
      })
  }, [announce, toast])

  const queueOrder = useCallback((payload: Record<string, unknown>, label: string, idempotencyKey?: string) => {
    const id = idempotencyKey ?? makeIdempotencyKey()
    const order: PendingOrder = { id, label, createdAt: Date.now(), status: 'sending', payload }
    setPendingOrders((current) => [...current, order])
    announce(`${label} queued for sending.`)
    sendPending(order)
  }, [announce, sendPending])

  const retryOrder = useCallback((id: string) => {
    const order = pendingOrders.find((item) => item.id === id)
    if (order) sendPending(order)
  }, [pendingOrders, sendPending])

  const safeSignOut = useCallback(() => {
    void confirm({
      title: 'Sign out of this account?',
      message: 'Your local drafts stay on this device, but cached account data and the active session will be cleared.',
      confirmLabel: 'Sign out',
    }).then((agreed) => {
      if (!agreed) return
      clearFeatureCache()
      setNotifications({})
      setPendingOrders([])
      signOut()
      navigate('/login', { replace: true })
      toast('Signed out safely.', 'info')
    })
  }, [confirm, navigate, signOut, toast])

  /* 58 — A 401 in the HTTP layer clears the token; this clears the UI too. */
  useEffect(() => {
    const handler = () => {
      clearFeatureCache()
      setNotifications({})
      setPendingOrders([])
      signOut()
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  }, [signOut])

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
  }, [reducedMotion])

  const refreshPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ll:refresh'))
    announce('Refreshing page data.')
  }, [announce])

  const { remaining, expiring } = useSessionCountdown(session?.token)
  const expiryKey = session?.token ?? null
  const showExpiry = expiring && dismissedExpiry !== expiryKey && Boolean(session)

  const value = useMemo<FeatureContextValue>(() => ({
    toast,
    confirm,
    announce,
    publishNotifications,
    notifications: allNotifications,
    pendingOrders,
    queueOrder,
    retryOrder,
    safeSignOut,
    online,
    reducedMotion,
    refreshPage,
  }), [announce, confirm, online, pendingOrders, publishNotifications, queueOrder, reducedMotion, refreshPage, retryOrder, safeSignOut, toast, allNotifications])

  return (
    <FeatureContext.Provider value={value}>
      <SkipLink />
      <ProgressBar routeKey={`${location.pathname}${location.search}`} />

      {!online ? (
        <div className="fp-status-chip fp-offline" role="status">
          <WifiOff aria-hidden="true" /> Offline — showing saved data
        </div>
      ) : null}
      {pendingOrders.length > 0 ? (
        <div className="fp-status-chip fp-queued" role="status">
          <RefreshCw aria-hidden="true" /> {pluralize(pendingOrders.length, 'order')} waiting for the server
        </div>
      ) : null}

      {showExpiry ? (
        <div className="fp-expiry" role="alert">
          <CircleAlert aria-hidden="true" />
          <span>This session expires in about {Math.max(1, Math.ceil(remaining / 60000))} minutes.</span>
          <button type="button" className="btn btn-secondary" onClick={refreshPage}>Refresh data</button>
          <button type="button" className="btn btn-ghost" onClick={safeSignOut}>Sign out</button>
          <button type="button" className="link-button" onClick={() => setDismissedExpiry(expiryKey)}>Dismiss</button>
        </div>
      ) : null}

      <FeatureErrorBoundary onReset={refreshPage}>{children}</FeatureErrorBoundary>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement?.message ?? ''}
      </div>
      <Toasts items={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        confirmLabel={confirmState?.confirmLabel}
        tone={confirmState?.tone}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </FeatureContext.Provider>
  )
}

export function useFeature(): FeatureContextValue {
  const context = useContext(FeatureContext)
  if (!context) throw new Error('useFeature must be used inside FeatureProvider')
  return context
}
