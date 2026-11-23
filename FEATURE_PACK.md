# Feature pack

100 concrete frontend features shipped in this standalone shop portal. The list is generated from `src/features/feature-pack/manifest.ts`, which also powers the in-app feature guide (/features or Ctrl/Cmd+Shift+F).

1. **Route document titles** — Syncs document.title with the active route label on every navigation. _Primary file: `src/features/feature-pack/hooks.ts`_
2. **Skip to content** — Adds a keyboard-first skip link that focuses the routed main landmark. _Primary file: `src/features/feature-pack/components.tsx`_
3. **Sticky header shadow** — Tracks scrolling and adds a restrained shadow to the sticky top bar. _Primary file: `src/features/feature-pack/hooks.ts`_
4. **Mobile drawer focus trap** — Keeps Tab focus inside the mobile navigation drawer while it is open. _Primary file: `src/features/feature-pack/hooks.ts`_
5. **Drawer closes on route change** — Dismisses the mobile drawer whenever the location changes. _Primary file: `src/shell/AppShell.tsx`_
6. **Current navigation item** — Exposes aria-current="page" on the active desktop and mobile links. _Primary file: `src/shell/AppShell.tsx`_
7. **Persisted collapsed sidebar** — Remembers the collapsed rail choice in local storage and restores it. _Primary file: `src/features/feature-pack/hooks.ts`_
8. **Back to top** — Shows a labelled control that scrolls the page back to the top only when needed. _Primary file: `src/features/feature-pack/components.tsx`_
9. **Route progress bar** — Runs a slim progress indicator across the top on each route change. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
10. **Command palette** — Ctrl/Cmd+K opens a searchable palette of navigation and display actions. _Primary file: `src/features/feature-pack/components.tsx`_
11. **Shortcut help** — Question-mark or palette action opens a dialog listing supported shortcuts. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
12. **Reduced motion** — Reads the OS preference and disables non-essential transitions and progress motion. _Primary file: `src/features/feature-pack/hooks.ts`_
13. **Debounced table search** — Delays table filtering by 200ms to avoid a filter per keystroke. _Primary file: `src/features/feature-pack/hooks.ts`_
14. **Status filter** — Filters table rows by a normalised status value with an all-statuses option. _Primary file: `src/features/feature-pack/components.tsx`_
15. **Date-range filter** — Applies inclusive from/to date bounds to rows that expose a date. _Primary file: `src/features/feature-pack/components.tsx`_
16. **Sortable columns** — Column headers toggle ascending and descending order with aria-sort. _Primary file: `src/features/feature-pack/components.tsx`_
17. **Column visibility** — A menu lets a user hide and restore optional table columns. _Primary file: `src/features/feature-pack/components.tsx`_
18. **Table density** — Toggles comfortable and compact row padding for data tables. _Primary file: `src/features/feature-pack/components.tsx`_
19. **Row selection** — Per-row checkboxes drive selection-aware bulk actions. _Primary file: `src/features/feature-pack/components.tsx`_
20. **Indeterminate select-all** — The header checkbox reflects none, some or all rows selected. _Primary file: `src/features/feature-pack/components.tsx`_
21. **Bulk action bar** — Shows selected count with export, copy-id and clear-selection actions. _Primary file: `src/features/feature-pack/components.tsx`_
22. **CSV export** — Downloads the visible rows as escaped CSV with a readable header row. _Primary file: `src/features/feature-pack/utils.ts`_
23. **JSON export** — Downloads the visible rows as indented JSON for handoff or debugging. _Primary file: `src/features/feature-pack/utils.ts`_
24. **Copy row ID** — Copies a row identifier to the clipboard and confirms with a toast. _Primary file: `src/features/feature-pack/components.tsx`_
25. **Page-size selector** — Chooses 10, 25 or 50 rows per page and resets to a valid page. _Primary file: `src/features/feature-pack/components.tsx`_
26. **Pagination range clamp** — Clamps stale page numbers and displays the true start–end range. _Primary file: `src/features/feature-pack/utils.ts`_
27. **Sticky table header** — Keeps the table header visible while long result sets scroll. _Primary file: `src/index.css`_
28. **Responsive card fallback** — Renders the same rows as labelled cards on narrow screens. _Primary file: `src/features/feature-pack/components.tsx`_
29. **Empty state action** — Shows a contextual message and a real next action when there are no rows. _Primary file: `src/features/feature-pack/components.tsx`_
30. **Skeleton loading rows** — Renders shape-preserving skeleton rows instead of a blank table. _Primary file: `src/features/feature-pack/components.tsx`_
31. **Inline error and retry** — Keeps the table in place while showing a normalised error and retry button. _Primary file: `src/features/feature-pack/components.tsx`_
32. **Row detail drawer** — Opens a focus-trapped side drawer with full row detail and Escape to close. _Primary file: `src/features/feature-pack/components.tsx`_
33. **Required-field markers** — Marks required fields visually and announces them to assistive tech. _Primary file: `src/features/feature-pack/components.tsx`_
34. **Blur validation** — Validates a field when it loses focus, not only on submit. _Primary file: `src/features/feature-pack/hooks.ts`_
35. **Valid-gated submit** — Disables the send action until every visible line is valid. _Primary file: `src/pages/NewOrderPage.tsx`_
36. **Submit-once guard** — Locks a form immediately on submit so double clicks cannot rewrite data. _Primary file: `src/features/feature-pack/hooks.ts`_
37. **Draft autosave** — Persists the in-progress order locally after each edit. _Primary file: `src/features/feature-pack/hooks.ts`_
38. **Draft restore banner** — Offers Restore or Discard for a draft left by an earlier visit. _Primary file: `src/features/feature-pack/components.tsx`_
39. **Reset form** — Restores a clean single-line form after confirmation. _Primary file: `src/pages/NewOrderPage.tsx`_
40. **Character counter** — Shows used and remaining characters on bounded text fields. _Primary file: `src/features/feature-pack/components.tsx`_
41. **Currency formatting** — Formats money with en-LK conventions and a visible currency code. _Primary file: `src/features/feature-pack/utils.ts`_
42. **Number formatting** — Formats counts with locale grouping and non-finite fallbacks. _Primary file: `src/features/feature-pack/utils.ts`_
43. **Date formatting** — Formats API dates consistently and keeps raw values when unparsable. _Primary file: `src/features/feature-pack/utils.ts`_
44. **Duplicate-row detection** — Warns about repeated item names before an order is sent. _Primary file: `src/pages/NewOrderPage.tsx`_
45. **Field help tooltips** — Adds hover and focus help text to fields that need explanation. _Primary file: `src/features/feature-pack/components.tsx`_
46. **Optimistic create** — Queues a new order in the shell, navigates immediately and reconciles the result. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
47. **Confirm destructive dialog** — Requires confirmation before removing lines or ending a session. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
48. **Success toasts** — Shows short polite or alert toasts for completed actions and failures. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
49. **Normalised errors** — Converts HTTP, timeout and network failures into one calm message format. _Primary file: `src/features/feature-pack/utils.ts`_
50. **Multi-step progress** — Shows Lines, Review and Send progress with a real step gate. _Primary file: `src/pages/NewOrderPage.tsx`_
51. **Collapsible sections** — Lets users collapse optional order notes without losing content. _Primary file: `src/features/feature-pack/components.tsx`_
52. **Autosave indicator** — Reports Saved, Saving and Draft restored states next to the form heading. _Primary file: `src/features/feature-pack/components.tsx`_
53. **Multi-laundry choice** — Keeps the 409 choice screen with distinct, scoped laundry candidates. _Primary file: `src/auth/LoginPage.tsx`_
54. **Suspended association** — Disables suspended choices and switch options after status normalisation. _Primary file: `src/features/feature-pack/utils.ts`_
55. **Role-specific labels** — Shows shop admin or shop staff labels and rejects generic roles. _Primary file: `src/features/feature-pack/utils.ts`_
56. **Switch without reload** — Exchanges the token, clears the old cache and remounts scoped pages. _Primary file: `src/auth/AuthContext.tsx`_
57. **Remember last laundry** — Restores the most recently used eligible laundry after sign-in. _Primary file: `src/features/feature-pack/hooks.ts`_
58. **Clear session on 401** — Broadcasts a 401 event so caches and UI are cleared with the token. _Primary file: `src/api/client.ts`_
59. **Session expiry warning** — Warns shortly before token expiry with sign-out and refresh actions. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
60. **Show or hide password** — Toggles password visibility with a labelled icon button. _Primary file: `src/features/feature-pack/components.tsx`_
61. **Password strength meter** — Scores the entered sign-in password and lists concrete improvements. _Primary file: `src/features/feature-pack/components.tsx`_
62. **Registration validation** — Validates access-request fields and builds a copyable request summary. _Primary file: `src/auth/RegisterPage.tsx`_
63. **Fixed clientType** — Pins clientType to SHOP in config and in the login request body. _Primary file: `src/config/app.ts`_
64. **Safe exit action** — Offers a clear exit from non-portal pages without a support-mode concept. _Primary file: `src/auth/RegisterPage.tsx`_
65. **Scope badge** — Displays the active laundry account and SHOP scope in the top bar. _Primary file: `src/features/feature-pack/components.tsx`_
66. **Safe sign-out** — Confirms sign-out, clears scoped caches and returns to the login screen. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
67. **Last sign-in info** — Records and shows the previous successful sign-in time and account. _Primary file: `src/pages/TodayPage.tsx`_
68. **Live regions** — Announces route, save and queue state changes through aria-live regions. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
69. **Focus-visible rings** — Applies a consistent visible focus outline across all interactive controls. _Primary file: `src/index.css`_
70. **Labelled icon buttons** — Requires an accessible label on every icon-only control. _Primary file: `src/features/feature-pack/components.tsx`_
71. **Keyboard row activation** — Enter or Space opens the detail drawer for a focused table row. _Primary file: `src/features/feature-pack/components.tsx`_
72. **Escape closes overlays** — A shared Escape handler closes drawers, dialogs, menus and the palette. _Primary file: `src/features/feature-pack/hooks.ts`_
73. **Focus restoration** — Returns focus to the triggering control when an overlay closes. _Primary file: `src/features/feature-pack/hooks.ts`_
74. **Screen-reader text** — Adds sr-only labels to icon controls, filters and landmark links. _Primary file: `src/features/feature-pack/components.tsx`_
75. **High-contrast mode** — Persists a high-contrast display mode that strengthens borders and text. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
76. **Large-text mode** — Persists a larger base font size without changing the type scale. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
77. **Truncated-text tooltip** — Shows a native tooltip only when a value is actually shortened. _Primary file: `src/features/feature-pack/components.tsx`_
78. **Semantic landmarks** — Wraps routed content in labelled main, navigation, header and footer landmarks. _Primary file: `src/shell/AppShell.tsx`_
79. **Table captions** — Gives every data table an accessible caption describing its contents. _Primary file: `src/features/feature-pack/components.tsx`_
80. **Form error summary** — Lists field errors at the top of a form with links back to each field. _Primary file: `src/features/feature-pack/components.tsx`_
81. **Skip pagination link** — Adds a keyboard link from the table body to the pagination controls. _Primary file: `src/features/feature-pack/components.tsx`_
82. **Refresh and search keys** — R reloads page data and / focuses the table search outside text fields. _Primary file: `src/features/feature-pack/hooks.ts`_
83. **Normalised item arrays** — Treats null, wrapped or missing item collections as an empty array. _Primary file: `src/features/feature-pack/utils.ts`_
84. **Nested item totals** — Aggregates nested order items once for sent and received counts. _Primary file: `src/features/feature-pack/utils.ts`_
85. **Stale-while-revalidate** — Shows cached scoped data instantly while a quiet refresh is in flight. _Primary file: `src/features/feature-pack/hooks.ts`_
86. **Backoff retries** — Retries retryable request failures with capped exponential delays. _Primary file: `src/features/feature-pack/hooks.ts`_
87. **Timeout messaging** — Explains aborted requests separately from other network failures. _Primary file: `src/features/feature-pack/utils.ts`_
88. **Offline indicator** — Shows a persistent, non-alarming offline status in the shell. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
89. **Queued action indicator** — Counts optimistic writes waiting for the server in the shell. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
90. **Session-scoped cache** — Includes the session token in every cache key to isolate tenants. _Primary file: `src/features/feature-pack/utils.ts`_
91. **Cache clear on sign-out** — Drops all scoped cached responses when the session ends. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
92. **Last-updated stamp** — Displays when page data was last fetched using a relative timestamp. _Primary file: `src/features/feature-pack/components.tsx`_
93. **Refresh page data** — Provides a labelled refresh control and R shortcut on data pages. _Primary file: `src/features/feature-pack/hooks.ts`_
94. **Error boundary reset** — Catches render failures and offers a reset that stays inside the portal. _Primary file: `src/features/feature-pack/components.tsx`_
95. **Response size guard** — Rejects unexpectedly large API payloads before they reach a page. _Primary file: `src/features/feature-pack/hooks.ts`_
96. **Idempotency keys** — Adds a stable key header to order writes so retries cannot duplicate them. _Primary file: `src/features/feature-pack/utils.ts`_
97. **Rapid-submit dedupe** — Drops repeat submits while an identical request is still in flight. _Primary file: `src/features/feature-pack/hooks.ts`_
98. **Notification badge** — Shows a count badge derived from current page and queue notifications. _Primary file: `src/features/feature-pack/components.tsx`_
99. **Notification dialog** — Lists notification details in an accessible dialog with clear actions. _Primary file: `src/features/feature-pack/FeatureProvider.tsx`_
100. **Feature manifest panel** — Lists all shipped features with search, area filter and source paths. _Primary file: `src/features/feature-pack/FeaturePanel.tsx`_

