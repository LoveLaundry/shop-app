import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Shirt,
  Ticket,
  Truck,
  UserRound,
  WashingMachine,
} from 'lucide-react'
import { appConfig } from '../config/app'
import { useAuth } from '../auth/AuthContext'
import { ThemeSwitcher } from '../ll-theme'
import {
  BackToTop,
  Drawer,
  IconButton,
  ScopeBadge,
  useFeature,
} from '../features/feature-pack'
import { friendlyRole, isActiveAssociation, relativeTime } from '../features/feature-pack/utils'
import { useLastLaundry, useScrolled, useSidebarCollapsed } from '../features/feature-pack/hooks'
import clsx from 'clsx'

const NAV_ICONS: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/orders': Package,
  '/gate-passes': Ticket,
  '/linens': Shirt,
  '/deliveries': Truck,
  '/invoices': FileText,
  '/bills': ReceiptText,
}

export function AppShell() {
  const { user, laundries, currentLaundry, switchLaundry, lastSignIn } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const [lastLaundry, setLastLaundry] = useLastLaundry()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const switchedRef = useRef(false)
  const scrolled = useScrolled()
  const { safeSignOut } = useFeature()

  // 5 — A route change always dismisses the mobile drawer.
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const activeLaundries = useMemo(() => laundries.filter(isActiveAssociation), [laundries])
  const canSwitch = activeLaundries.length > 1
  const scope = user?.clientName ?? activeLaundries.find((item) => item.laundry_id === currentLaundry)?.laundry_name ?? user?.laundry

  // 57 — Restore the last eligible laundry once associations are known.
  useEffect(() => {
    if (switchedRef.current || !lastLaundry || !activeLaundries.length) return
    if (currentLaundry && activeLaundries.some((item) => item.laundry_id === currentLaundry)) return
    const match = activeLaundries.find((item) => item.laundry_id === lastLaundry)
    if (!match || match.laundry_id === currentLaundry) return
    switchedRef.current = true
    void switchLaundry(match.laundry_id).catch(() => {
      setLastLaundry(null)
      switchedRef.current = false
    })
  }, [activeLaundries, currentLaundry, lastLaundry, setLastLaundry, switchLaundry])

  function isCurrent(path: string): boolean {
    return path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const navItems = (
    <>
      {appConfig.nav.map((item) => {
        const Icon = NAV_ICONS[item.path] ?? LayoutDashboard
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            aria-current={isCurrent(item.path) ? 'page' : undefined}
            title={item.blurb}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'is-active')}
            onClick={() => setDrawerOpen(false)}
          >
            <Icon aria-hidden="true" />
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        )
      })}
    </>
  )

  return (
    <div className={clsx('app-shell', collapsed && 'is-collapsed')}>
      <aside className="app-sidebar" aria-label="Workspace sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark" aria-hidden="true">
            <WashingMachine />
          </span>
          <p className="sidebar-title">{appConfig.title}</p>
          <IconButton
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            className="sidebar-collapse"
            onClick={() => setCollapsed((value) => !value)}
          />
        </div>

        <p className="sidebar-section">Workspace</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/about"
            aria-current={isCurrent('/about') ? 'page' : undefined}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'is-active')}
          >
            <Info aria-hidden="true" />
            <span className="sidebar-link-label">About this portal</span>
          </NavLink>
          <button type="button" onClick={safeSignOut} className="sidebar-link">
            <LogOut aria-hidden="true" />
            <span className="sidebar-link-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className={clsx('app-topbar', scrolled && 'fp-scrolled')}>
          <div className="topbar-main">
            <div className="topbar-title">
              <h1 title={appConfig.title}>{appConfig.title}</h1>
              <p className="topbar-subtitle" title={scope ?? appConfig.tagline}>{scope ?? appConfig.tagline}</p>
            </div>

            <div className="topbar-actions">
              <ScopeBadge scope={scope} role={user?.role} clientType={appConfig.clientType} />
              <ThemeSwitcher compact className="fp-topbar-theme" />

              {canSwitch ? (
                <label className="select-wrap">
                  <Building2 aria-hidden="true" />
                  <span className="sr-only">Laundry</span>
                  <select
                    value={currentLaundry ?? ''}
                    onChange={(event) => {
                      setLastLaundry(event.target.value)
                      void switchLaundry(event.target.value)
                    }}
                    className="field-input select-input scope-select"
                  >
                    {laundries
                      .slice()
                      .sort((a, b) => a.laundry_name.localeCompare(b.laundry_name))
                      .map((item) => (
                        <option key={item.laundry_id} value={item.laundry_id} disabled={!isActiveAssociation(item)}>
                          {item.laundry_name || item.laundry_id}
                          {isActiveAssociation(item) ? '' : ` (${item.status.toLowerCase()})`}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}

              <IconButton label="Open navigation menu" icon={Menu} onClick={() => setDrawerOpen(true)} className="fp-menu-trigger" />

              <div className="app-user">
                <span className="app-avatar" aria-hidden="true">
                  <UserRound />
                </span>
                <div className="user-meta">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-role">{friendlyRole(user?.role)}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mobile-nav" aria-label="Quick navigation">
            {appConfig.nav.map((item) => {
              const Icon = NAV_ICONS[item.path] ?? LayoutDashboard
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  aria-current={isCurrent(item.path) ? 'page' : undefined}
                  className={({ isActive }) => clsx('mobile-nav-link', isActive && 'is-active')}
                >
                  <Icon aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </header>

        <main className="app-main" id="main-content" tabIndex={-1}>
          {/* Switching laundry replaces the token and scope. Remount the routed
              page so no query or form from the previous tenant survives. */}
          <Outlet key={currentLaundry ?? 'none'} />
        </main>

        <footer className="app-footer">
          <div className="app-footer-inner">
            <span>
              Account portal · Signed in as {user?.name ?? 'user'}
              {lastSignIn ? ` · Last sign-in ${relativeTime(lastSignIn.at)}` : ''}
            </span>
            <NavLink to="/about" className="text-link" aria-current={isCurrent('/about') ? 'page' : undefined}>
              <Info aria-hidden="true" />
              About this portal
            </NavLink>
          </div>
        </footer>
      </div>

      <BackToTop />

      {/* 4 — The drawer uses the same focus trap as every other overlay. */}
      <Drawer open={drawerOpen} title="Navigation" onClose={() => setDrawerOpen(false)}>
        <p className="panel-note">Signed in as {user?.name ?? 'user'} · {friendlyRole(user?.role)}</p>
        <nav className="fp-drawer-nav" aria-label="Drawer navigation">
          {navItems}
          <NavLink to="/about" className={({ isActive }) => clsx('sidebar-link', isActive && 'is-active')} onClick={() => setDrawerOpen(false)}>
            <Info aria-hidden="true" />
            About this portal
          </NavLink>
        </nav>
        <div className="fp-drawer-actions">
          <button
            type="button"
            className="btn btn-secondary"
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={safeSignOut}><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </Drawer>
    </div>
  )
}
