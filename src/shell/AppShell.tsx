import { NavLink, Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Building2,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
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
  '/orders/new': PlusCircle,
  '/bills': ReceiptText,
  '/gate-passes': Ticket,
  '/linens': Shirt,
  '/deliveries': Truck,
  '/invoices': FileText,
}

export function AppShell() {
  const { user, signOut, laundries, currentLaundry, switchLaundry } = useAuth()
  const scope = user?.clientName ?? user?.laundry
  // Only shown when this login really belongs to more than one laundry; with a
  // single association a switch control would be dead UI.
  const canSwitch = laundries.length > 1

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-identity">
            <span className="app-mark" aria-hidden="true">
              <WashingMachine />
            </span>
            <div className="min-w-0">
              <p className="app-title">{appConfig.title}</p>
              {scope ? <p className="app-subtitle">{scope}</p> : null}
            </div>
          </div>
          <div className="app-header-actions">
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
              <div className="hidden text-right sm:block">
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '0.66rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  {user?.role}
                </p>
              </div>
            </div>
            <button type="button" onClick={signOut} className="btn btn-secondary" aria-label="Sign out">
              <LogOut />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <nav className="app-nav" aria-label="Main navigation">
          <div className="app-nav-inner">
            {appConfig.nav.map((item) => {
              const Icon = NAV_ICONS[item.path] ?? Activity
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => clsx('app-nav-link', isActive && 'is-active')}
                >
                  <Icon aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Operations portal · Signed in as {user?.name ?? 'user'}</span>
          <NavLink to="/about" className="text-link">
            <Info aria-hidden="true" />
            About this portal
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
