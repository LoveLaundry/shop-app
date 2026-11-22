import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Columns3,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  Inbox,
  Keyboard,
  LoaderCircle,
  RefreshCw,
  Rows3,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  bulkLabel,
  formatNumber,
  isTruncated,
  passwordStrength,
  pluralize,
  relativeTime,
  statusTone,
  toCsv,
  toJson,
  truncate,
} from './utils'
import { useFocusTrap, useOutsideClick, useTableController } from './hooks'

/* ── Shell primitives ───────────────────────────────────────────────────── */

/** 2 — The first tab stop on every screen. */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a className="fp-skip-link" href={`#${targetId}`}>
      Skip to main content
    </a>
  )
}

/** 70 — Icon-only controls must carry a label; the type enforces it. */
export function IconButton({
  label,
  icon: Icon,
  onClick,
  className = '',
  disabled,
  expanded,
  active,
  children,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  className?: string
  disabled?: boolean
  expanded?: boolean
  active?: boolean
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      className={`fp-icon-btn ${active ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
    >
      <Icon aria-hidden="true" />
      {children}
    </button>
  )
}

/** 8 — Appears only after the user has scrolled away from the top. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 420)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  if (!visible) return null
  return (
    <button
      type="button"
      className="fp-back-to-top btn btn-secondary"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp aria-hidden="true" />
    </button>
  )
}

/** 9 — A slim bar that restarts on every route change. */
export function ProgressBar({ routeKey }: { routeKey: string }) {
  return <div key={routeKey} className="fp-progress" aria-hidden="true" />
}

/** 65 — Scope is shown without exposing any token or tenant id. */
export function ScopeBadge({
  scope,
  role,
  clientType = 'SHOP',
}: {
  scope?: string
  role?: string
  clientType?: string
}) {
  return (
    <span className="fp-scope-badge" title={`Active account scope: ${scope || 'Account'}`}>
      <Check aria-hidden="true" />
      <span className="fp-scope-name">{scope || 'Account'}</span>
      <span className="fp-scope-type">{clientType}</span>
      {role ? <span className="sr-only">Role: {role}</span> : null}
    </span>
  )
}

/** 98 — Notification bell with a count drawn from live page state. */
export function NotificationBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <IconButton
      label={count > 0 ? `Notifications, ${pluralize(count, 'item')}` : 'Notifications, none'}
      icon={Bell}
      onClick={onClick}
      className="fp-bell"
    >
      {count > 0 ? <span className="fp-bell-count" aria-hidden="true">{count > 9 ? '9+' : count}</span> : null}
    </IconButton>
  )
}

/** 92 — Relative last-fetch stamp shown beside refresh controls. */
export function LastUpdated({ at, refreshing }: { at: number | null; refreshing?: boolean }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  if (refreshing) return <span className="fp-updated">Refreshing…</span>
  if (!at) return <span className="fp-updated">Not loaded yet</span>
  return <span className="fp-updated">Updated {relativeTime(at, Date.now())}</span>
}

/* ── Dialogs ────────────────────────────────────────────────────────────── */

function useDialogBodyLock(open: boolean) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])
}

/** Shared accessible overlay used by dialogs and command surfaces. */
export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
  className = '',
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  className?: string
}) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose)
  useDialogBodyLock(open)
  if (!open) return null
  return (
    <div className="fp-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={ref}
        className={[wide ? 'fp-dialog fp-dialog-wide' : 'fp-dialog', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="fp-dialog-head">
          <h2 className="panel-title">{title}</h2>
          <IconButton label="Close dialog" icon={X} onClick={onClose} />
        </div>
        <div className="fp-dialog-body">{children}</div>
        {footer ? <div className="fp-dialog-foot">{footer}</div> : null}
      </div>
    </div>
  )
}

/** 32 — Side drawer with the same focus and Escape behaviour as a dialog. */
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useFocusTrap<HTMLElement>(open, onClose)
  useDialogBodyLock(open)
  if (!open) return null
  return (
    <div className="fp-overlay fp-overlay-drawer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside ref={ref} className="fp-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="fp-dialog-head">
          <h2 className="panel-title">{title}</h2>
          <IconButton label="Close details" icon={X} onClick={onClose} />
        </div>
        <div className="fp-drawer-body">{children}</div>
      </aside>
    </div>
  )
}

/** 47 — Destructive actions always pass through this confirm surface. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className={tone === 'danger' ? 'btn btn-primary fp-danger-btn' : 'btn btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="fp-dialog-copy">{message}</p>
    </Dialog>
  )
}

export interface ToastItem {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
  actionLabel?: string
  onAction?: () => void
}

/** 48 — Toasts are announced once and can carry a single recovery action. */
export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fp-toasts" aria-live="polite" aria-atomic="false">
      {items.map((toast) => (
        <div key={toast.id} className={`fp-toast fp-toast-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
          {toast.tone === 'success' ? <CircleCheck aria-hidden="true" /> : toast.tone === 'error' ? <CircleAlert aria-hidden="true" /> : <Keyboard aria-hidden="true" />}
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction ? (
            <button type="button" className="fp-toast-action" onClick={toast.onAction}>{toast.actionLabel}</button>
          ) : null}
          <IconButton label="Dismiss notification" icon={X} onClick={() => onDismiss(toast.id)} />
        </div>
      ))}
    </div>
  )
}

