import { NavLink, Outlet } from 'react-router-dom'
import { appConfig } from '../config/app'
import { useAuth } from '../auth/AuthContext'
import clsx from 'clsx'

const initials = appConfig.title
  .split(/\s+/)
  .map((word) => word[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

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
              {initials}
            </span>
            <div className="min-w-0">
              <p className="app-title">{appConfig.title}</p>
              {scope ? <p className="app-subtitle">{scope}</p> : null}
            </div>
          </div>
          <div className="app-header-actions">
            {canSwitch ? (
              <label>
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
            <div className="hidden text-right sm:block">
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.68rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {user?.role}
              </p>
            </div>
            <button type="button" onClick={signOut} className="btn btn-secondary" aria-label="Sign out">
              Sign out
            </button>
          </div>
        </div>

        <nav className="app-nav" aria-label="Main navigation">
          <div className="app-nav-inner">
            {appConfig.nav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => clsx('app-nav-link', isActive && 'is-active')}
              >
                {item.label}
              </NavLink>
            ))}
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
            About this portal
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