## Notes

- Uses the existing theme, fonts, photography, tokens and Lucide icons; no dependencies were added.
- Shop-scoped auth only: /client/auth/login, clientType SHOP, SHOP_ADMIN / SHOP_STAFF display roles.
- Session data stays under ll_shop_session; no client token is passed to laundry routes or /today.
- Shop Orders received counts continue to derive from items[].received_qty.

## Current platform state — unified theme sync (2026-11-23)

- The 100-item catalogue above is unchanged; the in-app guide still lists the same 100 paths.
- `src/ll-theme.tsx` and `src/ll-design-tokens.css` are now synced from the authoritative
  `system-manegment/quotations-ui` checkout, giving the shop portal the same 20
  contrast-checked light/dark themes, no-blue five-colour palette, semantic aliases,
  sidebar contrast fix and print styles as the manager UI.
- `index.html` applies the stored theme (`lovelaundry-theme`, with legacy `theme-preset`
  migration) to `<html data-theme>` before first paint; a compact `ThemeSwitcher` in the
  top bar changes it at runtime.
- Feature-pack high-contrast / large-text / reduced-motion toggles remain effective under
  every theme through an `html:root[data-contrast='high']` compatibility block.
- Verified locally: `npm run build` (`tsc --noEmit` + Vite) and `npm test` (**9/9 passed**).
  Node 20.16 is below Vite 8's recommended 20.19+, so the build prints an engine warning only.
