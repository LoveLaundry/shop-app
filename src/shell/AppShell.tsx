import { NavLink, Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Shirt,
  Ticket,
  Truck,
  UserRound,
  WashingMachine,
} from 'lucide-react'
import { appConfig } from '../config/app'
import { useAuth } from '../auth/AuthContext'
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

/** HOTEL_ADMIN -> Hotel admin, SHOP_STAFF -> Shop staff. */
function friendlyRole(role: string | undefined): string {
  if (!role) return 'Account'
  return role
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function AppShell() {
  const { user, signOut, laundries, currentLaundry, switchLaundry } = useAuth()
  const scope = user?.clientName ?? user?.laundry
  // Only shown when this login really belongs to more than one laundry; with a
  // single association a switch control would be dead UI.
  const canSwitch = laundries.length > 1

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark" aria-hidden="true">
            <WashingMachine />
          </span>
          <p className="sidebar-title">{appConfig.title}</p>
        </div>

        <p className="sidebar-section">Workspace</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {appConfig.nav.map((item) => {
            const Icon = NAV_ICONS[item.path] ?? LayoutDashboard
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => clsx('sidebar-link', isActive && 'is-active')}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/about"
            className={({ isActive }) => clsx('sidebar-link', isActive && 'is-active')}
          >
            <Info aria-hidden="true" />
            About this portal
          </NavLink>
          <button type="button" onClick={signOut} className="sidebar-link">
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <div className="topbar-main">
            <div className="topbar-title">
              <h1>{appConfig.title}</h1>
              <p className="topbar-subtitle">{scope ?? appConfig.tagline}</p>
            </div>

            <div className="topbar-actions">
              {canSwitch ? (
                <label className="select-wrap">
                  <Building2 aria-hidden="true" />
                  <span className="sr-only">Laundry</span>
                  <select
                    value={currentLaundry ?? ''}
                    onChange={(event) => void switchLaundry(event.target.value)}
                    className="field-input select-input scope-select"
                  >
                    {laundries.map((item) => (
                      <option key={item.laundry_id} value={item.laundry_id}>
                        {item.laundry_name || item.laundry_id}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

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

          <nav className="mobile-nav" aria-label="Main navigation">
            {appConfig.nav.map((item) => {
              const Icon = NAV_ICONS[item.path] ?? LayoutDashboard
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => clsx('mobile-nav-link', isActive && 'is-active')}
                >
                  <Icon aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
            <NavLink
              to="/about"
              className={({ isActive }) => clsx('mobile-nav-link', isActive && 'is-active')}
            >
              <Info aria-hidden="true" />
              About
            </NavLink>
            <button type="button" onClick={signOut} className="mobile-nav-link">
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </nav>
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div className="app-footer-inner">
            <span>Account portal · Signed in as {user?.name ?? 'user'}</span>
            <NavLink to="/about" className="text-link">
              <Info aria-hidden="true" />
              About this portal
            </NavLink>
          </div>
        </footer>
      </div>
    </div>
  )
}
