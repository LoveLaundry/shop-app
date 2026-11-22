/**
 * The single source of truth for the feature pack.
 *
 * The dialog, the /features route and FEATURE_PACK.md are all generated from
 * this list, so a feature cannot be documented without shipping a code path.
 */
export interface FeatureEntry {
  id: number
  title: string
  detail: string
  file: string
  area: 'Shell' | 'Tables' | 'Forms' | 'Auth & session' | 'Data & feedback' | 'Accessibility'
}

export const FEATURE_MANIFEST: FeatureEntry[] = [
  { id: 1, title: 'Route document titles', detail: 'Syncs document.title with the active route label on every navigation.', file: 'src/features/feature-pack/hooks.ts', area: 'Shell' },
  { id: 2, title: 'Skip to content', detail: 'Adds a keyboard-first skip link that focuses the routed main landmark.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 3, title: 'Sticky header shadow', detail: 'Tracks scrolling and adds a restrained shadow to the sticky top bar.', file: 'src/features/feature-pack/hooks.ts', area: 'Shell' },
  { id: 4, title: 'Mobile drawer focus trap', detail: 'Keeps Tab focus inside the mobile navigation drawer while it is open.', file: 'src/features/feature-pack/hooks.ts', area: 'Accessibility' },
  { id: 5, title: 'Drawer closes on route change', detail: 'Dismisses the mobile drawer whenever the location changes.', file: 'src/shell/AppShell.tsx', area: 'Shell' },
  { id: 6, title: 'Current navigation item', detail: 'Exposes aria-current="page" on the active desktop and mobile links.', file: 'src/shell/AppShell.tsx', area: 'Accessibility' },
  { id: 7, title: 'Persisted collapsed sidebar', detail: 'Remembers the collapsed rail choice in local storage and restores it.', file: 'src/features/feature-pack/hooks.ts', area: 'Shell' },
  { id: 8, title: 'Back to top', detail: 'Shows a labelled control that scrolls the page back to the top only when needed.', file: 'src/features/feature-pack/components.tsx', area: 'Shell' },
  { id: 9, title: 'Route progress bar', detail: 'Runs a slim progress indicator across the top on each route change.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Shell' },
  { id: 10, title: 'Command palette', detail: 'Ctrl/Cmd+K opens a searchable palette of navigation and display actions.', file: 'src/features/feature-pack/components.tsx', area: 'Shell' },
  { id: 11, title: 'Shortcut help', detail: 'Question-mark or palette action opens a dialog listing supported shortcuts.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Accessibility' },
  { id: 12, title: 'Reduced motion', detail: 'Reads the OS preference and disables non-essential transitions and progress motion.', file: 'src/features/feature-pack/hooks.ts', area: 'Accessibility' },
  { id: 13, title: 'Debounced table search', detail: 'Delays table filtering by 200ms to avoid a filter per keystroke.', file: 'src/features/feature-pack/hooks.ts', area: 'Tables' },
  { id: 14, title: 'Status filter', detail: 'Filters table rows by a normalised status value with an all-statuses option.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 15, title: 'Date-range filter', detail: 'Applies inclusive from/to date bounds to rows that expose a date.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 16, title: 'Sortable columns', detail: 'Column headers toggle ascending and descending order with aria-sort.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 17, title: 'Column visibility', detail: 'A menu lets a user hide and restore optional table columns.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 18, title: 'Table density', detail: 'Toggles comfortable and compact row padding for data tables.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 19, title: 'Row selection', detail: 'Per-row checkboxes drive selection-aware bulk actions.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 20, title: 'Indeterminate select-all', detail: 'The header checkbox reflects none, some or all rows selected.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 21, title: 'Bulk action bar', detail: 'Shows selected count with export, copy-id and clear-selection actions.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 22, title: 'CSV export', detail: 'Downloads the visible rows as escaped CSV with a readable header row.', file: 'src/features/feature-pack/utils.ts', area: 'Tables' },
  { id: 23, title: 'JSON export', detail: 'Downloads the visible rows as indented JSON for handoff or debugging.', file: 'src/features/feature-pack/utils.ts', area: 'Tables' },
  { id: 24, title: 'Copy row ID', detail: 'Copies a row identifier to the clipboard and confirms with a toast.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 25, title: 'Page-size selector', detail: 'Chooses 10, 25 or 50 rows per page and resets to a valid page.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 26, title: 'Pagination range clamp', detail: 'Clamps stale page numbers and displays the true start–end range.', file: 'src/features/feature-pack/utils.ts', area: 'Tables' },
  { id: 27, title: 'Sticky table header', detail: 'Keeps the table header visible while long result sets scroll.', file: 'src/index.css', area: 'Tables' },
  { id: 28, title: 'Responsive card fallback', detail: 'Renders the same rows as labelled cards on narrow screens.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 29, title: 'Empty state action', detail: 'Shows a contextual message and a real next action when there are no rows.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 30, title: 'Skeleton loading rows', detail: 'Renders shape-preserving skeleton rows instead of a blank table.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 31, title: 'Inline error and retry', detail: 'Keeps the table in place while showing a normalised error and retry button.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 32, title: 'Row detail drawer', detail: 'Opens a focus-trapped side drawer with full row detail and Escape to close.', file: 'src/features/feature-pack/components.tsx', area: 'Tables' },
  { id: 33, title: 'Required-field markers', detail: 'Marks required fields visually and announces them to assistive tech.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 34, title: 'Blur validation', detail: 'Validates a field when it loses focus, not only on submit.', file: 'src/features/feature-pack/hooks.ts', area: 'Forms' },
  { id: 35, title: 'Valid-gated submit', detail: 'Disables the send action until every visible line is valid.', file: 'src/pages/NewOrderPage.tsx', area: 'Forms' },
  { id: 36, title: 'Submit-once guard', detail: 'Locks a form immediately on submit so double clicks cannot rewrite data.', file: 'src/features/feature-pack/hooks.ts', area: 'Forms' },
  { id: 37, title: 'Draft autosave', detail: 'Persists the in-progress order locally after each edit.', file: 'src/features/feature-pack/hooks.ts', area: 'Forms' },
  { id: 38, title: 'Draft restore banner', detail: 'Offers Restore or Discard for a draft left by an earlier visit.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 39, title: 'Reset form', detail: 'Restores a clean single-line form after confirmation.', file: 'src/pages/NewOrderPage.tsx', area: 'Forms' },
  { id: 40, title: 'Character counter', detail: 'Shows used and remaining characters on bounded text fields.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 41, title: 'Currency formatting', detail: 'Formats money with en-LK conventions and a visible currency code.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 42, title: 'Number formatting', detail: 'Formats counts with locale grouping and non-finite fallbacks.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 43, title: 'Date formatting', detail: 'Formats API dates consistently and keeps raw values when unparsable.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 44, title: 'Duplicate-row detection', detail: 'Warns about repeated item names before an order is sent.', file: 'src/pages/NewOrderPage.tsx', area: 'Forms' },
  { id: 45, title: 'Field help tooltips', detail: 'Adds hover and focus help text to fields that need explanation.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 46, title: 'Optimistic create', detail: 'Queues a new order in the shell, navigates immediately and reconciles the result.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Data & feedback' },
  { id: 47, title: 'Confirm destructive dialog', detail: 'Requires confirmation before removing lines or ending a session.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Accessibility' },
  { id: 48, title: 'Success toasts', detail: 'Shows short polite or alert toasts for completed actions and failures.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Data & feedback' },
  { id: 49, title: 'Normalised errors', detail: 'Converts HTTP, timeout and network failures into one calm message format.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 50, title: 'Multi-step progress', detail: 'Shows Lines, Review and Send progress with a real step gate.', file: 'src/pages/NewOrderPage.tsx', area: 'Forms' },
  { id: 51, title: 'Collapsible sections', detail: 'Lets users collapse optional order notes without losing content.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 52, title: 'Autosave indicator', detail: 'Reports Saved, Saving and Draft restored states next to the form heading.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 53, title: 'Multi-laundry choice', detail: 'Keeps the 409 choice screen with distinct, scoped laundry candidates.', file: 'src/auth/LoginPage.tsx', area: 'Auth & session' },
  { id: 54, title: 'Suspended association', detail: 'Disables suspended choices and switch options after status normalisation.', file: 'src/features/feature-pack/utils.ts', area: 'Auth & session' },
  { id: 55, title: 'Role-specific labels', detail: 'Shows shop admin or shop staff labels and rejects generic roles.', file: 'src/features/feature-pack/utils.ts', area: 'Auth & session' },
  { id: 56, title: 'Switch without reload', detail: 'Exchanges the token, clears the old cache and remounts scoped pages.', file: 'src/auth/AuthContext.tsx', area: 'Auth & session' },
  { id: 57, title: 'Remember last laundry', detail: 'Restores the most recently used eligible laundry after sign-in.', file: 'src/features/feature-pack/hooks.ts', area: 'Auth & session' },
  { id: 58, title: 'Clear session on 401', detail: 'Broadcasts a 401 event so caches and UI are cleared with the token.', file: 'src/api/client.ts', area: 'Auth & session' },
  { id: 59, title: 'Session expiry warning', detail: 'Warns shortly before token expiry with sign-out and refresh actions.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Auth & session' },
  { id: 60, title: 'Show or hide password', detail: 'Toggles password visibility with a labelled icon button.', file: 'src/features/feature-pack/components.tsx', area: 'Auth & session' },
  { id: 61, title: 'Password strength meter', detail: 'Scores the entered sign-in password and lists concrete improvements.', file: 'src/features/feature-pack/components.tsx', area: 'Auth & session' },
  { id: 62, title: 'Registration validation', detail: 'Validates access-request fields and builds a copyable request summary.', file: 'src/auth/RegisterPage.tsx', area: 'Auth & session' },
  { id: 63, title: 'Fixed clientType', detail: 'Pins clientType to SHOP in config and in the login request body.', file: 'src/config/app.ts', area: 'Auth & session' },
  { id: 64, title: 'Safe exit action', detail: 'Offers a clear exit from non-portal pages without a support-mode concept.', file: 'src/auth/RegisterPage.tsx', area: 'Auth & session' },
  { id: 65, title: 'Scope badge', detail: 'Displays the active laundry account and SHOP scope in the top bar.', file: 'src/features/feature-pack/components.tsx', area: 'Shell' },
  { id: 66, title: 'Safe sign-out', detail: 'Confirms sign-out, clears scoped caches and returns to the login screen.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Auth & session' },
  { id: 67, title: 'Last sign-in info', detail: 'Records and shows the previous successful sign-in time and account.', file: 'src/pages/TodayPage.tsx', area: 'Auth & session' },
  { id: 68, title: 'Live regions', detail: 'Announces route, save and queue state changes through aria-live regions.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Accessibility' },
  { id: 69, title: 'Focus-visible rings', detail: 'Applies a consistent visible focus outline across all interactive controls.', file: 'src/index.css', area: 'Accessibility' },
  { id: 70, title: 'Labelled icon buttons', detail: 'Requires an accessible label on every icon-only control.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 71, title: 'Keyboard row activation', detail: 'Enter or Space opens the detail drawer for a focused table row.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 72, title: 'Escape closes overlays', detail: 'A shared Escape handler closes drawers, dialogs, menus and the palette.', file: 'src/features/feature-pack/hooks.ts', area: 'Accessibility' },
  { id: 73, title: 'Focus restoration', detail: 'Returns focus to the triggering control when an overlay closes.', file: 'src/features/feature-pack/hooks.ts', area: 'Accessibility' },
  { id: 74, title: 'Screen-reader text', detail: 'Adds sr-only labels to icon controls, filters and landmark links.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 75, title: 'High-contrast mode', detail: 'Persists a high-contrast display mode that strengthens borders and text.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Accessibility' },
  { id: 76, title: 'Large-text mode', detail: 'Persists a larger base font size without changing the type scale.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Accessibility' },
  { id: 77, title: 'Truncated-text tooltip', detail: 'Shows a native tooltip only when a value is actually shortened.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 78, title: 'Semantic landmarks', detail: 'Wraps routed content in labelled main, navigation, header and footer landmarks.', file: 'src/shell/AppShell.tsx', area: 'Accessibility' },
  { id: 79, title: 'Table captions', detail: 'Gives every data table an accessible caption describing its contents.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 80, title: 'Form error summary', detail: 'Lists field errors at the top of a form with links back to each field.', file: 'src/features/feature-pack/components.tsx', area: 'Forms' },
  { id: 81, title: 'Skip pagination link', detail: 'Adds a keyboard link from the table body to the pagination controls.', file: 'src/features/feature-pack/components.tsx', area: 'Accessibility' },
  { id: 82, title: 'Refresh and search keys', detail: 'R reloads page data and / focuses the table search outside text fields.', file: 'src/features/feature-pack/hooks.ts', area: 'Tables' },
  { id: 83, title: 'Normalised item arrays', detail: 'Treats null, wrapped or missing item collections as an empty array.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 84, title: 'Nested item totals', detail: 'Aggregates nested order items once for sent and received counts.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 85, title: 'Stale-while-revalidate', detail: 'Shows cached scoped data instantly while a quiet refresh is in flight.', file: 'src/features/feature-pack/hooks.ts', area: 'Data & feedback' },
  { id: 86, title: 'Backoff retries', detail: 'Retries retryable request failures with capped exponential delays.', file: 'src/features/feature-pack/hooks.ts', area: 'Data & feedback' },
  { id: 87, title: 'Timeout messaging', detail: 'Explains aborted requests separately from other network failures.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 88, title: 'Offline indicator', detail: 'Shows a persistent, non-alarming offline status in the shell.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Data & feedback' },
  { id: 89, title: 'Queued action indicator', detail: 'Counts optimistic writes waiting for the server in the shell.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Data & feedback' },
  { id: 90, title: 'Session-scoped cache', detail: 'Includes the session token in every cache key to isolate tenants.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 91, title: 'Cache clear on sign-out', detail: 'Drops all scoped cached responses when the session ends.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Auth & session' },
  { id: 92, title: 'Last-updated stamp', detail: 'Displays when page data was last fetched using a relative timestamp.', file: 'src/features/feature-pack/components.tsx', area: 'Data & feedback' },
  { id: 93, title: 'Refresh page data', detail: 'Provides a labelled refresh control and R shortcut on data pages.', file: 'src/features/feature-pack/hooks.ts', area: 'Data & feedback' },
  { id: 94, title: 'Error boundary reset', detail: 'Catches render failures and offers a reset that stays inside the portal.', file: 'src/features/feature-pack/components.tsx', area: 'Data & feedback' },
  { id: 95, title: 'Response size guard', detail: 'Rejects unexpectedly large API payloads before they reach a page.', file: 'src/features/feature-pack/hooks.ts', area: 'Data & feedback' },
  { id: 96, title: 'Idempotency keys', detail: 'Adds a stable key header to order writes so retries cannot duplicate them.', file: 'src/features/feature-pack/utils.ts', area: 'Data & feedback' },
  { id: 97, title: 'Rapid-submit dedupe', detail: 'Drops repeat submits while an identical request is still in flight.', file: 'src/features/feature-pack/hooks.ts', area: 'Forms' },
  { id: 98, title: 'Notification badge', detail: 'Shows a count badge derived from current page and queue notifications.', file: 'src/features/feature-pack/components.tsx', area: 'Data & feedback' },
  { id: 99, title: 'Notification dialog', detail: 'Lists notification details in an accessible dialog with clear actions.', file: 'src/features/feature-pack/FeatureProvider.tsx', area: 'Data & feedback' },
  { id: 100, title: 'Feature manifest panel', detail: 'Lists all shipped features with search, area filter and source paths.', file: 'src/features/feature-pack/FeaturePanel.tsx', area: 'Shell' },
]

export const FEATURE_AREAS: FeatureEntry['area'][] = [
  'Shell',
  'Tables',
  'Forms',
  'Auth & session',
  'Data & feedback',
  'Accessibility',
]

export function getFeature(id: number): FeatureEntry | undefined {
  return FEATURE_MANIFEST.find((feature) => feature.id === id)
}

export function filterFeatures(term: string, area: FeatureEntry['area'] | 'All'): FeatureEntry[] {
  const needle = term.trim().toLowerCase()
  return FEATURE_MANIFEST.filter((feature) => {
    if (area !== 'All' && feature.area !== area) return false
    if (!needle) return true
    return `${feature.id} ${feature.title} ${feature.detail} ${feature.file}`.toLowerCase().includes(needle)
  })
}
