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
import { CircleAlert, Keyboard, LayoutGrid, LogOut, RefreshCw, WifiOff } from 'lucide-react'
import { dataApi } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { appConfig } from '../../config/app'
import {
  ConfirmDialog,
  CommandPalette,
  Dialog,
  FeatureErrorBoundary,
  ProgressBar,
  ShortcutHelpDialog,
  SkipLink,
  Toasts,
  type CommandAction,
  type ToastItem,
} from './components'
import { FeaturePanel } from './FeaturePanel'
import {
  clearFeatureCache,
  useDocumentTitle,
  useLocalStorageState,
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
  openCommandPalette: () => void
  openShortcuts: () => void
  openFeatures: () => void
  openNotifications: () => void
  publishNotifications: (key: string, items: FeatureNotification[]) => void
  notifications: FeatureNotification[]
  pendingOrders: PendingOrder[]
  queueOrder: (payload: Record<string, unknown>, label: string, idempotencyKey?: string) => void
  retryOrder: (id: string) => void
  safeSignOut: () => void
  online: boolean
  highContrast: boolean
  toggleHighContrast: () => void
  largeText: boolean
  toggleLargeText: () => void
  reducedMotion: boolean
  refreshPage: () => void
}

const FeatureContext = createContext<FeatureContextValue | null>(null)

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Account',
  '/bills': 'Bills',
  '/orders': 'Orders',
  '/orders/new': 'New order',
  '/features': 'Feature guide',
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
  const [highContrast, setHighContrast] = useLocalStorageState('ll_shop_high_contrast', false)
  const [largeText, setLargeText] = useLocalStorageState('ll_shop_large_text', false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
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
    const root = document.documentElement
    root.dataset.contrast = highContrast ? 'high' : 'normal'
    root.dataset.textSize = largeText ? 'large' : 'normal'
    root.dataset.motion = reducedMotion ? 'reduced' : 'full'
  }, [highContrast, largeText, reducedMotion])

  const refreshPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ll:refresh'))
    announce('Refreshing page data.')
  }, [announce])

  const commandActions = useMemo<CommandAction[]>(() => [
    ...appConfig.nav.map((item) => ({
      id: `nav-${item.path}`,
      label: `Go to ${item.label}`,
      hint: item.path,
      icon: LayoutGrid,
      onSelect: () => navigate(item.path),
    })),
    { id: 'new-order', label: 'Create a new order', hint: '/orders/new', icon: LayoutGrid, onSelect: () => navigate('/orders/new') },
    { id: 'features', label: 'Open feature guide', hint: 'Ctrl + Shift + F', icon: LayoutGrid, onSelect: () => setFeaturesOpen(true) },
    { id: 'shortcuts', label: 'Show keyboard shortcuts', hint: '?', icon: Keyboard, onSelect: () => setShortcutsOpen(true) },
    { id: 'refresh', label: 'Refresh page data', hint: 'R', icon: RefreshCw, onSelect: refreshPage },
    { id: 'contrast', label: highContrast ? 'Turn off high contrast' : 'Turn on high contrast', icon: CircleAlert, onSelect: () => setHighContrast((value) => !value) },
    { id: 'text', label: largeText ? 'Turn off large text' : 'Turn on large text', icon: LayoutGrid, onSelect: () => setLargeText((value) => !value) },
    { id: 'signout', label: 'Sign out safely', hint: session ? 'End this session' : 'Already signed out', icon: LogOut, onSelect: safeSignOut },
  ], [highContrast, largeText, navigate, refreshPage, safeSignOut, session, setHighContrast, setLargeText])

  /* 10, 11, 100 — Global shortcuts, ignored while the user is typing. */
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.matches('input, textarea, select, [contenteditable="true"]')
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((value) => !value)
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFeaturesOpen(true)
        return
      }
      if (typing || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [])

  const { remaining, expiring } = useSessionCountdown(session?.token)
  const expiryKey = session?.token ?? null
  const showExpiry = expiring && dismissedExpiry !== expiryKey && Boolean(session)

  const value = useMemo<FeatureContextValue>(() => ({
    toast,
    confirm,
    announce,
    openCommandPalette: () => setCommandOpen(true),
    openShortcuts: () => setShortcutsOpen(true),
    openFeatures: () => setFeaturesOpen(true),
    openNotifications: () => setNotificationsOpen(true),
    publishNotifications,
    notifications: allNotifications,
    pendingOrders,
    queueOrder,
    retryOrder,
    safeSignOut,
    online,
    highContrast,
    toggleHighContrast: () => setHighContrast((current) => !current),
    largeText,
    toggleLargeText: () => setLargeText((current) => !current),
    reducedMotion,
    refreshPage,
  }), [announce, confirm, highContrast, largeText, online, pendingOrders, publishNotifications, queueOrder, reducedMotion, refreshPage, retryOrder, safeSignOut, setHighContrast, setLargeText, toast, allNotifications])

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

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} actions={commandActions} />
      <ShortcutHelpDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Dialog open={featuresOpen} title="Feature guide" onClose={() => setFeaturesOpen(false)} wide className="fp-guide-dialog">
        <FeaturePanel onToast={toast} />
      </Dialog>

      <Dialog
        open={notificationsOpen}
        title="Notifications"
        onClose={() => setNotificationsOpen(false)}
        footer={<button type="button" className="btn btn-secondary" onClick={() => setNotificationsOpen(false)}>Close</button>}
      >
        {allNotifications.length === 0 ? (
          <p className="fp-dialog-copy">Nothing needs your attention right now.</p>
        ) : (
          <ul className="fp-notification-list">
            {allNotifications.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                {item.actionLabel && item.onAction ? (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setNotificationsOpen(false)
                      item.onAction?.()
                    }}
                  >
                    {item.actionLabel}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Dialog>

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