export interface CommandAction {
  id: string
  label: string
  hint?: string
  icon?: LucideIcon
  onSelect: () => void
}

/** 10 — Ctrl/Cmd+K palette with arrow-key navigation. */
export function CommandPalette({
  open,
  onClose,
  actions,
}: {
  open: boolean
  onClose: () => void
  actions: CommandAction[]
}) {
  const [term, setTerm] = useState('')
  const [cursor, setCursor] = useState(0)
  const ref = useFocusTrap<HTMLDivElement>(open, onClose)
  useDialogBodyLock(open)

  const matches = useMemo(() => {
    const needle = term.trim().toLowerCase()
    if (!needle) return actions
    return actions.filter((action) => `${action.label} ${action.hint ?? ''}`.toLowerCase().includes(needle))
  }, [actions, term])

  useEffect(() => {
    setCursor(0)
  }, [term, open])

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((value) => Math.min(value + 1, Math.max(0, matches.length - 1)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((value) => Math.max(0, value - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const action = matches[cursor]
      if (action) {
        onClose()
        action.onSelect()
      }
    }
  }

  if (!open) return null
  return (
    <div className="fp-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={ref} className="fp-dialog fp-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="fp-palette-search">
          <Search aria-hidden="true" />
          {/* 74 — The visible placeholder is backed by a real label. */}
          <label htmlFor="fp-palette-input" className="sr-only">Search commands</label>
          <input
            id="fp-palette-input"
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search actions…"
            className="field-input"
            autoComplete="off"
          />
          <IconButton label="Close command palette" icon={X} onClick={onClose} />
        </div>
        <div className="fp-palette-list" role="listbox" aria-label="Available actions">
          {matches.length === 0 ? <p className="fp-palette-empty">No matching actions.</p> : null}
          {matches.map((action, index) => {
            const Icon = action.icon ?? ChevronRightIcon
            return (
              <button
                key={action.id}
                type="button"
                role="option"
                aria-selected={index === cursor}
                className={index === cursor ? 'fp-palette-item is-cursor' : 'fp-palette-item'}
                onMouseEnter={() => setCursor(index)}
                onClick={() => {
                  onClose()
                  action.onSelect()
                }}
              >
                <Icon aria-hidden="true" />
                <span>{action.label}</span>
                {action.hint ? <small>{action.hint}</small> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const ChevronRightIcon = ChevronRight

/** 11 — The shortcut list is reachable from the palette and the help key. */
export function ShortcutHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const shortcuts = [
    ['Ctrl / ⌘ + K', 'Open the command palette'],
    ['?', 'Open this shortcut help'],
    ['/', 'Focus the table search field'],
    ['R', 'Refresh the current page data'],
    ['Esc', 'Close a dialog, drawer or menu'],
    ['Enter / Space', 'Open details for a focused table row'],
  ]
  return (
    <Dialog open={open} title="Keyboard shortcuts" onClose={onClose}>
      <dl className="fp-shortcuts">
        {shortcuts.map(([key, description]) => (
          <div key={key}>
            <dt><kbd>{key}</kbd></dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  )
}

/* ── Form primitives ────────────────────────────────────────────────────── */

/** 33, 45 — Labels, required markers and optional hover/focus help. */
export function Field({
  label,
  htmlFor,
  required,
  help,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  help?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className={error ? 'fp-field has-error' : 'fp-field'}>
      <div className="fp-field-label-row">
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required ? (
            <>
              {' '}
              <span className="fp-required" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </>
          ) : null}
        </label>
        {help ? (
          <span className="fp-help" tabIndex={0} role="note" aria-label={`Help: ${help}`} title={help}>?</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="fp-field-error" id={`${htmlFor}-error`}>{error}</p> : hint ? <p className="fp-field-hint">{hint}</p> : null}
    </div>
  )
}

/** 60, 61 — Password visibility toggle plus a non-judgemental strength meter. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  autoComplete = 'current-password',
  required = true,
  showStrength = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  autoComplete?: string
  required?: boolean
  showStrength?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const strength = passwordStrength(value)
  return (
    <Field label={label} htmlFor={id} required={required} error={error}>
      <div className="fp-password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="field-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <IconButton
          label={visible ? 'Hide password' : 'Show password'}
          icon={visible ? EyeOff : Eye}
          onClick={() => setVisible((current) => !current)}
          className="fp-password-toggle"
        />
      </div>
      {showStrength && value ? <PasswordStrengthMeter score={strength.score} label={strength.label} hints={strength.hints} /> : null}
    </Field>
  )
}

export function PasswordStrengthMeter({
  score,
  label,
  hints,
}: {
  score: number
  label: string
  hints: string[]
}) {
  return (
    <div className="fp-strength">
      <div className="fp-strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => <span key={step} className={step <= score ? 'is-filled' : ''} />)}
      </div>
      <p className="fp-strength-label">Strength: {label}</p>
      {hints.length ? <p className="fp-strength-hint">{hints[0]}</p> : null}
    </div>
  )
}

/** 40 — Reusable bounded-length counter for textareas. */
export function CharacterCounter({ value, max }: { value: string; max: number }) {
  const remaining = Math.max(0, max - value.length)
  return (
    <p className={remaining <= 20 ? 'fp-counter is-low' : 'fp-counter'} aria-live="polite">
      {formatNumber(value.length)} / {formatNumber(max)} characters · {formatNumber(remaining)} left
    </p>
  )
}

/** 80 — Error summary with links back to the offending fields. */
export function ErrorSummary({
  errors,
  idFor = (key) => key,
}: {
  errors: Record<string, string>
  idFor?: (key: string) => string
}) {
  const entries = Object.entries(errors)
  if (entries.length === 0) return null
  return (
    <div className="fp-error-summary" role="alert" tabIndex={-1}>
      <strong>Fix {pluralize(entries.length, 'field')} before continuing</strong>
      <ul>
        {entries.map(([key, message]) => (
          <li key={key}><a href={`#${idFor(key)}`}>{message}</a></li>
        ))}
      </ul>
    </div>
  )
}

/** 38 — Explicit decision for a draft found in local storage. */
export function DraftBanner({ onRestore, onDiscard }: { onRestore: () => void; onDiscard: () => void }) {
  return (
    <div className="notice notice--warning fp-draft-banner">
      <RefreshCw aria-hidden="true" />
      <div>
        <strong>Draft found</strong>
        <p>You have an unsent order saved on this device.</p>
        <div className="notice-action fp-row-actions">
          <button type="button" className="btn btn-secondary" onClick={onRestore}>Restore draft</button>
          <button type="button" className="btn btn-ghost" onClick={onDiscard}>Discard draft</button>
        </div>
      </div>
    </div>
  )
}

/** 52 — Compact save indicator next to the form heading. */
export function AutosaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  return (
    <span className="fp-autosave" aria-live="polite">
      {status === 'saving' ? <LoaderCircle aria-hidden="true" /> : <Check aria-hidden="true" />}
      {status === 'saving' ? 'Saving draft…' : status === 'saved' ? 'Draft saved' : 'Local draft'}
    </span>
  )
}

/** 51 — Optional form sections collapse without losing their values. */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="fp-collapsible">
      <button type="button" className="fp-collapsible-trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <ChevronDown aria-hidden="true" /> : <ChevronRightIcon aria-hidden="true" />}
        {title}
      </button>
      {open ? <div className="fp-collapsible-body">{children}</div> : null}
    </div>
  )
}

/** 50 — Step indicator with a real active state supplied by the form. */
export function Steps({ steps, active }: { steps: string[]; active: number }) {
  return (
    <ol className="fp-steps" aria-label="Order progress">
      {steps.map((step, index) => (
        <li
          key={step}
          className={index === active ? 'is-current' : index < active ? 'is-done' : ''}
          aria-current={index === active ? 'step' : undefined}
        >
          <span aria-hidden="true">{index < active ? <Check /> : index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  )
}

/** 77 — Only shortened values get a tooltip. */
export function TooltipText({ value, max = 32 }: { value: string; max?: number }) {
  const shortened = isTruncated(value, max)
  return <span title={shortened ? value : undefined}>{shortened ? truncate(value, max) : value}</span>
}

/* ── Data table ─────────────────────────────────────────────────────────── */

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  exportValue?: (row: T) => string | number | null | undefined
  sortable?: boolean
  optional?: boolean
  align?: 'left' | 'right'
}

export interface DataTableProps<T> {
  id: string
  caption: string
  rows: T[]
  columns: TableColumn<T>[]
  idOf: (row: T) => string
  searchable: Array<(row: T) => string>
  statusOf?: (row: T) => string
  statusOptions?: string[]
  dateOf?: (row: T) => string | null | undefined
  sortValue?: (row: T, key: string) => string | number | null | undefined
  initialPageSize?: number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDetail?: string
  emptyAction?: ReactNode
  renderDetail?: (row: T) => ReactNode
  toolbarExtra?: ReactNode
  onToast?: (message: string) => void
  showExport?: boolean
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** 13–31, 71, 79, 81 — One table implementation for orders and bills. */
export function DataTable<T>({
  id,
  caption,
  rows,
  columns,
  idOf,
  searchable,
  statusOf,
  statusOptions,
  dateOf,
  sortValue,
  initialPageSize = 10,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDetail,
  emptyAction,
  renderDetail,
  toolbarExtra,
  onToast,
  showExport = true,
}: DataTableProps<T>) {
  const controller = useTableController(rows, {
    idOf,
    searchable,
    statusOf,
    dateOf,
    sortValue,
    initialPageSize,
    initialHidden: [],
  })
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const menuRef = useOutsideClick<HTMLDivElement>(columnMenuOpen, () => setColumnMenuOpen(false))
  const [detailRow, setDetailRow] = useState<T | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const visibleColumns = useMemo(
    () => columns.filter((column) => !controller.hiddenColumns.has(column.key)),
    [columns, controller.hiddenColumns],
  )
  const visibleRows = controller.rows
  const visibleIds = visibleRows.map(idOf)
  const selectedRows = controller.filtered.filter((row) => controller.selected.has(idOf(row)))
  const selectedCount = controller.selected.size
  const allSelected = visibleIds.length > 0 && visibleIds.every((rowId) => controller.selected.has(rowId))

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected
    }
  }, [selectedCount, allSelected, visibleIds.length])

  const exportColumns = columns.map((column) => ({
    key: column.key,
    label: column.header,
    value: column.exportValue ?? ((row: T) => String((row as Record<string, unknown>)[column.key] ?? '')),
  }))
  const exportRows = (selectedCount > 0 ? selectedRows : controller.filtered).map((row) =>
    Object.fromEntries(exportColumns.map((column) => [column.key, column.value(row)])),
  )

  function exportAs(kind: 'csv' | 'json') {
    const content = kind === 'csv'
      ? toCsv(exportRows, exportColumns)
      : toJson(exportRows)
    download(content, `${id}-${new Date().toISOString().slice(0, 10)}.${kind}`, kind === 'csv' ? 'text/csv' : 'application/json')
    onToast?.(`Exported ${pluralize(exportRows.length, 'row')} as ${kind.toUpperCase()}.`)
  }

  async function copyIds(ids: string[]) {
    if (!ids.length) return
    try {
      await navigator.clipboard.writeText(ids.join('\n'))
      onToast?.(`Copied ${pluralize(ids.length, 'id')} to the clipboard.`)
    } catch {
      onToast?.('Clipboard access was blocked. Copy is unavailable in this browser.')
    }
  }

  function activate(row: T) {
    if (renderDetail) setDetailRow(row)
  }

  const sortIcon = (key: string): LucideIcon =>
    controller.sortKey !== key ? ArrowUpDown : controller.sortDirection === 'asc' ? ArrowUp : ArrowDown

  const toolbar = (
    <div className="fp-table-toolbar">
      <label className="fp-search" htmlFor={`${id}-search`}>
        <span className="sr-only">Search {caption.toLowerCase()}</span>
        <Search aria-hidden="true" />
        <input
          id={`${id}-search`}
          className="field-input"
          placeholder="Search this page…"
          value={controller.searchInput}
          onChange={(event) => controller.setSearchInput(event.target.value)}
          autoComplete="off"
        />
      </label>

      {statusOf && statusOptions?.length ? (
        <label className="fp-toolbar-field">
          <span className="sr-only">Filter by status</span>
          <select className="field-input select-input" value={controller.status} onChange={(event) => controller.setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {statusOptions.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
      ) : null}

      {dateOf ? (
        <div className="fp-date-range">
          <label>
            <span className="sr-only">From date</span>
            <input type="date" className="field-input" value={controller.dateFrom} onChange={(event) => controller.setDateFrom(event.target.value)} aria-label="From date" />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span className="sr-only">To date</span>
            <input type="date" className="field-input" value={controller.dateTo} onChange={(event) => controller.setDateTo(event.target.value)} aria-label="To date" />
          </label>
        </div>
      ) : null}

      <div className="fp-toolbar-menu" ref={menuRef}>
        <button
          type="button"
          className="btn btn-secondary"
          aria-expanded={columnMenuOpen}
          onClick={() => setColumnMenuOpen((value) => !value)}
        >
          <Columns3 aria-hidden="true" /> Columns
        </button>
        {columnMenuOpen ? (
          <div className="fp-menu" role="group" aria-label="Visible columns">
            {columns.map((column) => (
              <label key={column.key} className="fp-menu-item">
                <input
                  type="checkbox"
                  checked={!controller.hiddenColumns.has(column.key)}
                  onChange={() => controller.toggleColumn(column.key)}
                />
                {column.header}
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <IconButton
        label={controller.density === 'compact' ? 'Use comfortable rows' : 'Use compact rows'}
        icon={Rows3}
        onClick={() => controller.setDensity(controller.density === 'compact' ? 'comfortable' : 'compact')}
        active={controller.density === 'compact'}
      />

      {showExport ? (
        <div className="fp-export-group">
          <IconButton label="Export visible rows as CSV" icon={FileSpreadsheet} onClick={() => exportAs('csv')} />
          <IconButton label="Export visible rows as JSON" icon={FileJson} onClick={() => exportAs('json')} />
        </div>
      ) : null}

      {toolbarExtra}
    </div>
  )

  return (
    <div className="fp-table" data-density={controller.density}>
      {toolbar}

      {selectedCount > 0 ? (
        <div className="fp-bulk-bar" role="status">
          <strong>{bulkLabel(selectedCount)}</strong>
          <button type="button" className="btn btn-secondary" onClick={() => void copyIds([...controller.selected])}>
            <Copy aria-hidden="true" /> Copy IDs
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => exportAs('csv')}>
            <Download aria-hidden="true" /> Export CSV
          </button>
          <IconButton label="Clear selection" icon={X} onClick={controller.clearSelection} />
        </div>
      ) : null}

      <a className="fp-skip-pagination" href={`#${id}-pagination`}>Skip to pagination</a>

      <div className="data-table-wrap fp-table-wrap">
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="fp-check-col">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  aria-label={`Select all rows on this page of ${caption}`}
                  checked={allSelected}
                  onChange={(event) => controller.toggleAll(visibleIds, event.target.checked)}
                />
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={controller.sortKey === column.key ? (controller.sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={column.align === 'right' ? 'fp-align-right' : undefined}
                >
                  {column.sortable ? (
                    <button type="button" className="fp-sort-button" onClick={() => controller.toggleSort(column.key)}>
                      {column.header}
                      {(() => { const Icon = sortIcon(column.key); return <Icon aria-hidden="true" /> })()}
                    </button>
                  ) : column.header}
                </th>
              ))}
              <th scope="col" className="fp-actions-col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleColumns.length + 2}><SkeletonRows count={5} /></td></tr>
            ) : error ? (
              <tr>
                <td colSpan={visibleColumns.length + 2}>
                  <div className="fp-table-state" role="alert">
                    <CircleAlert aria-hidden="true" />
                    <p>{error}</p>
                    {onRetry ? <button type="button" className="btn btn-secondary" onClick={onRetry}><RefreshCw aria-hidden="true" /> Try again</button> : null}
                  </div>
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2}>
                  <div className="fp-table-state">
                    <Inbox aria-hidden="true" />
                    <p>{emptyTitle}</p>
                    {emptyDetail ? <small>{emptyDetail}</small> : null}
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const rowId = idOf(row)
                return (
                  <tr
                    key={rowId}
                    className={controller.selected.has(rowId) ? 'is-selected' : undefined}
                    tabIndex={0}
                    aria-label={`Open details for ${rowId}`}
                    onClick={() => activate(row)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        activate(row)
                      }
                    }}
                  >
                    <td className="fp-check-col" onClick={(event) => event.stopPropagation()}>
                      <input type="checkbox" checked={controller.selected.has(rowId)} onChange={() => controller.toggleRow(rowId)} aria-label={`Select row ${rowId}`} />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.key} className={column.align === 'right' ? 'fp-align-right tabular-nums' : undefined}>
                        {column.render(row)}
                      </td>
                    ))}
                    <td className="fp-actions-col" onClick={(event) => event.stopPropagation()}>
                      <div className="fp-row-actions">
                        <IconButton label={`Copy ID ${rowId}`} icon={Copy} onClick={() => void copyIds([rowId])} />
                        {renderDetail ? <IconButton label={`View details for ${rowId}`} icon={ChevronRight} onClick={() => setDetailRow(row)} /> : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 28 — Narrow screens get the same data as labelled cards. */}
      <div className="fp-cards">
        {loading ? <SkeletonRows count={3} /> : error ? <p className="fp-table-state">{error}</p> : null}
        {!loading && !error ? visibleRows.map((row) => (
          <article key={idOf(row)} className="fp-card" tabIndex={0} onClick={() => activate(row)} onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              activate(row)
            }
          }}>
            <div className="fp-card-head">
              <strong>{visibleColumns[0]?.render(row)}</strong>
              <IconButton label={`Copy ID ${idOf(row)}`} icon={Copy} onClick={() => void copyIds([idOf(row)])} />
            </div>
            {visibleColumns.slice(1).map((column) => (
              <div key={column.key} className="fp-card-row">
                <span>{column.header}</span>
                <span>{column.render(row)}</span>
              </div>
            ))}
          </article>
        )) : null}
        {!loading && !error && visibleRows.length === 0 ? (
          <div className="fp-table-state"><Inbox aria-hidden="true" /><p>{emptyTitle}</p>{emptyDetail}</div>
        ) : null}
      </div>

      <div id={`${id}-pagination`} className="fp-pagination" tabIndex={-1}>
        <label className="fp-page-size">
          Rows per page
          <select
            className="field-input select-input"
            value={controller.pageSize}
            onChange={(event) => controller.setPageSize(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span className="pagination-count">
          {controller.range.start}–{controller.range.end} of {controller.totalBeforePaging}
        </span>
        <div className="pagination-actions">
          <button type="button" className="btn btn-secondary" onClick={() => controller.setPage(controller.range.page - 1)} disabled={controller.range.page === 0} aria-label="Previous page">
            <ChevronLeft aria-hidden="true" /> Previous
          </button>
          <span className="pagination-count">{controller.range.page + 1} / {controller.range.pageCount}</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => controller.setPage(Math.min(controller.range.page + 1, controller.range.pageCount - 1))}
            disabled={controller.range.page + 1 >= controller.range.pageCount}
            aria-label="Next page"
          >
            Next <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {renderDetail ? (
        <Drawer open={Boolean(detailRow)} title="Record details" onClose={() => setDetailRow(null)}>
          {detailRow ? renderDetail(detailRow) : null}
        </Drawer>
      ) : null}
    </div>
  )
}

/** 30 — Shape-preserving placeholders, never fake numbers. */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="fp-skeleton" role="status" aria-label="Loading rows">
      <span className="sr-only">Loading rows…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="fp-skeleton-row">
          <span /><span /><span /><span />
        </div>
      ))}
    </div>
  )
}

/* ── Error boundary ─────────────────────────────────────────────────────── */

interface BoundaryState {
  error: Error | null
}

/** 94 — A render failure never strands the user on a blank screen. */
export class FeatureErrorBoundary extends Component<
  { children: ReactNode; onReset?: () => void },
  BoundaryState
> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portal screen failed to render', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="state-box" role="alert">
        <div>
          <span className="state-icon is-error" aria-hidden="true"><CircleAlert /></span>
          <p className="state-box-text state-box-error">This screen could not be displayed.</p>
          <p className="state-box-detail">Your session is still active. Reset the screen to try again.</p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '0.8rem' }}
            onClick={() => {
              this.setState({ error: null })
              this.props.onReset?.()
            }}
          >
            <RefreshCw aria-hidden="true" /> Reset screen
          </button>
        </div>
      </div>
    )
  }
}

/** Small utility used by pages that need an inline retry control. */
export function RetryInline({ onRetry, message = 'Could not load this section.' }: { onRetry: () => void; message?: string }) {
  return (
    <div className="fp-inline-error" role="alert">
      <CircleAlert aria-hidden="true" />
      <span>{message}</span>
      <button type="button" className="btn btn-secondary" onClick={onRetry}><RefreshCw aria-hidden="true" /> Retry</button>
    </div>
  )
}

/** Status chips use the shared tone rules without importing UI kit internals. */
export function ToneChip({ status }: { status: string | null | undefined }) {
  const value = (status ?? '').toUpperCase()
  return <span className={`chip fp-chip-${statusTone(value)}`}>{value.replaceAll('_', ' ') || '—'}</span>
}

